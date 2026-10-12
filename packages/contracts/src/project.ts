import * as Schema from "effect/Schema";
import {
  IsoDateTime,
  NonNegativeInt,
  PositiveInt,
  TrimmedNonEmptyString,
  TrimmedString,
} from "./baseSchemas.ts";

const PROJECT_SEARCH_ENTRIES_MAX_LIMIT = 200;
const PROJECT_SEARCH_CONTENTS_MAX_LIMIT = 500;
const PROJECT_WRITE_FILE_PATH_MAX_LENGTH = 512;
const PROJECT_READ_FILE_PATH_MAX_LENGTH = 512;

export const ProjectEntryKind = Schema.Literals(["file", "directory"]);
export type ProjectEntryKind = typeof ProjectEntryKind.Type;

export const ProjectSearchEntriesInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  // An empty query is a bounded browse: the index returns frecency-ordered
  // entries, which the file picker uses for its initial results.
  query: TrimmedString.check(Schema.isMaxLength(256)),
  limit: PositiveInt.check(Schema.isLessThanOrEqualTo(PROJECT_SEARCH_ENTRIES_MAX_LIMIT)),
  kind: Schema.optional(ProjectEntryKind),
  imageOnly: Schema.optional(Schema.Boolean),
});
export type ProjectSearchEntriesInput = typeof ProjectSearchEntriesInput.Type;

export const ProjectEntry = Schema.Struct({
  path: TrimmedNonEmptyString,
  kind: ProjectEntryKind,
  ignored: Schema.optional(Schema.Boolean),
});
export type ProjectEntry = typeof ProjectEntry.Type;

export const ProjectSearchEntriesResult = Schema.Struct({
  entries: Schema.Array(ProjectEntry),
  truncated: Schema.Boolean,
});
export type ProjectSearchEntriesResult = typeof ProjectSearchEntriesResult.Type;

export const ProjectSearchContentsInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  // Whitespace is significant in content queries (" foo", regex trailing
  // spaces), so the query is deliberately not trimmed on the wire.
  query: Schema.String.check(Schema.isNonEmpty(), Schema.isMaxLength(256)),
  limit: PositiveInt.check(Schema.isLessThanOrEqualTo(PROJECT_SEARCH_CONTENTS_MAX_LIMIT)),
  caseSensitive: Schema.Boolean,
  wholeWord: Schema.Boolean,
  useRegex: Schema.Boolean,
});
export type ProjectSearchContentsInput = typeof ProjectSearchContentsInput.Type;

export const ProjectContentMatchRange = Schema.Struct({
  start: NonNegativeInt,
  end: NonNegativeInt,
});
export type ProjectContentMatchRange = typeof ProjectContentMatchRange.Type;

export const ProjectContentMatch = Schema.Struct({
  path: TrimmedNonEmptyString,
  lineNumber: PositiveInt,
  lineContent: Schema.String,
  matchRanges: Schema.Array(ProjectContentMatchRange),
});
export type ProjectContentMatch = typeof ProjectContentMatch.Type;

export const ProjectSearchContentsResult = Schema.Struct({
  matches: Schema.Array(ProjectContentMatch),
  truncated: Schema.Boolean,
  regexFallbackError: Schema.optional(Schema.String),
});
export type ProjectSearchContentsResult = typeof ProjectSearchContentsResult.Type;

export const ProjectListEntriesInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  // Present for immediate filesystem children, including ignored entries; empty means root.
  // Omitted preserves the indexed recursive listing used by older clients.
  directoryPath: Schema.optional(TrimmedString),
});
export type ProjectListEntriesInput = typeof ProjectListEntriesInput.Type;

export const ProjectListEntriesResult = Schema.Struct({
  entries: Schema.Array(ProjectEntry),
  truncated: Schema.Boolean,
});
export type ProjectListEntriesResult = typeof ProjectListEntriesResult.Type;

export const ProjectEntriesFailure = Schema.Literals([
  "workspace_root_not_found",
  "workspace_root_create_failed",
  "workspace_root_stat_failed",
  "workspace_root_not_directory",
  "search_index_create_failed",
  "search_index_scan_timed_out",
  "search_index_search_failed",
  "directory_list_failed",
]);
export type ProjectEntriesFailure = typeof ProjectEntriesFailure.Type;

type ProjectEntriesFailureContext = {
  readonly failure: ProjectEntriesFailure;
  readonly normalizedCwd?: string;
  readonly timeout?: string;
  readonly detail?: string;
  readonly cause?: unknown;
};

function decodedProjectErrorMessage(props: object): string | undefined {
  if (!("message" in props)) return undefined;
  return typeof props.message === "string" ? props.message : undefined;
}

