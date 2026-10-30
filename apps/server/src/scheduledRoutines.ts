import {
  CommandId,
  DEFAULT_PROVIDER_INTERACTION_MODE,
  MessageId,
  type ModelSelection,
  type OrchestrationThreadShell,
  type ScheduledRoutine,
  type ServerRunScheduledRoutineResult,
  ThreadId,
} from "@t3tools/contracts";
import { resolveProjectSettings } from "@t3tools/shared/projectSettings";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schedule from "effect/Schedule";
import type * as Scope from "effect/Scope";
import * as Semaphore from "effect/Semaphore";
import * as Stream from "effect/Stream";
import { ChildProcessSpawner } from "effect/unstable/process";

import * as ServerConfig from "./config.ts";

import * as OrchestrationEngine from "./orchestration/Services/OrchestrationEngine.ts";
import * as ProjectionSnapshotQuery from "./orchestration/Services/ProjectionSnapshotQuery.ts";
import { forkParked } from "./serverActivation.ts";
import * as Settings from "./serverSettings.ts";
import {
  ROUTINES_LAUNCHER_ENV,
  routinesTaskXml,
  syncRoutinesTask,
} from "./scheduledRoutinesWindowsTask.ts";

export class ScheduledRoutines extends Context.Service<
  ScheduledRoutines,
  {
    readonly start: () => Effect.Effect<void, never, Scope.Scope>;
    readonly runNow: (routineId: string) => Effect.Effect<ServerRunScheduledRoutineResult>;
    /**
     * True until the first check for due routines has finished, and while a
     * conversation a routine started here is still working. The desktop app
     * launched only for routines quits once this turns false.
     */
    readonly isBusy: Effect.Effect<boolean>;
  }
>()("t3/scheduledRoutines") {}

const HOUR_MS = 3_600_000;

/**
 * The slot a routine is due for at `now`, or null. Daily routines fire once per
 * day at local `time`, catching up later that day but never for a past day;
 * interval routines fire on the hour, `hours` after the hour of their last run
 * (or creation). Runs land seconds after the hourly launch of the hidden app,
 * so counting from the exact run time would drift past the next launch.
 */
export function routineDueSlot(
  routine: ScheduledRoutine,
  lastRunAt: number | null,
  now: DateTime.Zoned,
): number | null {
  if (!routine.enabled) return null;
  const nowMs = DateTime.toEpochMillis(now);
  const createdAt = Date.parse(routine.createdAt);
  if (routine.schedule.kind === "interval") {
    const base = lastRunAt ?? createdAt;
    const slot = base - (base % HOUR_MS) + routine.schedule.hours * HOUR_MS;
    return nowMs >= slot ? slot : null;
  }
  const [hour = 0, minute = 0] = routine.schedule.time.split(":").map(Number);
  const slot = DateTime.toEpochMillis(
    DateTime.setParts(now, { hour, minute, second: 0, millisecond: 0 }),
  );
  if (nowMs < slot || slot < createdAt) return null;
  if (lastRunAt !== null && lastRunAt >= slot) return null;
  return slot;
}

const pad = (value: number) => String(value).padStart(2, "0");

// A turn waiting on the user (approval or question) does not count: nobody is
// there to answer, so keeping the app open would only wait for the time cap.
function threadWorking(thread: OrchestrationThreadShell): boolean {
  if (thread.hasPendingApprovals || thread.hasPendingUserInput) return false;
  const status = thread.session?.status;
  if (status === "starting" || status === "running") return true;
  if (thread.latestTurn === null) return status !== "error" && status !== "stopped";
  return thread.latestTurn.state === "running";
}

function runTitle(name: string, at: DateTime.Zoned): string {
  const parts = DateTime.toParts(at);
  return `${name} · ${pad(parts.day)}/${pad(parts.month)} ${pad(parts.hour)}:${pad(parts.minute)}`;
}

