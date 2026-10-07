import {
  CommandId,
  ProjectId,
  ProviderInstanceId,
  ThreadId,
  type OrchestrationReadModel,
  type OrchestrationThread,
} from "@t3tools/contracts";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

import { decideOrchestrationCommand } from "./decider.ts";

const UPDATED_AT = "2026-01-01T00:00:00.000Z";
const THREAD_ID = ThreadId.make("thread-1");

const baseThread: OrchestrationThread = {
  id: THREAD_ID,
  projectId: ProjectId.make("project-1"),
  title: "New thread",
  modelSelection: { instanceId: ProviderInstanceId.make("codex"), model: "gpt-5.4" },
  runtimeMode: "full-access",
  interactionMode: "default",
  branch: null,
  worktreePath: null,
  pullRequests: [],
  latestTurn: null,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
  archivedAt: null,
  settledOverride: null,
  settledAt: null,
  snoozedUntil: null,
  snoozedAt: null,
  deletedAt: null,
  messages: [],
  proposedPlans: [],
  activities: [],
  checkpoints: [],
  session: null,
};

const readModelWith = (patch: Partial<OrchestrationThread>): OrchestrationReadModel => ({
  snapshotSequence: 0,
  projects: [],
  threads: [{ ...baseThread, ...patch }],
  updatedAt: UPDATED_AT,
});

const generateComplete = (objective: string) =>
  ({
    type: "thread.title.generate.complete",
    commandId: CommandId.make("generated"),
    threadId: THREAD_ID,
    expectedTitle: "New thread",
    expectedVersion: null,
    title: "Generated title",
    needsRefinement: false,
    objective,
  }) as const;

const decideFirst = (input: Parameters<typeof decideOrchestrationCommand>[0]) =>
  decideOrchestrationCommand(input).pipe(
    Effect.map((result) => (Array.isArray(result) ? result[0] : result)),
  );