export class ProjectSearchEntriesError extends Schema.TaggedError<ProjectSearchEntriesError>()(
  "ProjectSearchEntriesError",
  {
    cwd: Schema.optional(TrimmedNonEmptyString),
    queryLength: Schema.optional(NonNegativeInt),
    limit: Schema.optional(PositiveInt),
    failure: Schema.optional(ProjectEntriesFailure),
    normalizedCwd: Schema.optional(TrimmedNonEmptyString),
    timeout: Schema.optional(TrimmedNonEmptyString),
    detail: Schema.optional(TrimmedNonEmptyString),
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {
  // The structured fields are optional on the wire so newer peers can decode legacy message-only
  // failures. New application code must provide them through this constructor.
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(
    props: ProjectEntriesFailureContext & {
      readonly cwd: string;
      readonly queryLength: number;
      readonly limit: number;
    },
  ) {
    super({
      ...props,
      message:
        decodedProjectErrorMessage(props) ??
        `Failed to search workspace entries in '${props.cwd}'.`,
    } as any);
  }
}

export class ProjectSearchContentsError extends Schema.TaggedError<ProjectSearchContentsError>()(
  "ProjectSearchContentsError",
  {
    cwd: Schema.optional(TrimmedNonEmptyString),
    queryLength: Schema.optional(NonNegativeInt),
    limit: Schema.optional(PositiveInt),
    failure: Schema.optional(ProjectEntriesFailure),
    normalizedCwd: Schema.optional(TrimmedNonEmptyString),
    timeout: Schema.optional(TrimmedNonEmptyString),
    detail: Schema.optional(TrimmedNonEmptyString),
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(
    props: ProjectEntriesFailureContext & {
      readonly cwd: string;
      readonly queryLength: number;
      readonly limit: number;
    },
  ) {
    super({
      ...props,
      message:
        decodedProjectErrorMessage(props) ??
        `Failed to search workspace contents in '${props.cwd}'.`,
    } as any);
  }
}

export class ProjectListEntriesError extends Schema.TaggedError<ProjectListEntriesError>()(
  "ProjectListEntriesError",
  {
    cwd: Schema.optional(TrimmedNonEmptyString),
    failure: Schema.optional(ProjectEntriesFailure),
    normalizedCwd: Schema.optional(TrimmedNonEmptyString),
    timeout: Schema.optional(TrimmedNonEmptyString),
    detail: Schema.optional(TrimmedNonEmptyString),
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(props: ProjectEntriesFailureContext & { readonly cwd: string }) {
    super({
      ...props,
      message:
        decodedProjectErrorMessage(props) ?? `Failed to list workspace entries in '${props.cwd}'.`,
    } as any);
  }
}

export const ProjectReadFileInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  // Workspace-relative, or an absolute host path for a file outside the
  // workspace. Only workspace-relative paths can be written back.
  relativePath: TrimmedNonEmptyString.check(Schema.isMaxLength(PROJECT_READ_FILE_PATH_MAX_LENGTH)),
});
export type ProjectReadFileInput = typeof ProjectReadFileInput.Type;

export const ProjectReadFileResult = Schema.Struct({
  relativePath: TrimmedNonEmptyString,
  contents: Schema.String,
  byteLength: NonNegativeInt,
  truncated: Schema.Boolean,
});
export type ProjectReadFileResult = typeof ProjectReadFileResult.Type;

export const ProjectFileFailure = Schema.Literals([
  "workspace_path_outside_root",
  "resolved_path_outside_root",
  "path_not_file",
  "binary_file",
  "operation_failed",
]);
export type ProjectFileFailure = typeof ProjectFileFailure.Type;

export const ProjectFileOperation = Schema.Literals([
  "realpath-workspace-root",
  "realpath-target",
  "open",
  "stat",
  "read",
  "close",
  "make-directory",
  "write-file",
]);
export type ProjectFileOperation = typeof ProjectFileOperation.Type;

type ProjectFileFailureContext = {
  readonly cwd: string;
  readonly relativePath: string;
  readonly failure: ProjectFileFailure;
  readonly resolvedPath?: string;
  readonly resolvedWorkspaceRoot?: string;
  readonly operation?: ProjectFileOperation;
  readonly operationPath?: string;
  readonly cause?: unknown;
};

export class ProjectReadFileError extends Schema.TaggedError<ProjectReadFileError>()(
  "ProjectReadFileError",
  {
    cwd: Schema.optional(TrimmedNonEmptyString),
    relativePath: Schema.optional(TrimmedNonEmptyString),
    failure: Schema.optional(ProjectFileFailure),
    resolvedPath: Schema.optional(TrimmedNonEmptyString),
    resolvedWorkspaceRoot: Schema.optional(TrimmedNonEmptyString),
    operation: Schema.optional(ProjectFileOperation),
    operationPath: Schema.optional(TrimmedNonEmptyString),
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(props: ProjectFileFailureContext) {
    super({
      ...props,
      message:
        decodedProjectErrorMessage(props) ??
        `Failed to read workspace file '${props.relativePath}' in '${props.cwd}'.`,
    } as any);
  }
}

export const ProjectWriteFileInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  relativePath: TrimmedNonEmptyString.check(Schema.isMaxLength(PROJECT_WRITE_FILE_PATH_MAX_LENGTH)),
  contents: Schema.String,
});
export type ProjectWriteFileInput = typeof ProjectWriteFileInput.Type;

export const ProjectWriteFileResult = Schema.Struct({
  relativePath: TrimmedNonEmptyString,
});
export type ProjectWriteFileResult = typeof ProjectWriteFileResult.Type;

export class ProjectWriteFileError extends Schema.TaggedError<ProjectWriteFileError>()(
  "ProjectWriteFileError",
  {
    cwd: Schema.optional(TrimmedNonEmptyString),
    relativePath: Schema.optional(TrimmedNonEmptyString),
    failure: Schema.optional(ProjectFileFailure),
    resolvedPath: Schema.optional(TrimmedNonEmptyString),
    resolvedWorkspaceRoot: Schema.optional(TrimmedNonEmptyString),
    operation: Schema.optional(ProjectFileOperation),
    operationPath: Schema.optional(TrimmedNonEmptyString),
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(props: ProjectFileFailureContext) {
    super({
      ...props,
      message:
        decodedProjectErrorMessage(props) ??
        `Failed to write workspace file '${props.relativePath}' in '${props.cwd}'.`,
    } as any);
  }
}

export const PROJECT_BRIEF_NOTE_MAX_LENGTH = 64_000;

export const ProjectBriefInput = Schema.Struct({
  noteContents: Schema.String.check(Schema.isMaxLength(PROJECT_BRIEF_NOTE_MAX_LENGTH)),
  // Any new value bypasses the cached brief for the same note and regenerates it.
  refreshNonce: Schema.optional(Schema.Number),
});
export type ProjectBriefInput = typeof ProjectBriefInput.Type;

export const ProjectBrief = Schema.Struct({
  where: Schema.String,
  next: Schema.Array(Schema.String),
  risks: Schema.Array(Schema.String),
  generatedAt: IsoDateTime,
});
export type ProjectBrief = typeof ProjectBrief.Type;

export class ProjectBriefError extends Schema.TaggedError<ProjectBriefError>()(
  "ProjectBriefError",
  {
    detail: Schema.String,
  },
) {
  override get message(): string {
    return this.detail;
  }
}

export const CHANGES_EXPLANATION_DIFF_MAX_LENGTH = 80_000;

export const ChangesExplanationInput = Schema.Struct({
  diff: Schema.String.check(Schema.isMaxLength(CHANGES_EXPLANATION_DIFF_MAX_LENGTH)),
  // Any new value bypasses the cached explanation for the same patch and regenerates it.
  refreshNonce: Schema.optional(Schema.Number),
});
export type ChangesExplanationInput = typeof ChangesExplanationInput.Type;

export const ChangesExplanationRisk = Schema.Literals(["low", "medium", "high"]);
export type ChangesExplanationRisk = typeof ChangesExplanationRisk.Type;

export const ChangesExplanationFile = Schema.Struct({
  path: Schema.String,
  what: Schema.String,
  risk: ChangesExplanationRisk,
});
export type ChangesExplanationFile = typeof ChangesExplanationFile.Type;

export const ChangesExplanation = Schema.Struct({
  summary: Schema.String,
  files: Schema.Array(ChangesExplanationFile),
  attention: Schema.Array(Schema.String),
  // True when the patch was cut before it reached the model.
  truncated: Schema.Boolean,
  generatedAt: IsoDateTime,
});
export type ChangesExplanation = typeof ChangesExplanation.Type;

export class ChangesExplanationError extends Schema.TaggedError<ChangesExplanationError>()(
  "ChangesExplanationError",
  {
    detail: Schema.String,
  },
) {
  override get message(): string {
    return this.detail;
  }
}

export const CHECK_SCRIPT_TIMEOUT_MAX_MS = 600_000;
export const CHECK_SCRIPT_TIMEOUT_DEFAULT_MS = 300_000;
export const CHECK_SCRIPT_OUTPUT_TAIL_LENGTH = 4_000;

// Runs one project script (build, tests) to completion before a publish.
export const ProjectRunCheckScriptInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  command: TrimmedNonEmptyString,
  timeoutMs: Schema.optional(
    PositiveInt.check(Schema.isLessThanOrEqualTo(CHECK_SCRIPT_TIMEOUT_MAX_MS)),
  ),
});
export type ProjectRunCheckScriptInput = typeof ProjectRunCheckScriptInput.Type;

export const ProjectRunCheckScriptResult = Schema.Struct({
  // Null when the process was killed (timeout or signal) before it exited.
  exitCode: Schema.NullOr(Schema.Number),
  timedOut: Schema.Boolean,
  durationMs: NonNegativeInt,
  // The last CHECK_SCRIPT_OUTPUT_TAIL_LENGTH characters of stdout followed by stderr.
  outputTail: Schema.String,
});
export type ProjectRunCheckScriptResult = typeof ProjectRunCheckScriptResult.Type;

export class CheckScriptError extends Schema.TaggedError<CheckScriptError>()("CheckScriptError", {
  detail: Schema.String,
}) {
  override get message(): string {
    return this.detail;
  }
}
