import * as NodeServices from "@effect/platform-node/NodeServices";
import { TextGenerationError } from "@t3tools/contracts";
import { it } from "@effect/vitest";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import { describe, expect } from "vite-plus/test";

import * as ServerConfig from "../config.ts";
import * as ServerSettings from "../serverSettings.ts";
import {
  TextGeneration,
  type ProjectBriefGenerationResult,
} from "../textGeneration/TextGeneration.ts";
import * as ProjectBrief from "./ProjectBrief.ts";

const makeLayer = (generateProjectBrief: TextGeneration["Service"]["generateProjectBrief"]) =>
  ProjectBrief.layer.pipe(
    Layer.provideMerge(Layer.mock(TextGeneration)({ generateProjectBrief })),
    Layer.provideMerge(ServerSettings.layerTest({})),
    Layer.provideMerge(ServerConfig.layerTest(process.cwd(), { prefix: "t3-project-brief-" })),
    Layer.provideMerge(NodeServices.layer),
  );

const countingGenerator = (result: ProjectBriefGenerationResult) => {
  const calls: string[] = [];
  const generate: TextGeneration["Service"]["generateProjectBrief"] = (input) =>
    Effect.sync(() => {
      calls.push(input.noteContents);
      return result;
    });
  return { calls, generate };
};

const BRIEF = { where: "Landing B2B no ar.", next: ["Medir conversão"], risks: [] };

describe("ProjectBrief", () => {
  it.effect("serves an unchanged note from the cache without generating again", () => {
    const generator = countingGenerator(BRIEF);
    return Effect.gen(function* () {
      const briefs = yield* ProjectBrief.ProjectBrief;
      const first = yield* briefs.generate({ noteContents: "## Estado\nok" });
      const second = yield* briefs.generate({ noteContents: "## Estado\nok" });

      expect(generator.calls).toHaveLength(1);
      expect(second).toEqual(first);
      expect(first).toMatchObject(BRIEF);

      const config = yield* ServerConfig.ServerConfig;
      const settings = yield* (yield* ServerSettings.ServerSettingsService).getSettings;
      const key = ProjectBrief.projectBriefCacheKey({
        instanceId: settings.textGenerationModelSelection.instanceId,
        model: settings.textGenerationModelSelection.model,
        noteContents: "## Estado\nok",
      });
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;
      expect(yield* fs.exists(path.join(config.stateDir, "project-briefs", `${key}.json`))).toBe(
        true,
      );
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("regenerates when a refresh nonce is sent and when the note changes", () => {
    const generator = countingGenerator(BRIEF);
    return Effect.gen(function* () {
      const briefs = yield* ProjectBrief.ProjectBrief;
      yield* briefs.generate({ noteContents: "nota" });
      yield* briefs.generate({ noteContents: "nota", refreshNonce: 1 });
      yield* briefs.generate({ noteContents: "nota editada" });

      expect(generator.calls).toEqual(["nota", "nota", "nota editada"]);
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("trims and bounds what the model returns", () => {
    const generator = countingGenerator({
      where: `  ${"w".repeat(700)}  `,
      next: ["  um  ", "", "   ", "dois", "tres", "quatro", "cinco", "x".repeat(250)],
      risks: ["a", "b", "c", "d"],
    });
    return Effect.gen(function* () {
      const brief = yield* (yield* ProjectBrief.ProjectBrief).generate({ noteContents: "n" });

      expect(brief.where).toBe("w".repeat(600));
      expect(brief.next).toEqual(["um", "dois", "tres", "quatro"]);
      expect(brief.risks).toEqual(["a", "b", "c"]);
      expect(Number.isNaN(Date.parse(brief.generatedAt))).toBe(false);
    }).pipe(Effect.provide(makeLayer(generator.generate)));
  });

  it.effect("shares one in-flight generation between concurrent requests", () => {
    const calls: string[] = [];
    const started = Deferred.makeUnsafe<void>();
    const release = Deferred.makeUnsafe<void>();
    const generate: TextGeneration["Service"]["generateProjectBrief"] = (input) =>
      Effect.gen(function* () {
        calls.push(input.noteContents);
        yield* Deferred.succeed(started, undefined);
        yield* Deferred.await(release);
        return BRIEF;
      });
    return Effect.gen(function* () {
      const briefs = yield* ProjectBrief.ProjectBrief;
      // Both skip the cache, so only the in-flight map can keep this to one generation.
      const first = yield* briefs
        .generate({ noteContents: "nota", refreshNonce: 1 })
        .pipe(Effect.forkChild({ startImmediately: true }));
      yield* Deferred.await(started);
      const second = yield* briefs
        .generate({ noteContents: "nota", refreshNonce: 2 })
        .pipe(Effect.forkChild({ startImmediately: true }));
      yield* Deferred.succeed(release, undefined);

      const [a, b] = yield* Fiber.joinAll([first, second]);
      expect(calls).toHaveLength(1);
      expect(b).toEqual(a);
    }).pipe(Effect.provide(makeLayer(generate)));
  });

  it.effect("reports a generation failure as a short ProjectBriefError", () =>
    Effect.gen(function* () {
      const error = yield* (yield* ProjectBrief.ProjectBrief)
        .generate({ noteContents: "nota" })
        .pipe(Effect.flip);

      expect(error._tag).toBe("ProjectBriefError");
      expect(error.detail).toBe("Provider is not signed in.");
    }).pipe(
      Effect.provide(
        makeLayer(() =>
          Effect.fail(
            new TextGenerationError({
              operation: "generateProjectBrief",
              detail: "  Provider is not signed in.  ",
            }),
          ),
        ),
      ),
    ),
  );
});
