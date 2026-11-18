/**
 * Keeps conversations held in other Claude Code and Codex clients (editor,
 * terminal, desktop app) visible without rerunning onboarding: shortly after
 * startup and then periodically, every active project imports its recent,
 * idle transcripts. Transcripts are only read, never written.
 *
 * @module AgentSessionAutoSync
 */
import { HostProcessEnvironment } from "@t3tools/shared/hostProcess";
import * as Cause from "effect/Cause";
import * as Clock from "effect/Clock";
import * as Crypto from "effect/Crypto";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Semaphore from "effect/Semaphore";

import * as OrchestrationEngine from "../orchestration/Services/OrchestrationEngine.ts";
import * as ProjectionSnapshotQuery from "../orchestration/Services/ProjectionSnapshotQuery.ts";
import * as ProviderSessionDirectory from "../provider/Services/ProviderSessionDirectory.ts";
import { forkParked } from "../serverActivation.ts";
import { importRecentAgentThreads } from "./AgentSessionImporter.ts";
import * as AgentSessionScanner from "./AgentSessionScanner.ts";

/** Sessions touched within this window are kept in sync. */
export const AUTO_SYNC_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;
/** A transcript written more recently than this may still be in use. */
export const AUTO_SYNC_MIN_IDLE_MS = 20 * 60 * 1000;
const DEFAULT_INITIAL_DELAY_MS = 30 * 1000;
const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;
/** Overrides exist for end-to-end checks against a copied state directory. */
export const AUTO_SYNC_INITIAL_DELAY_ENV = "T3CODE_AGENT_SESSION_SYNC_DELAY_MS";
export const AUTO_SYNC_INTERVAL_ENV = "T3CODE_AGENT_SESSION_SYNC_INTERVAL_MS";

export interface AgentSessionAutoSyncPassResult {
  readonly projectCount: number;
  readonly failedProjectCount: number;
  readonly importedCount: number;
  readonly skippedCount: number;
  readonly durationMs: number;
}

/**
 * Build the pass runner. Passes never overlap: one requested while another is
 * running returns `Option.none` without doing anything. A failing project is
 * logged and the pass continues with the next one.
 */
export const makePassRunner = Effect.gen(function* () {
  const scanner = yield* AgentSessionScanner.AgentSessionScanner;
  const engine = yield* OrchestrationEngine.OrchestrationEngineService;
  const snapshots = yield* ProjectionSnapshotQuery.ProjectionSnapshotQuery;
  const directory = yield* ProviderSessionDirectory.ProviderSessionDirectory;
  const crypto = yield* Crypto.Crypto;
  const lock = yield* Semaphore.make(1);

  const pass = Effect.gen(function* () {
    const startedAtMs = yield* Clock.currentTimeMillis;
    const projects = yield* snapshots.getProjectShells();
    let failedProjectCount = 0;
    let importedCount = 0;
    let skippedCount = 0;
    for (const project of projects) {
      const result = yield* importRecentAgentThreads(
        { projectId: project.id },
        { windowMs: AUTO_SYNC_WINDOW_MS, minIdleMs: AUTO_SYNC_MIN_IDLE_MS },
      ).pipe(
        Effect.provideService(AgentSessionScanner.AgentSessionScanner, scanner),
        Effect.provideService(OrchestrationEngine.OrchestrationEngineService, engine),
        Effect.provideService(ProjectionSnapshotQuery.ProjectionSnapshotQuery, snapshots),
        Effect.provideService(ProviderSessionDirectory.ProviderSessionDirectory, directory),
        Effect.provideService(Crypto.Crypto, crypto),
        Effect.catchCauseIf(
          (cause) => !Cause.hasInterruptsOnly(cause),
          (cause) =>
            Effect.logWarning("agent session auto-sync failed for a project", {
              projectId: project.id,
              cause,
            }).pipe(Effect.as(null)),
        ),
      );
      if (result === null) {
        failedProjectCount += 1;
        continue;
      }
      importedCount += result.importedCount;
      skippedCount += result.skippedCount;
    }
    const summary: AgentSessionAutoSyncPassResult = {
      projectCount: projects.length,
      failedProjectCount,
      importedCount,
      skippedCount,
      durationMs: (yield* Clock.currentTimeMillis) - startedAtMs,
    };
    yield* Effect.logInfo("agent session auto-sync pass finished", summary);
    return summary;
  });

  return { runPass: Semaphore.withPermitsIfAvailable(lock, 1)(pass) };
});

function readDelayMs(environment: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const parsed = Number(environment[name]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Runs the first pass shortly after the server activates, then on a fixed interval. */
export const layer = Layer.effectDiscard(
  Effect.gen(function* () {
    const environment = yield* HostProcessEnvironment;
    const initialDelayMs = readDelayMs(
      environment,
      AUTO_SYNC_INITIAL_DELAY_ENV,
      DEFAULT_INITIAL_DELAY_MS,
    );
    const intervalMs = readDelayMs(environment, AUTO_SYNC_INTERVAL_ENV, DEFAULT_INTERVAL_MS);
    // A scanner of its own: its file metadata stays warm between passes.
    const scanner = yield* AgentSessionScanner.make;
    const { runPass } = yield* makePassRunner.pipe(
      Effect.provideService(AgentSessionScanner.AgentSessionScanner, scanner),
    );
    yield* forkParked(
      Effect.sleep(Duration.millis(initialDelayMs)).pipe(
        Effect.andThen(
          runPass.pipe(
            Effect.catchCauseIf(
              (cause) => !Cause.hasInterruptsOnly(cause),
              (cause) => Effect.logWarning("agent session auto-sync pass failed", { cause }),
            ),
            Effect.repeat(Schedule.spaced(Duration.millis(intervalMs))),
          ),
        ),
      ),
    );
  }),
);
