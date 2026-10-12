import * as NodeServices from "@effect/platform-node/NodeServices";
import { TextGenerationError } from "@t3tools/contracts";
import { it } from "@effect/vitest";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import { describe, expect } from "vite-plus/test";

import * as ServerConfig from "../config.ts";
import * as ServerSettings from "../serverSettings.ts";
import {
  TextGeneration,
  type ChangesExplanationGenerationResult,
} from "../textGeneration/TextGeneration.ts";
import { CHANGES_EXPLANATION_DIFF_PROMPT_MAX_CHARS } from "../textGeneration/TextGenerationPrompts.ts";
import * as ChangesExplanation from "./ChangesExplanation.ts";

const makeLayer = (explainChanges: TextGeneration["Service"]["explainChanges"]) =>
  ChangesExplanation.layer.pipe(
    Layer.provideMerge(Layer.mock(TextGeneration)({ explainChanges })),
    Layer.provideMerge(ServerSettings.layerTest({})),
    Layer.provideMerge(
      ServerConfig.layerTest(process.cwd(), { prefix: "t3-changes-explanation-" }),
    ),
    Layer.provideMerge(NodeServices.layer),
  );

const countingGenerator = (result: ChangesExplanationGenerationResult) => {
  const calls: string[] = [];
  const generate: TextGeneration["Service"]["explainChanges"] = (input) =>
    Effect.sync(() => {
      calls.push(input.diff);
      return result;
    });
  return { calls, generate };
};

const EXPLANATION = {
  summary: "Ajusta o texto do botão de compra.",
  files: [{ path: "src/Buy.tsx", what: "Troca o texto do botão.", risk: "low" }],
  attention: ["Abrir a página do produto e conferir o botão"],
};

describe("ChangesExplanation", () => {
  it.effect("serves an unchanged patch from the cache without generating again", () => {
    const generator = countingGenerator(EXPLANATION);
    return Effect.gen(function* () {
      const explanations = yield* ChangesExplanation.ChangesExplanation;
      const first = yield* explanations.explain({ diff: "diff --git a/x b/x" });
      const second = yield* explanations.explain({ diff: "diff --git a/x b/x" });

      expect(generator.calls).toHaveLength(1);
      expect(second).toEqual(first);
      expect(first).toMatchObject({ ...EXPLANATION, truncated: false });
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("regenerates when a refresh nonce is sent and when the patch changes", () => {
    const generator = countingGenerator(EXPLANATION);
    return Effect.gen(function* () {
      const explanations = yield* ChangesExplanation.ChangesExplanation;
      yield* explanations.explain({ diff: "a" });
      yield* explanations.explain({ diff: "a", refreshNonce: 1 });
      yield* explanations.explain({ diff: "b" });

      expect(generator.calls).toEqual(["a", "a", "b"]);
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("keeps at most 32 explanations, dropping the oldest", () => {
    const generator = countingGenerator(EXPLANATION);
    return Effect.gen(function* () {
      const explanations = yield* ChangesExplanation.ChangesExplanation;
      for (
        let index = 0;
        index <= ChangesExplanation.CHANGES_EXPLANATION_CACHE_MAX_ENTRIES;
        index++
      ) {
        yield* explanations.explain({ diff: `patch ${index}` });
      }
      yield* explanations.explain({ diff: "patch 32" });
      yield* explanations.explain({ diff: "patch 0" });

      expect(generator.calls).toHaveLength(
        ChangesExplanation.CHANGES_EXPLANATION_CACHE_MAX_ENTRIES + 2,
      );
      expect(generator.calls.at(-1)).toBe("patch 0");
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("narrows risk, drops pathless files and bounds what the model returns", () => {
    const generator = countingGenerator({
      summary: `  ${"s".repeat(700)}  `,
      files: [
        { path: " a.ts ", what: `  ${"w".repeat(250)} `, risk: "HIGH" },
        { path: "b.ts", what: "x", risk: "critical" },
        { path: "   ", what: "sem caminho", risk: "medium" },
        ...Array.from({ length: 25 }, (_, index) => ({
          path: `f${index}.ts`,
          what: "y",
          risk: "medium",
        })),
      ],
      attention: ["  um  ", "", "dois", "tres", "quatro"],
    });
    return Effect.gen(function* () {
      const explanation = yield* (yield* ChangesExplanation.ChangesExplanation).explain({
        diff: "d",
      });

      expect(explanation.summary).toBe("s".repeat(600));
      expect(explanation.files).toHaveLength(20);
      expect(explanation.files[0]).toEqual({ path: "a.ts", what: "w".repeat(200), risk: "high" });
      expect(explanation.files[1]?.risk).toBe("low");
      expect(explanation.files.some((file) => file.what === "sem caminho")).toBe(false);
      expect(explanation.attention).toEqual(["um", "dois", "tres"]);
      expect(Number.isNaN(Date.parse(explanation.generatedAt))).toBe(false);
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("marks the explanation as truncated when the patch exceeds the prompt limit", () => {
    const generator = countingGenerator(EXPLANATION);
    return Effect.gen(function* () {
      const explanation = yield* (yield* ChangesExplanation.ChangesExplanation).explain({
        diff: "x".repeat(CHANGES_EXPLANATION_DIFF_PROMPT_MAX_CHARS + 1),
      });

      expect(explanation.truncated).toBe(true);
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("shares one in-flight generation between concurrent requests", () => {
    const calls: string[] = [];
    const started = Deferred.makeUnsafe<void>();
    const release = Deferred.makeUnsafe<void>();
    const generate: TextGeneration["Service"]["explainChanges"] = (input) =>
      Effect.gen(function* () {
        calls.push(input.diff);
        yield* Deferred.succeed(started, undefined);
        yield* Deferred.await(release);
        return EXPLANATION;
      });
    return Effect.gen(function* () {
      const explanations = yield* ChangesExplanation.ChangesExplanation;
      // Both skip the cache, so only the in-flight map can keep this to one generation.
      const first = yield* explanations
        .explain({ diff: "d", refreshNonce: 1 })
        .pipe(Effect.forkChild({ startImmediately: true }));
      yield* Deferred.await(started);
      const second = yield* explanations
        .explain({ diff: "d", refreshNonce: 2 })
        .pipe(Effect.forkChild({ startImmediately: true }));
      yield* Deferred.succeed(release, undefined);

      const [a, b] = yield* Fiber.joinAll([first, second]);
      expect(calls).toHaveLength(1);
      expect(b).toEqual(a);
    }).pipe(Effect.provide(makeLayer(generate)));
  });

  it.effect("reports a generation failure as a short ChangesExplanationError", () =>
    Effect.gen(function* () {
      const error = yield* (yield* ChangesExplanation.ChangesExplanation)
        .explain({ diff: "d" })
        .pipe(Effect.flip);

      expect(error._tag).toBe("ChangesExplanationError");
      expect(error.detail).toBe("Provider is not signed in.");
    }).pipe(
      Effect.provide(
        makeLayer(() =>
          Effect.fail(
            new TextGenerationError({
              operation: "explainChanges",
              detail: "  Provider is not signed in.  ",
            }),
          ),
        ),
      ),
    ),
  );
});
