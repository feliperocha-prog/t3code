/**
 * ProjectBrief - AI summary of a project's hub note.
 *
 * Briefs are cached on disk by a hash of the prompt version, the text generation model and the
 * note, so reopening a project with an unchanged note costs no generation. Concurrent requests
 * for the same note share one in-flight generation. One instance lives in the server runtime;
 * the WebSocket layer is built per connection and must not own the in-flight map.
 *
 * @module ProjectBrief
 */
import * as NodeCrypto from "node:crypto";

import {
  type ModelSelection,
  ProjectBrief as ProjectBriefSchema,
  ProjectBriefError,
  type ProjectBriefInput,
} from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";

import { writeFileStringAtomically } from "../atomicWrite.ts";
import { ServerConfig } from "../config.ts";
import * as ServerSettings from "../serverSettings.ts";
import { TextGeneration } from "../textGeneration/TextGeneration.ts";

/** Bump when the brief prompt or normalization changes, so stale cached briefs are ignored. */
export const PROJECT_BRIEF_PROMPT_VERSION = "1";

const WHERE_MAX_CHARS = 600;
const ITEM_MAX_CHARS = 200;
const NEXT_MAX_ITEMS = 4;
const RISKS_MAX_ITEMS = 3;
const ERROR_DETAIL_MAX_CHARS = 300;

type ProjectBriefValue = typeof ProjectBriefSchema.Type;

const ProjectBriefJson = Schema.fromJsonString(ProjectBriefSchema);
const decodeCachedBrief = Schema.decodeUnknownEffect(ProjectBriefJson);
const encodeBrief = Schema.encodeEffect(ProjectBriefJson);

export class ProjectBrief extends Context.Service<
  ProjectBrief,
  {
    /**
     * Returns the cached brief for this note and model, or generates one. A `refreshNonce`
     * skips the cache read and regenerates.
     */
    readonly generate: (
      input: ProjectBriefInput,
    ) => Effect.Effect<ProjectBriefValue, ProjectBriefError>;
  }
>()("t3/projectBrief/ProjectBrief") {}

const clip = (value: string, max: number) => value.trim().slice(0, max).trimEnd();

const normalizeItems = (items: ReadonlyArray<string>, maxItems: number) =>
  items
    .map((item) => clip(item, ITEM_MAX_CHARS))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);

export const projectBriefCacheKey = (input: {
  readonly instanceId: string;
  readonly model: string;
  readonly noteContents: string;
}) =>
  NodeCrypto.createHash("sha256")
    .update(
      `${PROJECT_BRIEF_PROMPT_VERSION}\n${input.instanceId}:${input.model}\n${input.noteContents}`,
    )
    .digest("hex");

const briefError = (detail: string) =>
  new ProjectBriefError({ detail: clip(detail, ERROR_DETAIL_MAX_CHARS) });

export const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const config = yield* ServerConfig;
  const settingsService = yield* ServerSettings.ServerSettingsService;
  const textGeneration = yield* TextGeneration;

  const cacheDirectory = path.join(config.stateDir, "project-briefs");
  const cachePath = (key: string) => path.join(cacheDirectory, `${key}.json`);
  const inflight = new Map<string, Deferred.Deferred<ProjectBriefValue, ProjectBriefError>>();

  const readCached = (key: string) =>
    fs.readFileString(cachePath(key)).pipe(
      Effect.flatMap(decodeCachedBrief),
      // Missing or unreadable cache is a miss; the brief is regenerated and rewritten.
      Effect.option,
    );

  const writeCached = (key: string, brief: ProjectBriefValue) =>
    encodeBrief(brief).pipe(
      Effect.flatMap((contents) =>
        writeFileStringAtomically({ filePath: cachePath(key), contents }),
      ),
      Effect.provideService(FileSystem.FileSystem, fs),
      Effect.provideService(Path.Path, path),
      Effect.catchCause((cause) =>
        Effect.logWarning("project brief cache write failed", { key, cause }),
      ),
    );

  const generateFresh = Effect.fn("ProjectBrief.generateFresh")(function* (
    key: string,
    noteContents: string,
    modelSelection: ModelSelection,
  ) {
    yield* fs
      .makeDirectory(cacheDirectory, { recursive: true })
      .pipe(Effect.mapError(() => briefError("Could not prepare the project brief cache.")));
    const generated = yield* textGeneration
      .generateProjectBrief({
        // The provider only needs a working directory; the cache directory holds nothing
        // from the project itself.
        cwd: cacheDirectory,
        noteContents,
        modelSelection,
      })
      .pipe(Effect.mapError((error) => briefError(error.detail)));
    const brief: ProjectBriefValue = {
      where: clip(generated.where, WHERE_MAX_CHARS),
      next: normalizeItems(generated.next, NEXT_MAX_ITEMS),
      risks: normalizeItems(generated.risks, RISKS_MAX_ITEMS),
      generatedAt: DateTime.formatIso(yield* DateTime.now),
    };
    yield* writeCached(key, brief);
    return brief;
  });

  const generate = Effect.fn("ProjectBrief.generate")(function* (input: ProjectBriefInput) {
    const settings = yield* settingsService.getSettings.pipe(
      Effect.mapError(() => briefError("Could not read the text generation settings.")),
    );
    const modelSelection = settings.textGenerationModelSelection;
    const key = projectBriefCacheKey({
      instanceId: modelSelection.instanceId,
      model: modelSelection.model,
      noteContents: input.noteContents,
    });

    if (input.refreshNonce === undefined) {
      const cached = yield* readCached(key);
      if (cached._tag === "Some") return cached.value;
    }

    const deferred = yield* Effect.uninterruptible(
      Effect.gen(function* () {
        const existing = inflight.get(key);
        if (existing !== undefined) return existing;

        // Enrollment and detached-fiber creation must be atomic, so a canceled first caller
        // cannot leave a Deferred that nothing completes.
        const created = Deferred.makeUnsafe<ProjectBriefValue, ProjectBriefError>();
        inflight.set(key, created);
        // Detached so a client that leaves does not cancel the generation others await; a
        // finished generation still warms the cache. Interruptible again inside the fork, so
        // the provider timeout can still cancel a hung CLI.
        yield* Effect.interruptible(generateFresh(key, input.noteContents, modelSelection)).pipe(
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

  return ProjectBrief.of({ generate });
});

export const layer = Layer.effect(ProjectBrief, make);
