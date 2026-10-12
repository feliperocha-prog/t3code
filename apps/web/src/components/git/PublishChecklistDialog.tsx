import { squashAtomCommandFailure } from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId, ProjectScript } from "@t3tools/contracts";
import { scanDiffForSecrets } from "@t3tools/shared/secretScan";
import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { t } from "~/i18n";
import { cn } from "~/lib/utils";
import { projectEnvironment } from "~/state/projects";
import { useEnvironmentQuery } from "~/state/query";
import { reviewEnvironment } from "~/state/review";
import { useAtomCommand } from "~/state/use-atom-command";

import { useChangesExplanation } from "../diffs/useChangesExplanation";
import { CHECK_STATUS_PRESENTATION } from "../pullRequest/pullRequestPresentation";
import {
  checklistDecision,
  checklistItemLabel,
  pickCheckScripts,
  reviewVerdict,
  type ChecklistItemId,
  type ChecklistItemState,
  type ChecklistItemStatus,
} from "./publishChecklist.logic";

interface PublishChecklistDialogProps {
  open: boolean;
  environmentId: EnvironmentId;
  cwd: string;
  scripts: ReadonlyArray<ProjectScript>;
  /** Label of the publish button, the action the checklist guards. */
  actionLabel: string;
  onCancel: () => void;
  /** `override` is true when the user publishes despite a failed check. */
  onPublish: (override: boolean) => void;
}

type ScriptCheckId = Extract<ChecklistItemId, "build" | "tests">;

interface ChecklistRow extends ChecklistItemState {
  /** Tail of the script output, shown on demand when the script failed. */
  readonly output?: string;
}

const STATUS_PRESENTATION = {
  running: CHECK_STATUS_PRESENTATION.pending,
  pass: CHECK_STATUS_PRESENTATION.success,
  warn: CHECK_STATUS_PRESENTATION["action-required"],
  fail: CHECK_STATUS_PRESENTATION.failure,
  skipped: CHECK_STATUS_PRESENTATION.skipped,
} satisfies Record<
  ChecklistItemStatus,
  (typeof CHECK_STATUS_PRESENTATION)[keyof typeof CHECK_STATUS_PRESENTATION]
>;

const SECRET_PATHS_SHOWN = 3;

