import { scopeProjectRef, scopeThreadRef } from "@t3tools/client-runtime/environment";
import type { EnvironmentId, ProjectId } from "@t3tools/contracts";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon, ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import { memo, useMemo, useState, type ReactNode } from "react";

import { t, tc } from "~/i18n";
import { readLocalApi } from "~/localApi";
import { cn } from "~/lib/utils";
import { sortThreads } from "~/lib/threadSort";
import { useThreadShellsForProjectRefs } from "~/state/entities";
import { usePullRequestList } from "~/state/pullRequests";
import { useEnvironmentQuery } from "~/state/query";
import { vcsEnvironment } from "~/state/vcs";
import { buildThreadRouteParams } from "~/threadRoutes";
import { formatRelativeTimeLabel } from "~/timestampFormat";

import ChatMarkdown from "../ChatMarkdown";
import { useProjectFileQuery } from "../files/projectFilesQueryState";
import { GitTerm } from "../git/GitTerm";
import { gitTermSimple, gitTermTechnical } from "../git/gitTerms";
import { readPullRequestListPreferences } from "../pullRequest/pullRequestListPreferences";
import { Button } from "../ui/button";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../ui/collapsible";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { describeDeployState, type DeployStateTone } from "./deployState";
import { compactRelativeTimeLabel, findRunSections, readHubDigest } from "./projectHome.logic";
import { describePullRequestState, type PullRequestStateTone } from "./pullRequestState";
import {
  resolveStatusCardView,
  type StatusCardHeadline,
  type StatusCardTone,
} from "./statusCard.logic";
import { useProjectBrief } from "./useProjectBrief";

const RECENT_THREAD_LIMIT = 3;
/** Rows the review-request block shows. */
const PULL_REQUEST_ROW_LIMIT = 8;
/** Fetched a little past the rows shown, so sorting by last activity picks from more than the first page. */
const PULL_REQUEST_FETCH_LIMIT = 20;

const PULL_REQUEST_TONE_DOT: Record<PullRequestStateTone, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
  grey: "bg-muted-foreground/50",
};

const DEPLOY_TONE_DOT: Record<DeployStateTone, string> = {
  green: "bg-success",
  yellow: "bg-warning",
};

/** Dot colour per status tone, the same semantic colours the status Badge uses. */
const TONE_DOT: Record<StatusCardTone, string> = {
  working: "bg-info",
  waiting: "bg-warning",
  done: "bg-success",
  failed: "bg-destructive",
  neutral: "bg-muted-foreground/50",
};

/** A file read has answered: contents, an error, or "not a file". */
function hasSettled(query: ReturnType<typeof useProjectFileQuery>): boolean {
  return query.data !== null || query.error !== null || query.isNotFile;
}

function relativeTime(isoDate: string): string {
  return compactRelativeTimeLabel(formatRelativeTimeLabel(isoDate), t("now"));
}

function headlineLabel(headline: StatusCardHeadline): string {
  switch (headline.kind) {
    case "working":
      return tc("status card", "Working…");
    case "approval":
      return tc("status card", "Waiting on you: approve");
    case "input":
      return tc("status card", "Waiting on you: answer");
    case "failed":
      return tc("status card", "Failed");
    case "none":
      // Like the conversation strip, a thread without a status shows no status line.
      return "";
    case "card":
      return headline.status;
  }
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>;
}

/** Text that shows the underlying error on hover, when there is one. */
function ErrorHint({ error, children }: { error: string | null; children: ReactNode }) {
  if (!error) return <span>{children}</span>;
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>{children}</TooltipTrigger>
      <TooltipPopup>{error}</TooltipPopup>
    </Tooltip>
  );
}

function BlockLabel({ children }: { children: ReactNode }) {
  return <h4 className="font-medium text-muted-foreground text-xs">{children}</h4>;
}