// Schedules follow the clock of the machine the server runs on.
const localNow = Effect.map(DateTime.now, (now) => DateTime.setZone(now, DateTime.zoneMakeLocal()));

export const make = Effect.gen(function* () {
  const settingsService = yield* Settings.ServerSettingsService;
  const snapshots = yield* ProjectionSnapshotQuery.ProjectionSnapshotQuery;
  const engine = yield* OrchestrationEngine.OrchestrationEngineService;
  const crypto = yield* Crypto.Crypto;
  const config = yield* ServerConfig.ServerConfig;
  const taskServices = yield* Effect.context<
    FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
  >();
  // Conversations started by routines in this process, until they settle.
  const startedThreadIds = new Set<ThreadId>();
  let firstTickDone = false;
  // One run at a time, so the minute tick and "run now" never double-fire.
  const lock = yield* Semaphore.make(1);

  // The project's default model, else what the user last used there, else the
  // model the app uses for its own text.
  const pickModel = (routine: ScheduledRoutine) =>
    Effect.gen(function* () {
      const settings = yield* settingsService.getSettings;
      const project = yield* snapshots.getProjectShellById(routine.projectId);
      if (Option.isNone(project)) return null;
      const resolved = resolveProjectSettings(settings, routine.projectId, project.value).settings;
      if (resolved.defaultModelSelection) {
        return {
          modelSelection: resolved.defaultModelSelection,
          runtimeMode: resolved.defaultRuntimeMode,
        };
      }
      const { threads } = yield* snapshots.getShellSnapshot();
      const latest = threads
        .filter((thread) => thread.projectId === routine.projectId && thread.archivedAt === null)
        .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
      const modelSelection: ModelSelection =
        latest?.modelSelection ?? settings.textGenerationModelSelection;
      return { modelSelection, runtimeMode: resolved.defaultRuntimeMode };
    });

  const run = (routine: ScheduledRoutine) =>
    Effect.gen(function* () {
      const startedAt = yield* localNow;
      const createdAt = DateTime.formatIso(startedAt);
      let threadId: ThreadId | null = null;
      const outcome = yield* Effect.gen(function* () {
        const choice = yield* pickModel(routine);
        if (choice === null) return "project-missing" as const;
        const newThreadId = ThreadId.make(yield* crypto.randomUUIDv4);
        yield* engine.dispatch({
          type: "thread.create",
          commandId: CommandId.make(yield* crypto.randomUUIDv4),
          threadId: newThreadId,
          projectId: routine.projectId,
          title: runTitle(routine.name, startedAt),
          modelSelection: choice.modelSelection,
          interactionMode: DEFAULT_PROVIDER_INTERACTION_MODE,
          runtimeMode: choice.runtimeMode,
          branch: null,
          worktreePath: null,
          createdAt,
        });
        threadId = newThreadId;
        startedThreadIds.add(newThreadId);
        yield* engine.dispatch({
          type: "thread.turn.start",
          commandId: CommandId.make(yield* crypto.randomUUIDv4),
          threadId: newThreadId,
          message: {
            messageId: MessageId.make(yield* crypto.randomUUIDv4),
            role: "user",
            text: routine.prompt,
            attachments: [],
          },
          modelSelection: choice.modelSelection,
          runtimeMode: choice.runtimeMode,
          interactionMode: DEFAULT_PROVIDER_INTERACTION_MODE,
          createdAt,
        });
        return null;
      }).pipe(
        Effect.catchCauseIf(
          (cause) => !Cause.hasInterrupts(cause),
          (cause) =>
            Effect.logWarning("scheduled routine failed", { routineId: routine.id, cause }).pipe(
              Effect.as("failed" as const),
            ),
        ),
      );
      // A run counts even when it failed, so a broken routine is not retried
      // every minute; the settings screen shows it as failed.
      yield* settingsService
        .updateSettings({
          scheduledRoutineRuns: {
            [routine.id]: { at: createdAt, threadId, failed: outcome !== null },
          },
        })
        .pipe(
          Effect.catchCause((cause) =>
            Effect.logWarning("could not record scheduled routine run", {
              routineId: routine.id,
              cause,
            }),
          ),
        );
      return { threadId, problem: outcome } satisfies ServerRunScheduledRoutineResult;
    });

  const tick = Effect.gen(function* () {
    const settings = yield* settingsService.getSettings;
    const now = yield* localNow;
    for (const routine of settings.scheduledRoutines) {
      const last = settings.scheduledRoutineRuns[routine.id];
      if (routineDueSlot(routine, last ? Date.parse(last.at) : null, now) === null) continue;
      yield* run(routine);
    }
  });

  const runNow = (routineId: string) =>
    lock
      .withPermits(1)(
        Effect.gen(function* () {
          const settings = yield* settingsService.getSettings;
          const routine = settings.scheduledRoutines.find((entry) => entry.id === routineId);
          if (!routine) {
            return {
              threadId: null,
              problem: "routine-missing",
            } satisfies ServerRunScheduledRoutineResult;
          }
          return yield* run(routine);
        }),
      )
      .pipe(
        Effect.catchCause((cause) =>
          Effect.logWarning("scheduled routine run-now failed", { routineId, cause }).pipe(
            Effect.as({
              threadId: null,
              problem: "failed",
            } satisfies ServerRunScheduledRoutineResult),
          ),
        ),
      );

  const isBusy = Effect.gen(function* () {
    if (!firstTickDone) return true;
    for (const threadId of startedThreadIds) {
      const thread = yield* snapshots.getThreadShellById(threadId);
      if (Option.isSome(thread) && threadWorking(thread.value)) return true;
      startedThreadIds.delete(threadId);
    }
    return false;
  }).pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("could not read scheduled routine activity", { cause }).pipe(
        Effect.as(true),
      ),
    ),
  );

  // Keeps the Windows task that opens the app for routines in step with the
  // routine list. Only the packaged Windows app sets the launcher.
  const syncWindowsTask = (routines: ReadonlyArray<ScheduledRoutine>, launcher: string) =>
    Effect.gen(function* () {
      const parts = DateTime.toParts(yield* localNow);
      const today = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
      yield* syncRoutinesTask(routinesTaskXml(routines, launcher, today), config.stateDir);
    }).pipe(
      Effect.provide(taskServices),
      Effect.catchCause((cause) =>
        Effect.logWarning("could not sync the scheduled routines task", { cause }),
      ),
    );

  const start = Effect.fn("ScheduledRoutines.start")(function* () {
    yield* forkParked(
      lock
        .withPermits(1)(tick)
        .pipe(
          Effect.catchCause((cause) =>
            Effect.logWarning("scheduled routines tick failed", { cause }),
          ),
          Effect.tap(() =>
            Effect.sync(() => {
              firstTickDone = true;
            }),
          ),
          Effect.repeat(Schedule.spaced("1 minute")),
          Effect.asVoid,
        ),
    );
    const launcher = process.env[ROUTINES_LAUNCHER_ENV];
    if (!launcher) return;
    const changes = yield* settingsService.subscribeChanges;
    let lastRoutines = (yield* settingsService.getSettings.pipe(Effect.orDie)).scheduledRoutines;
    yield* forkParked(syncWindowsTask(lastRoutines, launcher));
    yield* forkParked(
      Stream.runForEach(changes, (settings) => {
        if (Equal.equals(settings.scheduledRoutines, lastRoutines)) return Effect.void;
        lastRoutines = settings.scheduledRoutines;
        return syncWindowsTask(lastRoutines, launcher);
      }),
    );
  });

  return { start, runNow, isBusy } satisfies ScheduledRoutines["Service"];
});

export const layer = Layer.effect(ScheduledRoutines, make);
