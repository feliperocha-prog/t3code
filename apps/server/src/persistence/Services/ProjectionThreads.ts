/**
 * ProjectionThreadRepository - Projection repository interface for threads.
 *
 * Owns persistence operations for projected thread records in the
 * orchestration read model.
 *
 * @module ProjectionThreadRepository
 */
import {
  CommandId,
  IsoDateTime,
  ModelSelection,
  NonNegativeInt,
  ProjectId,
  ProviderInteractionMode,
  RuntimeMode,
  ThreadLinkedPullRequest,
  ThreadObjectiveState,
  ThreadStatusCard,
  ThreadTitleState,
  ThreadId,
  TurnId,
} from "@t3tools/contracts";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

import type { ProjectionRepositoryError } from "../Errors.ts";

export const ProjectionThread = Schema.Struct({
  threadId: ThreadId,
  projectId: ProjectId,
  title: Schema.String,
  titleState: Schema.optional(Schema.NullOr(ThreadTitleState)),
  objective: Schema.optional(Schema.NullOr(Schema.String)),
  objectiveState: Schema.optional(Schema.NullOr(ThreadObjectiveState)),
  statusCard: Schema.optional(Schema.NullOr(ThreadStatusCard)),
  modelSelection: ModelSelection,
  runtimeMode: RuntimeMode,
  interactionMode: ProviderInteractionMode,
  branch: Schema.NullOr(Schema.String),
  worktreePath: Schema.NullOr(Schema.String),
  linkedPullRequest: Schema.optional(Schema.NullOr(ThreadLinkedPullRequest)),
  branchPullRequest: Schema.optional(Schema.NullOr(ThreadLinkedPullRequest)),
  latestTurnId: Schema.NullOr(TurnId),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
  archivedAt: Schema.NullOr(IsoDateTime),
  settledOverride: Schema.NullOr(Schema.Literals(["settled", "active"])),
  settledAt: Schema.NullOr(IsoDateTime),
  unsettledAt: Schema.NullOr(IsoDateTime),
  snoozedUntil: Schema.NullOr(IsoDateTime),
  snoozedAt: Schema.NullOr(IsoDateTime),
  pinnedAt: Schema.NullOr(IsoDateTime),
  pinOrderKey: Schema.optional(Schema.NullOr(Schema.String)),
  activeOrderKey: Schema.optional(Schema.NullOr(Schema.String)),
  autoSettleDisabledAt: Schema.optional(Schema.NullOr(IsoDateTime)),
  titleRegenerationRequestId: Schema.optional(Schema.NullOr(CommandId)),
  titleRegenerationStartedAt: Schema.optional(Schema.NullOr(IsoDateTime)),
  latestUserMessageAt: Schema.NullOr(IsoDateTime),
  pendingApprovalCount: NonNegativeInt,
  pendingUserInputCount: NonNegativeInt,
  hasActionableProposedPlan: NonNegativeInt,
  deletedAt: Schema.NullOr(IsoDateTime),
});
export type ProjectionThread = typeof ProjectionThread.Type;

/**
 * `status_card_json` column. The card is derived from an assistant message and
 * can always be rebuilt from the next one, so a row that no longer decodes
 * reads as "no card" instead of failing the whole thread load.
 */
export const ProjectionThreadStatusCardJson = Schema.NullOr(
  Schema.fromJsonString(ThreadStatusCard),
).pipe(Schema.catchDecoding(() => Effect.succeed(Option.some(null))));

export const GetProjectionThreadInput = Schema.Struct({
  threadId: ThreadId,
});
export type GetProjectionThreadInput = typeof GetProjectionThreadInput.Type;

/**
 * ProjectionThreadRepositoryShape - Service API for projected thread records.
 */
export interface ProjectionThreadRepositoryShape {
  /**
   * Insert or replace a projected thread row.
   *
   * Upserts by `threadId`.
   */
  readonly upsert: (thread: ProjectionThread) => Effect.Effect<void, ProjectionRepositoryError>;

  /**
   * Read a projected thread row by id.
   */
  readonly getById: (
    input: GetProjectionThreadInput,
  ) => Effect.Effect<Option.Option<ProjectionThread>, ProjectionRepositoryError>;
}

/**
 * ProjectionThreadRepository - Service tag for thread projection persistence.
 */
export class ProjectionThreadRepository extends Context.Service<
  ProjectionThreadRepository,
  ProjectionThreadRepositoryShape
>()("t3/persistence/Services/ProjectionThreads/ProjectionThreadRepository") {}