function ItemList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="flex list-disc flex-col gap-1 ps-5 text-sm leading-relaxed marker:text-muted-foreground">
      {items.map((item, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- items are plain text that may repeat
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** Where we are · what is left · what could go wrong. Empty "where" and "risks" are left out. */
function HubBlocks({
  where,
  next,
  risks,
}: {
  where: string;
  next: ReadonlyArray<string>;
  risks: ReadonlyArray<string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {where.trim().length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <BlockLabel>{tc("project home", "Where we are")}</BlockLabel>
          <p className="text-sm leading-relaxed">{where}</p>
        </section>
      ) : null}
      <section className="flex flex-col gap-1.5">
        <BlockLabel>{tc("project home", "What is left")}</BlockLabel>
        {next.length > 0 ? (
          <ItemList items={next} />
        ) : (
          <Muted>{tc("project home", "Nothing pending in the hub.")}</Muted>
        )}
      </section>
      {risks.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <BlockLabel>{tc("project home", "What could go wrong")}</BlockLabel>
          <ItemList items={risks} />
        </section>
      ) : null}
    </div>
  );
}

/**
 * The hub note summarized by the text model. Until the summary arrives (or when
 * it fails) the same blocks come from a plain reading of the note's sections.
 */
function ProjectSummaryCard({
  environmentId,
  vaultFolder,
  notePath,
}: {
  environmentId: EnvironmentId;
  vaultFolder: string;
  notePath: string;
}) {
  const navigate = useNavigate();
  const hasVault = vaultFolder.length > 0;
  const note = useProjectFileQuery(environmentId, vaultFolder, notePath, hasVault);
  const noteContents = note.data?.contents ?? null;
  const [refreshNonce, setRefreshNonce] = useState(0);
  const brief = useProjectBrief(environmentId, noteContents, refreshNonce);
  const digest = useMemo(() => readHubDigest(noteContents ?? ""), [noteContents]);
  const redo = () => setRefreshNonce((nonce) => nonce + 1);
  const summaryUnavailable = (
    <>
      <ErrorHint error={brief.error}>
        {tc("project home", "Automatic summary unavailable")}
      </ErrorHint>
      <Button size="xs" variant="outline" onClick={redo}>
        {t("Try again")}
      </Button>
    </>
  );

  let status: ReactNode = null;
  let body: ReactNode;
  if (!hasVault) {
    body = (
      <div className="flex flex-col items-start gap-3">
        <Muted>{tc("project home", "Set the vault folder in Settings → General")}</Muted>
        <Button
          size="xs"
          variant="outline"
          onClick={() => void navigate({ to: "/settings/general" })}
        >
          {tc("project home", "Open settings")}
        </Button>
      </div>
    );
  } else if (noteContents === null) {
    body = (
      <Muted>
        {!hasSettled(note) ? (
          tc("project home", "Reading the hub…")
        ) : (
          <ErrorHint error={note.error ?? null}>
            {tc(
              "project home",
              "Couldn't read the hub at {path}. If it doesn't exist yet, create it there.",
              { path: `${vaultFolder}/${notePath}` },
            )}
          </ErrorHint>
        )}
      </Muted>
    );
  } else if (brief.data !== null) {
    const redoLabel = tc("project home", "Redo summary");
    status = brief.isPending ? (
      <span>{tc("project home", "Summarizing…")}</span>
    ) : brief.error !== null ? (
      summaryUnavailable
    ) : (
      <>
        <span>
          {tc("project home", "Automatic summary · {time}", {
            time: relativeTime(brief.data.generatedAt),
          })}
        </span>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={redoLabel}
          title={redoLabel}
          onClick={redo}
        >
          <RefreshCwIcon aria-hidden />
        </Button>
      </>
    );
    body = <HubBlocks where={brief.data.where} next={brief.data.next} risks={brief.data.risks} />;
  } else {
    status =
      brief.error !== null ? summaryUnavailable : <span>{tc("project home", "Summarizing…")}</span>;
    const digestEmpty =
      digest.where.length === 0 && digest.next.length === 0 && digest.risks.length === 0;
    body = !digestEmpty ? (
      <HubBlocks where={digest.where.join(" ")} next={digest.next} risks={digest.risks} />
    ) : brief.error !== null ? (
      <Muted>{tc("project home", "The hub has no Estado, Pendente or Armadilhas sections.")}</Muted>
    ) : null;
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="font-medium text-sm">{tc("project home", "Project summary")}</h3>
        {status !== null ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">{status}</div>
        ) : null}
      </header>
      {body}
    </section>
  );
}

