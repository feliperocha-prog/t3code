/**
 * ChangesExplanation - plain-language explanation of the patch shown in the diff panel.
 *
 * Explanations are cached in memory (bounded, oldest out) by a hash of the prompt version, the
 * text generation model and the patch, so reopening the same changes costs no generation.
 * Concurrent requests for the same patch share one in-flight generation. One instance lives in
 * the server runtime; the WebSocket layer is built per connection and must not own the cache.
 *
 * @module ChangesExplanation
 */
import * as NodeCrypto from "node:crypto";

import {
  type ChangesExplanation as ChangesExplanationSchema,
  ChangesExplanationError,
  type ChangesExplanationInput,
  type ChangesExplanationRisk,
  type ModelSelection,
} from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";

import { ServerConfig } from "../config.ts";
import * as ServerSettings from "../serverSettings.ts";
import {
  TextGeneration,
  type ChangesExplanationGenerationResult,
} from "../textGeneration/TextGeneration.ts";
import { changesExplanationDiffIsTruncated } from "../textGeneration/TextGenerationPrompts.ts";

/** Bump when the explanation prompt or normalization changes, so cached explanations are ignored. */
export const CHANGES_EXPLANATION_PROMPT_VERSION = "1";

export const CHANGES_EXPLANATION_CACHE_MAX_ENTRIES = 32;

const SUMMARY_MAX_CHARS = 600;
const ITEM_MAX_CHARS = 200;
const FILES_MAX_ITEMS = 20;
const ATTENTION_MAX_ITEMS = 3;
const ERROR_DETAIL_MAX_CHARS = 300;

type ChangesExplanationValue = ChangesExplanationSchema;

export class ChangesExplanation extends Context.Service<
  ChangesExplanation,
  {
    /**
     * Returns the cached explanation for this patch and model, or generates one. A
     * `refreshNonce` skips the cache read and regenerates.
     */
    readonly explain: (
      input: ChangesExplanationInput,
    ) => Effect.Effect<ChangesExplanationValue, ChangesExplanationError>;
  }
>()("t3/changesExplanation/ChangesExplanation") {}

const clip = (value: string, max: number) => value.trim().slice(0, max).trimEnd();

const RISKS: ReadonlyArray<ChangesExplanationRisk> = ["low", "medium", "high"];

const normalizeRisk = (risk: string): ChangesExplanationRisk => {
  const value = risk.trim().toLowerCase();
  return RISKS.find((candidate) => candidate === value) ?? "low";
};

export const normalizeChangesExplanation = (
  generated: ChangesExplanationGenerationResult,
): Pick<ChangesExplanationValue, "summary" | "files" | "attention"> => ({
  summary: clip(generated.summary, SUMMARY_MAX_CHARS),
  files: generated.files
    .map((file) => ({
      path: file.path.trim(),
      what: clip(file.what, ITEM_MAX_CHARS),
      risk: normalizeRisk(file.risk),
    }))
    .filter((file) => file.path.length > 0)
    .slice(0, FILES_MAX_ITEMS),
  attention: generated.attention
    .map((item) => clip(item, ITEM_MAX_CHARS))
    .filter((item) => item.length > 0)
    .slice(0, ATTENTION_MAX_ITEMS),
});

export const changesExplanationCacheKey = (input: {
  readonly instanceId: string;
  readonly model: string;
  readonly diff: string;
}) =>
  NodeCrypto.createHash("sha256")
    .update(
      `${CHANGES_EXPLANATION_PROMPT_VERSION}\n${input.instanceId}:${input.model}\n${input.diff}`,
    )
    .digest("hex");

const explanationError = (detail: string) =>
  new ChangesExplanationError({ detail: clip(detail, ERROR_DETAIL_MAX_CHARS) });

export const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const config = yield* ServerConfig;
  const settingsService = yield* ServerSettings.ServerSettingsService;
  const textGeneration = yield* TextGeneration;

  const workingDirectory = path.join(config.stateDir, "changes-explanations");
  const cache = new Map<string, ChangesExplanationValue>();
  const inflight = new Map<
    string,
    Deferred.Deferred<ChangesExplanationValue, ChangesExplanationError>
  >();

  const remember = (key: string, explanation: ChangesExplanationValue) => {
    // Re-inserted so a regenerated entry counts as the newest; Map keeps insertion order.
    cache.delete(key);
    cache.set(key, explanation);
    while (cache.size > CHANGES_EXPLANATION_CACHE_MAX_ENTRIES) {
      const oldest = cache.keys().next();
      if (oldest.done === true) break;
      cache.delete(oldest.value);
    }
  };

  const generateFresh = Effect.fn("ChangesExplanation.generateFresh")(function* (
    key: string,
    diff: string,
    modelSelection: ModelSelection,
  ) {
    yield* fs
      .makeDirectory(workingDirectory, { recursive: true })
      .pipe(
        Effect.mapError(() => explanationError("Could not prepare the explanation workspace.")),
      );
    const generated = yield* textGeneration
      .explainChanges({
        // The provider only needs a working directory; this one holds nothing from the project,
        // so the model reads only the patch it is given.
        cwd: workingDirectory,
        diff,
        modelSelection,
      })
      .pipe(Effect.mapError((error) => explanationError(error.detail)));
    const explanation: ChangesExplanationValue = {
      ...normalizeChangesExplanation(generated),
      truncated: changesExplanationDiffIsTruncated(diff),
      generatedAt: DateTime.formatIso(yield* DateTime.now),
    };
    remember(key, explanation);
    return explanation;
  });

  const explain = Effect.fn("ChangesExplanation.explain")(function* (
    input: ChangesExplanationInput,
  ) {
    const settings = yield* settingsService.getSettings.pipe(
      Effect.mapError(() => explanationError("Could not read the text generation settings.")),
    );
    const modelSelection = settings.textGenerationModelSelection;
    const key = changesExplanationCacheKey({
      instanceId: modelSelection.instanceId,
      model: modelSelection.model,
      diff: input.diff,
    });

    if (input.refreshNonce === undefined) {
      const cached = cache.get(key);
      if (cached !== undefined) return cached;
    }

    const deferred = yield* Effect.uninterruptible(
      Effect.gen(function* () {
        const existing = inflight.get(key);
        if (existing !== undefined) return existing;

        // Enrollment and detached-fiber creation must be atomic, so a canceled first caller
        // cannot leave a Deferred that nothing completes.
        const created = Deferred.makeUnsafe<ChangesExplanationValue, ChangesExplanationError>();
        inflight.set(key, created);
        // Detached so a client that leaves does not cancel the generation others await; a
        // finished generation still warms the cache. Interruptible again inside the fork, so
        // the provider timeout can still cancel a hung CLI.
        yield* Effect.interruptible(generateFresh(key, input.diff, modelSelection)).pipe(
          Effect.onExit((exit) =>
            Effect.sync(() => inflight.delete(key)).pipe(
              Effect.andThen(Deferred.done(created, exit)),
            ),
          ),
          Effect.forkDetach,
        );
        return created;
      }),
    );
    return yield* Deferred.await(deferred);
  });

  return ChangesExplanation.of({ explain });
});

export const layer = Layer.effect(ChangesExplanation, make);
