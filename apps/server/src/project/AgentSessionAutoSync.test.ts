import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import { ProjectId, type OrchestrationProjectShell } from "@t3tools/contracts";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";

import * as OrchestrationEngine from "../orchestration/Services/OrchestrationEngine.ts";
import * as ProjectionSnapshotQuery from "../orchestration/Services/ProjectionSnapshotQuery.ts";
import * as ProviderSessionDirectory from "../provider/Services/ProviderSessionDirectory.ts";
import * as AgentSessionAutoSync from "./AgentSessionAutoSync.ts";
import * as AgentSessionScanner from "./AgentSessionScanner.ts";

const makeProject = (id: string): OrchestrationProjectShell => ({
  id: ProjectId.make(id),
  title: id,
  workspaceRoot: `/tmp/${id}`,
  defaultModelSelection: null,
  scripts: [],
  createdAt: "2026-08-24T09:00:00.000Z",
  updatedAt: "2026-08-24T09:00:00.000Z",
});

const makeRunner = (input: {
  readonly getProjectShells: ProjectionSnapshotQuery.ProjectionSnapshotQuery["Service"]["getProjectShells"];
  readonly getProjectShellById?: ProjectionSnapshotQuery.ProjectionSnapshotQuery["Service"]["getProjectShellById"];
  readonly recentThreads?: AgentSessionScanner.AgentSessionScanner["Service"]["recentThreads"];
}) =>
  AgentSessionAutoSync.makePassRunner.pipe(
    Effect.provideService(
      AgentSessionScanner.AgentSessionScanner,
      AgentSessionScanner.AgentSessionScanner.of({
        scan: Effect.die("unused"),
        recentThreads: input.recentThreads ?? (() => Stream.empty),
      }),
    ),
    Effect.provide(
      Layer.mergeAll(
        Layer.mock(OrchestrationEngine.OrchestrationEngineService)({}),
        Layer.mock(ProviderSessionDirectory.ProviderSessionDirectory)({
          listBindings: () => Effect.succeed([]),
        }),
        Layer.mock(ProjectionSnapshotQuery.ProjectionSnapshotQuery)({
          getProjectShells: input.getProjectShells,
          getProjectShellById: input.getProjectShellById ?? (() => Effect.die("unused")),
          getImportedAgentSessionSources: () => Effect.succeed([]),
        }),
      ),
    ),
  );

it.layer(NodeServices.layer)("AgentSessionAutoSync", (it) => {
  describe("makePassRunner", () => {
    it.effect("never runs two passes at once", () =>
      Effect.gen(function* () {
        const entered = yield* Deferred.make<void>();
        const release = yield* Deferred.make<void>();
        let calls = 0;
        const { runPass } = yield* makeRunner({
          getProjectShells: () =>
            Effect.gen(function* () {
              calls += 1;
              yield* Deferred.succeed(entered, undefined);
              yield* Deferred.await(release);
              return [];
            }),
        });

        const first = yield* Effect.forkChild(runPass);
        yield* Deferred.await(entered);
        const overlapping = yield* runPass;
        yield* Deferred.succeed(release, undefined);
        const finished = yield* Fiber.join(first);
        const afterwards = yield* runPass;

        expect(Option.isNone(overlapping)).toBe(true);
        expect(Option.getOrThrow(finished)).toMatchObject({
          projectCount: 0,
          failedProjectCount: 0,
          importedCount: 0,
          skippedCount: 0,
        });
        expect(Option.isSome(afterwards)).toBe(true);
        expect(calls).toBe(2);
      }),
    );

    it.effect("keeps going after a failing project and scans with the sync window", () =>
      Effect.gen(function* () {
        const scanned: Array<{ readonly root: string; readonly options: unknown }> = [];
        const missing = makeProject("missing");
        const present = makeProject("present");
        const { runPass } = yield* makeRunner({
          getProjectShells: () => Effect.succeed([missing, present]),
          getProjectShellById: (projectId) =>
            Effect.succeed(projectId === present.id ? Option.some(present) : Option.none()),
          recentThreads: (root, _completed, options) => {
            scanned.push({ root, options });
            return Stream.succeed({ _tag: "Skipped" });
          },
        });

        const result = yield* runPass;

        expect(Option.getOrThrow(result)).toMatchObject({
          projectCount: 2,
          failedProjectCount: 1,
          importedCount: 0,
          skippedCount: 1,
        });
        expect(scanned).toEqual([
          {
            root: present.workspaceRoot,
            options: {
              windowMs: 60 * 24 * 60 * 60 * 1000,
              minIdleMs: 20 * 60 * 1000,
            },
          },
        ]);
      }),
    );
  });
});