/** The project's latest conversations as rows: state dot, title, age, then state and "you" line. */
function RecentConversations({
  environmentId,
  projectId,
}: {
  environmentId: EnvironmentId;
  projectId: ProjectId;
}) {
  const navigate = useNavigate();
  const projectRefs = useMemo(
    () => [scopeProjectRef(environmentId, projectId)],
    [environmentId, projectId],
  );
  const shells = useThreadShellsForProjectRefs(projectRefs);
  const recentThreads = useMemo(
    () =>
      sortThreads(
        shells.filter((shell) => shell.archivedAt === null),
        "updated_at",
      ).slice(0, RECENT_THREAD_LIMIT),
    [shells],
  );

  return (
    <section className="flex flex-col gap-2">
      <h3 className="px-2 font-medium text-muted-foreground text-xs">
        {tc("project home", "Latest conversations")}
      </h3>
      {recentThreads.length === 0 ? (
        <p className="px-2 text-muted-foreground text-sm">
          {tc("project home", "No conversations in this project yet.")}
        </p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {recentThreads.map((shell) => {
            const view = resolveStatusCardView(shell);
            const state = headlineLabel(view.headline);
            const you = tc("status card", "You");
            const detail = view.voce.length > 0 ? `${state} · ${you}: ${view.voce}` : state;
            return (
              <li key={shell.id} className="min-w-0">
                <button
                  type="button"
                  className="flex w-full min-w-0 cursor-pointer flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() =>
                    void navigate({
                      to: "/$environmentId/$threadId",
                      params: buildThreadRouteParams(scopeThreadRef(shell.environmentId, shell.id)),
                    })
                  }
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={cn("size-2 shrink-0 rounded-full", TONE_DOT[view.tone])}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-sm">
                      {shell.title}
                    </span>
                    <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                      {relativeTime(shell.latestUserMessageAt ?? shell.updatedAt)}
                    </span>
                  </span>
                  {detail.length > 0 ? (
                    <span className="min-w-0 truncate ps-4 text-muted-foreground text-xs">
                      {detail}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/**
 * How far the project's work is from GitHub, from the git status the app already
 * streams. Hidden while the status loads and when the folder is not a repository.
 */
function DeployStatus({
  environmentId,
  workspaceRoot,
}: {
  environmentId: EnvironmentId;
  workspaceRoot: string;
}) {
  const gitStatus = useEnvironmentQuery(
    workspaceRoot.length > 0
      ? vcsEnvironment.status({ environmentId, input: { cwd: workspaceRoot } })
      : null,
  );
  const lines = useMemo(
    () => (gitStatus.data ? describeDeployState(gitStatus.data) : null),
    [gitStatus.data],
  );
  if (lines === null) return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="px-2 font-medium text-muted-foreground text-xs">
        {tc("project home", "Is it live?")}
      </h3>
      <ul className="flex flex-col gap-1 px-2">
        {lines.map((line) => (
          <li key={line.kind} className="flex min-w-0 items-center gap-2 text-sm">
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", DEPLOY_TONE_DOT[line.tone])}
            />
            <span className="min-w-0 truncate">{line.text}</span>
            {line.term !== null ? <GitTerm term={line.term} variant="technical" /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The project's review requests (PRs), most recently active first, each opening
 * in the browser. Hidden when the project has none.
 */
function ReviewRequests({
  environmentId,
  projectId,
}: {
  environmentId: EnvironmentId;
  projectId: ProjectId;
}) {
  const navigate = useNavigate();
  const targets = useMemo(
    () => [
      {
        environmentId,
        input: { state: "all" as const, projectId, limit: PULL_REQUEST_FETCH_LIMIT },
      },
    ],
    [environmentId, projectId],
  );
  const pullRequests = usePullRequestList(targets);
  const entries = useMemo(
    () =>
      (pullRequests.data?.entries ?? [])
        .filter((entry) => entry.projectId === projectId)
        .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, PULL_REQUEST_ROW_LIMIT),
    [projectId, pullRequests.data],
  );
  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center justify-between gap-3 px-2">
        <h3 className="font-medium text-muted-foreground text-xs">
          {`${tc("git term", "Review requests")} · ${gitTermTechnical("pr")}s`}
        </h3>
        <Button
          size="xs"
          variant="ghost"
          onClick={() =>
            void navigate({
              to: "/pull-requests",
              search: { ...readPullRequestListPreferences(), projectId },
            })
          }
        >
          {tc("project home", "See all")}
        </Button>
      </header>
      <ul className="flex flex-col gap-0.5">
        {entries.map((entry) => {
          const state = describePullRequestState(entry);
          return (
            <li
              key={`${entry.environmentId} ${entry.host} ${entry.repository} ${entry.number}`}
              className="min-w-0"
            >
              <button
                type="button"
                aria-label={`${gitTermSimple("pr")} #${entry.number}: ${entry.title} · ${state.label}`}
                className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
                onClick={() => void readLocalApi()?.shell.openExternal(entry.url)}
              >
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full", PULL_REQUEST_TONE_DOT[state.tone])}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-sm">{entry.title}</span>
                <span className="shrink-0 text-muted-foreground text-xs">{state.label}</span>
                <ExternalLinkIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Run and publish sections of the README, collapsed; the files are read only once it opens. */
function RunAndPublish({
  environmentId,
  workspaceRoot,
}: {
  environmentId: EnvironmentId;
  workspaceRoot: string;
}) {
  const [open, setOpen] = useState(false);
  const readme = useProjectFileQuery(environmentId, workspaceRoot, "README.md", open);
  // AGENTS.md is the fallback only once README.md has settled as unreadable.
  const readmeMissing = readme.data === null && hasSettled(readme);
  const agents = useProjectFileQuery(
    environmentId,
    workspaceRoot,
    "AGENTS.md",
    open && readmeMissing,
  );

  const runFile = readme.data ? "README.md" : agents.data ? "AGENTS.md" : null;
  const runContents = readme.data?.contents ?? agents.data?.contents ?? null;
  const runSections = useMemo(
    () => (runContents === null ? null : findRunSections(runContents)),
    [runContents],
  );
  const runPending = !hasSettled(readme) || (readmeMissing && !hasSettled(agents));

  return (
    <div className="rounded-xl border border-border/60">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-medium text-sm hover:bg-accent/40 data-panel-open:[&_svg]:rotate-90">
          <ChevronRightIcon
            className="size-4 shrink-0 text-muted-foreground transition-transform"
            aria-hidden
          />
          <span className="min-w-0 flex-1">{tc("project home", "How to run and publish")}</span>
          {runFile !== null ? (
            <span className="shrink-0 font-normal text-muted-foreground text-xs">
              {tc("project home", "from {file}", { file: runFile })}
            </span>
          ) : null}
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="px-4 pt-1 pb-4">
            {runPending ? (
              <Muted>{tc("project home", "Reading the project files…")}</Muted>
            ) : runFile === null ? (
              <Muted>{tc("project home", "No README.md or AGENTS.md in this project.")}</Muted>
            ) : runSections === null ? (
              <Muted>
                {tc("project home", "{file} has no section about running or publishing.", {
                  file: runFile,
                })}
              </Muted>
            ) : (
              <ChatMarkdown
                text={runSections}
                cwd={workspaceRoot}
                environmentId={environmentId}
                className="min-w-0 text-sm"
              />
            )}
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}

export interface ProjectHomeProps {
  readonly environmentId: EnvironmentId;
  readonly projectId: ProjectId;
  readonly workspaceRoot: string;
  /** Client setting; empty shows the "configure it" hint instead of the summary. */
  readonly vaultFolder: string;
  /** State note path relative to the vault folder, already resolved. */
  readonly notePath: string;
}

/**
 * Draft screen of a project, one column under the composer: the hub summary
 * (where we are, what is left, what could go wrong), the latest conversations,
 * whether the work is published, the review requests (PRs), and how to run and
 * publish from the README, collapsed.
 */
export const ProjectHome = memo(function ProjectHome({
  environmentId,
  projectId,
  workspaceRoot,
  vaultFolder,
  notePath,
}: ProjectHomeProps) {
  return (
    <div className="flex flex-col gap-6">
      <ProjectSummaryCard
        environmentId={environmentId}
        vaultFolder={vaultFolder}
        notePath={notePath}
      />
      <RecentConversations environmentId={environmentId} projectId={projectId} />
      <DeployStatus environmentId={environmentId} workspaceRoot={workspaceRoot} />
      <ReviewRequests environmentId={environmentId} projectId={projectId} />
      <RunAndPublish environmentId={environmentId} workspaceRoot={workspaceRoot} />
    </div>
  );
});