it.layer(NodeServices.layer)("thread objective decider", (it) => {
  it.effect("records a trimmed manual objective", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: {
          type: "thread.meta.update",
          commandId: CommandId.make("manual-objective"),
          threadId: THREAD_ID,
          objective: "  Subir a landing page B2B  ",
        },
        readModel: readModelWith({}),
      });
      expect(event.payload).toMatchObject({
        objective: "Subir a landing page B2B",
        objectiveState: { source: "manual" },
      });
    }),
  );

  it.effect("caps a manual objective at 200 characters", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: {
          type: "thread.meta.update",
          commandId: CommandId.make("long-objective"),
          threadId: THREAD_ID,
          objective: `  ${"a".repeat(199)} ${"b".repeat(50)}  `,
        },
        readModel: readModelWith({}),
      });
      // Cut at 200, then the trailing space the cut exposed is dropped.
      expect(event.payload).toMatchObject({
        objective: "a".repeat(199),
        objectiveState: { source: "manual" },
      });
    }),
  );

  it.effect("clears the objective when the manual value is empty", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: {
          type: "thread.meta.update",
          commandId: CommandId.make("clear-objective"),
          threadId: THREAD_ID,
          objective: "   ",
        },
        readModel: readModelWith({
          objective: "Old goal",
          objectiveState: { source: "manual" },
        }),
      });
      expect(event.payload).toMatchObject({
        objective: null,
        objectiveState: { source: "manual" },
      });
    }),
  );

  it.effect("does not refill an objective the user cleared", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: generateComplete("Objetivo gerado"),
        readModel: readModelWith({ objective: null, objectiveState: { source: "manual" } }),
      });
      expect(event.payload).not.toHaveProperty("objective");
    }),
  );

  it.effect("caps a generated objective at the manual limit", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: generateComplete(`${"x".repeat(250)}  `),
        readModel: readModelWith({ objective: null, objectiveState: null }),
      });
      expect(event.payload).toMatchObject({ objective: "x".repeat(200) });
    }),
  );

  it.effect("fills an empty objective from title generation", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: generateComplete("Corrigir o checkout"),
        readModel: readModelWith({}),
      });
      expect(event.payload).toMatchObject({
        title: "Generated title",
        objective: "Corrigir o checkout",
        objectiveState: { source: "generated" },
      });
    }),
  );

  it.effect("never overwrites a manual objective with a generated one", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: generateComplete("Corrigir o checkout"),
        readModel: readModelWith({
          objective: "Meu objetivo",
          objectiveState: { source: "manual" },
        }),
      });
      expect(event.payload).not.toHaveProperty("objective");
      expect(event.payload).not.toHaveProperty("objectiveState");
    }),
  );

  it.effect("replaces an older generated objective", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: generateComplete("Novo objetivo"),
        readModel: readModelWith({
          objective: "Objetivo antigo",
          objectiveState: { source: "generated" },
        }),
      });
      expect(event.payload).toMatchObject({ objective: "Novo objetivo" });
    }),
  );

  const objectiveComplete = (objective: string) =>
    ({
      type: "thread.objective.generate.complete",
      commandId: CommandId.make("objective-refresh"),
      threadId: THREAD_ID,
      objective,
    }) as const;

  it.effect("refreshes a generated objective without touching the title", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: objectiveComplete(`  ${"y".repeat(250)}  `),
        readModel: readModelWith({
          objective: "Objetivo antigo",
          objectiveState: { source: "generated" },
        }),
      });
      expect(event.type).toBe("thread.meta-updated");
      expect(event.payload).toMatchObject({
        objective: "y".repeat(200),
        objectiveState: { source: "generated" },
      });
      expect(event.payload).not.toHaveProperty("title");
      expect(event.payload).not.toHaveProperty("titleState");
    }),
  );

  it.effect("drops a refreshed objective when the user set one by hand", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: objectiveComplete("Objetivo gerado"),
        readModel: readModelWith({
          objective: "Meu objetivo",
          objectiveState: { source: "manual" },
        }),
      });
      expect(event.type).toBe("thread.meta-updated");
      expect(event.payload).not.toHaveProperty("objective");
      expect(event.payload).not.toHaveProperty("objectiveState");
    }),
  );

  it.effect("drops a refreshed objective for a deleted thread", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: objectiveComplete("Objetivo gerado"),
        readModel: readModelWith({ deletedAt: UPDATED_AT }),
      });
      expect(event.payload).not.toHaveProperty("objective");
    }),
  );

  it.effect("keeps an objective that landed while a fill was generating", () =>
    Effect.gen(function* () {
      const fill = {
        ...objectiveComplete("Objetivo do preenchimento"),
        onlyIfEmpty: true,
      } as const;
      const landed = yield* decideFirst({
        command: fill,
        readModel: readModelWith({
          objective: "Objetivo do primeiro turno",
          objectiveState: { source: "generated" },
        }),
      });
      expect(landed.payload).not.toHaveProperty("objective");

      const empty = yield* decideFirst({ command: fill, readModel: readModelWith({}) });
      expect(empty.payload).toMatchObject({ objective: "Objetivo do preenchimento" });
    }),
  );

  it.effect("resets a manual objective back to automatic", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: {
          type: "thread.meta.update",
          commandId: CommandId.make("reset-objective"),
          threadId: THREAD_ID,
          resetObjective: true,
        },
        readModel: readModelWith({
          objective: "Meu objetivo",
          objectiveState: { source: "manual" },
        }),
      });
      expect(event.payload).toMatchObject({
        objective: null,
        objectiveState: null,
        regenerateObjective: true,
      });
    }),
  );

  it.effect("lets resetObjective win over an objective in the same command", () =>
    Effect.gen(function* () {
      const event = yield* decideFirst({
        command: {
          type: "thread.meta.update",
          commandId: CommandId.make("reset-and-set"),
          threadId: THREAD_ID,
          objective: "Ignorado",
          resetObjective: true,
        },
        readModel: readModelWith({}),
      });
      expect(event.payload).toMatchObject({
        objective: null,
        objectiveState: null,
        regenerateObjective: true,
      });
    }),
  );

  const fillObjective = {
    type: "thread.meta.update",
    commandId: CommandId.make("fill-objective"),
    threadId: THREAD_ID,
    fillObjective: true,
  } as const;

  it.effect("fills only an empty automatic objective, keeping the thread's place", () =>
    Effect.gen(function* () {
      const empty = yield* decideFirst({ command: fillObjective, readModel: readModelWith({}) });
      expect(empty.payload).toEqual({
        threadId: THREAD_ID,
        regenerateObjective: true,
        updatedAt: UPDATED_AT,
      });

      for (const patch of [
        { objective: "Já tem", objectiveState: { source: "generated" as const } },
        { objective: null, objectiveState: { source: "manual" as const } },
        { deletedAt: UPDATED_AT },
      ]) {
        const event = yield* decideFirst({
          command: fillObjective,
          readModel: readModelWith(patch),
        });
        expect(event.payload).toEqual({ threadId: THREAD_ID, updatedAt: UPDATED_AT });
      }
    }),
  );
});