function errorText(error: unknown): string {
  if (typeof error === "object" && error !== null && "detail" in error) {
    const detail = (error as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  return error instanceof Error ? error.message : String(error);
}

function initialScriptRow(id: ScriptCheckId, script: ProjectScript | null, waiting: boolean) {
  if (script === null) {
    return {
      id,
      status: "skipped",
      detail:
        id === "build" ? t("No build script in this project") : t("No test script in this project"),
    } satisfies ChecklistRow;
  }
  return {
    id,
    status: "running",
    detail: waiting ? t("Waiting for the build…") : t("Running {name}…", { name: script.name }),
  } satisfies ChecklistRow;
}

/**
 * The "Before publishing" card: scans the outgoing changes for secrets, runs the
 * project's build and test scripts one after the other, and asks the reviewer
 * for per-file risk. Mount it only while open; every check starts on mount.
 */
export function PublishChecklistDialog({
  open,
  environmentId,
  cwd,
  scripts,
  actionLabel,
  onCancel,
  onPublish,
}: PublishChecklistDialogProps) {
  const { build: buildScript, test: testScript } = useMemo(
    () => pickCheckScripts(scripts),
    [scripts],
  );
  const buildCommand = buildScript?.command ?? null;
  const testCommand = testScript?.command ?? null;

  // What gets published: commits ahead of the base plus what this action commits now.
  const diffPreview = useEnvironmentQuery(
    reviewEnvironment.diffPreview({ environmentId, input: { cwd } }),
  );
  const outgoing = useMemo(() => {
    const sources = diffPreview.data?.sources;
    if (!sources) return null;
    const ordered = [
      ...sources.filter((source) => source.kind === "branch-range"),
      ...sources.filter((source) => source.kind === "working-tree"),
    ];
    return {
      diff: ordered.map((source) => source.diff).join("\n"),
      truncated: ordered.some((source) => source.truncated),
    };
  }, [diffPreview.data]);

  const secretsRow = useMemo((): ChecklistRow => {
    if (outgoing === null) {
      return diffPreview.error === null
        ? { id: "secrets", status: "running", detail: t("Reading the changes…") }
        : {
            id: "secrets",
            status: "fail",
            detail: t("Could not read the changes: {error}", { error: diffPreview.error }),
          };
    }
    const partial = outgoing.truncated ? ` ${t("(large change, only part was checked)")}` : "";
    const findings = scanDiffForSecrets(outgoing.diff);
    if (findings.length === 0) {
      return { id: "secrets", status: "pass", detail: `${t("Nothing found")}${partial}` };
    }
    const places = findings
      .slice(0, SECRET_PATHS_SHOWN)
      .map((finding) => (finding.line === null ? finding.path : `${finding.path}:${finding.line}`))
      .join(", ");
    return {
      id: "secrets",
      status: "fail",
      detail: `${t("{count} possible secret(s): {places}", { count: findings.length, places })}${partial}`,
      output: findings
        .map(
          (finding) =>
            `${finding.path}${finding.line === null ? "" : `:${finding.line}`}  ${finding.excerpt}`,
        )
        .join("\n"),
    };
  }, [diffPreview.error, outgoing]);

  const explanation = useChangesExplanation(
    environmentId,
    outgoing !== null && outgoing.diff.trim().length > 0 ? outgoing.diff : null,
    0,
  );
  const reviewRow = useMemo((): ChecklistRow => {
    const reading = { id: "review", status: "running", detail: t("Reading the changes…") } as const;
    if (outgoing === null) {
      return diffPreview.error === null
        ? reading
        : {
            id: "review",
            status: "warn",
            detail: t("Reviewer did not respond: {error}", { error: diffPreview.error }),
          };
    }
    if (outgoing.diff.trim().length === 0) {
      return { id: "review", status: "skipped", detail: t("No new change to review") };
    }
    if (explanation.data !== null) {
      const verdict = reviewVerdict(explanation.data);
      return { id: "review", status: verdict.status, detail: verdict.reason };
    }
    if (explanation.error !== null) {
      return {
        id: "review",
        status: "warn",
        detail: t("Reviewer did not respond: {error}", { error: explanation.error }),
      };
    }
    return reading;
  }, [diffPreview.error, explanation.data, explanation.error, outgoing]);

  const runCheckScript = useAtomCommand(projectEnvironment.runCheckScript, {
    reportFailure: false,
  });
  const [scriptRows, setScriptRows] = useState<Record<ScriptCheckId, ChecklistRow>>(() => ({
    build: initialScriptRow("build", buildScript, false),
    tests: initialScriptRow("tests", testScript, buildScript !== null),
  }));

  // Build and tests run one after the other: two package managers at once fight over caches.
  useEffect(() => {
    let cancelled = false;
    const queue: Array<[ScriptCheckId, string | null, string]> = [
      ["build", buildCommand, buildScript?.name ?? ""],
      ["tests", testCommand, testScript?.name ?? ""],
    ];
    void (async () => {
      for (const [id, command, name] of queue) {
        if (command === null) continue;
        setScriptRows((rows) => ({
          ...rows,
          [id]: { id, status: "running", detail: t("Running {name}…", { name }) },
        }));
        const result = await runCheckScript({ environmentId, input: { cwd, command } });
        if (cancelled) return;
        let row: ChecklistRow;
        if (result._tag === "Failure") {
          row = {
            id,
            status: "fail",
            detail: t("Could not run: {error}", {
              error: errorText(squashAtomCommandFailure(result)),
            }),
          };
        } else if (result.value.exitCode === 0 && !result.value.timedOut) {
          row = {
            id,
            status: "pass",
            detail: t("Passed in {seconds}s", {
              seconds: Math.max(1, Math.round(result.value.durationMs / 1000)),
            }),
          };
        } else {
          row = {
            id,
            status: "fail",
            detail: result.value.timedOut
              ? t("Failed (timed out)")
              : t("Failed (code {code})", { code: result.value.exitCode ?? "?" }),
            output: result.value.outputTail,
          };
        }
        setScriptRows((rows) => ({ ...rows, [id]: row }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    buildCommand,
    buildScript?.name,
    cwd,
    environmentId,
    runCheckScript,
    testCommand,
    testScript?.name,
  ]);

  const rows: ReadonlyArray<ChecklistRow> = [
    secretsRow,
    scriptRows.build,
    scriptRows.tests,
    reviewRow,
  ];
  const decision = checklistDecision(rows);
  const [expandedOutput, setExpandedOutput] = useState<ChecklistItemId | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("Before publishing")}</DialogTitle>
          <DialogDescription>
            {t("Checks the changes before they leave this machine.")}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const presentation = STATUS_PRESENTATION[row.status];
              const showsOutput = expandedOutput === row.id;
              return (
                <li key={row.id} className="flex items-start gap-3">
                  <presentation.Icon
                    role="img"
                    aria-label={presentation.label}
                    className={cn("mt-0.5 size-4 shrink-0", presentation.toneClassName)}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-medium">{checklistItemLabel(row.id)}</span>
                    <span className="text-xs break-words text-muted-foreground">{row.detail}</span>
                    {row.status === "fail" && row.output ? (
                      <div className="flex flex-col items-start gap-1">
                        <Button
                          variant="link"
                          size="xs"
                          aria-expanded={showsOutput}
                          onClick={() => setExpandedOutput(showsOutput ? null : row.id)}
                        >
                          {showsOutput ? t("Hide output") : t("Show output")}
                        </Button>
                        {showsOutput ? (
                          <pre className="max-h-48 w-full overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap">
                            {row.output}
                          </pre>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </DialogPanel>
        <DialogFooter variant="bare" className="sm:flex-wrap sm:items-center">
          {decision.needsOverride ? (
            <p className="w-full text-xs text-destructive">
              {t("Blocked by: {reasons}. Publishing anyway is on you.", {
                reasons: decision.blockingReasons.join(", "),
              })}
            </p>
          ) : null}
          <Button
            className="w-full sm:mr-auto sm:w-auto"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            {t("Cancel")}
          </Button>
          {decision.needsOverride ? (
            <Button
              className="w-full sm:w-auto"
              variant="destructive"
              size="sm"
              disabled={decision.isRunning}
              onClick={() => onPublish(true)}
            >
              {t("Publish anyway")}
            </Button>
          ) : null}
          <Button
            className="w-full sm:w-auto"
            size="sm"
            disabled={!decision.canPublish}
            onClick={() => onPublish(false)}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
