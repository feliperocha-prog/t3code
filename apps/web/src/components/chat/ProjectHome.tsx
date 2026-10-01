import { scopeProjectRef, scopeThreadRef } from "@t3tools/client-runtime/environment";
import type { EnvironmentId, ProjectId } from "@t3tools/contracts";
import { useNavigate } from "@tanstack/react-router";
import { memo, useMemo, type ReactNode } from "react";

import { tc } from "~/i18n";
import { cn } from "~/lib/utils";
import { sortThreads } from "~/lib/threadSort";
import { useThreadShellsForProjectRefs } from "~/state/entities";
import { buildThreadRouteParams } from "~/threadRoutes";

import ChatMarkdown from "../ChatMarkdown";
import { useProjectFileQuery } from "../files/projectFilesQueryState";
import { Button } from "../ui/button";
import { StatusCard } from "./StatusCard";
import { findH2Section, findRunSections } from "./projectHome.logic";
import { resolveStatusCardView } from "./statusCard.logic";

const RECENT_THREAD_LIMIT = 3;

/** A file read has answered: contents, an error, or "not a file". */
function hasSettled(query: ReturnType<typeof useProjectFileQuery>): boolean {
  return query.data !== null || query.error !== null || query.isNotFile;
}

function HomeBox({
  title,
  tag,
  className,
  children,
}: {
  title: string;
  tag?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-lg border border-border/60 p-3 text-sm",
        className,
      )}
    >
      <h4 className="flex items-center gap-2 font-medium text-2xs text-muted-foreground uppercase tracking-wide">
        {title}
        {tag ? <span className="font-normal normal-case tracking-normal">· {tag}</span> : null}
      </h4>
      {children}
    </section>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-xs">{children}</p>;
}

function SectionBody({
  text,
  cwd,
  environmentId,
}: {
  text: string | null;
  cwd: string;
  environmentId: EnvironmentId;
}) {
  if (text === null) return <Muted>{tc("project home", "Nothing in this section yet.")}</Muted>;
  return (
    <ChatMarkdown text={text} cwd={cwd} environmentId={environmentId} className="min-w-0 text-sm" />
  );
}

export interface ProjectHomeProps {
  readonly environmentId: EnvironmentId;
  readonly projectId: ProjectId;
  readonly workspaceRoot: string;
  /** Client setting; empty shows the "configure it" hint instead of the state note. */
  readonly vaultFolder: string;
  /** State note path relative to the vault folder, already resolved. */
  readonly notePath: string;
}

/**
 * Draft screen of a project: the state note from the vault (where we are, next
 * step, pitfalls), how to run and publish from the README, and the latest
 * conversations. Every read failure degrades to a hint box.
 */
export const ProjectHome = memo(function ProjectHome({
  environmentId,
  projectId,
  workspaceRoot,
  vaultFolder,
  notePath,
}: ProjectHomeProps) {
  const navigate = useNavigate();
  const hasVault = vaultFolder.length > 0;
  const note = useProjectFileQuery(environmentId, vaultFolder, notePath, hasVault);
  const readme = useProjectFileQuery(environmentId, workspaceRoot, "README.md");
  // AGENTS.md is the fallback only once README.md has settled as unreadable.
  const readmeMissing = readme.data === null && hasSettled(readme);
  const agents = useProjectFileQuery(environmentId, workspaceRoot, "AGENTS.md", readmeMissing);

  const noteContents = note.data?.contents ?? null;
  const hub = useMemo(
    () =>
      noteContents === null
        ? null
        : {
            state: findH2Section(noteContents, "Estado"),
            next: findH2Section(noteContents, "Próximo passo"),
            pitfalls: findH2Section(noteContents, "Armadilhas"),
          },
    [noteContents],
  );

  const runFile = readme.data ? "README.md" : agents.data ? "AGENTS.md" : null;
  const runContents = readme.data?.contents ?? agents.data?.contents ?? null;
  const runSections = useMemo(
    () => (runContents === null ? null : findRunSections(runContents)),
    [runContents],
  );
  const runPending = !hasSettled(readme) || (readmeMissing && !hasSettled(agents));

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

  let hubBoxes: ReactNode;
  if (!hasVault) {
    hubBoxes = (
      <HomeBox title={tc("project home", "State note")} className="sm:col-span-3">
        <Muted>{tc("project home", "Set the vault folder in Settings → General")}</Muted>
        <span className="flex">
          <Button
            size="xs"
            variant="outline"
            onClick={() => void navigate({ to: "/settings/general" })}
          >
            {tc("project home", "Open settings")}
          </Button>
        </span>
      </HomeBox>
    );
  } else if (hub === null) {
    hubBoxes = (
      <HomeBox title={tc("project home", "State note")} className="sm:col-span-3">
        <Muted>
          {!hasSettled(note)
            ? tc("project home", "Reading the state note…")
            : tc("project home", "No state note. Expected at {path}", {
                path: `${vaultFolder}/${notePath}`,
              })}
        </Muted>
      </HomeBox>
    );
  } else {
    hubBoxes = (
      <>
        <HomeBox title={tc("project home", "Where we are")}>
          <SectionBody text={hub.state} cwd={vaultFolder} environmentId={environmentId} />
        </HomeBox>
        <HomeBox title={tc("project home", "Next step")}>
          <SectionBody text={hub.next} cwd={vaultFolder} environmentId={environmentId} />
        </HomeBox>
        <HomeBox title={tc("project home", "Pitfalls")}>
          <SectionBody text={hub.pitfalls} cwd={vaultFolder} environmentId={environmentId} />
        </HomeBox>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {hubBoxes}
      <HomeBox
        title={tc("project home", "How to run · how to publish")}
        tag={runFile ? tc("project home", "from {file}", { file: runFile }) : undefined}
        className="sm:col-span-3"
      >
        {runPending ? (
          <Muted>{tc("project home", "Reading the README…")}</Muted>
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
      </HomeBox>
      <HomeBox title={tc("project home", "Latest conversations")} className="sm:col-span-3">
        {recentThreads.length === 0 ? (
          <Muted>{tc("project home", "No conversations in this project yet.")}</Muted>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentThreads.map((shell) => (
              <li key={shell.id} className="flex min-w-0 flex-col gap-1">
                <button
                  type="button"
                  className="min-w-0 cursor-pointer truncate text-left font-medium text-foreground text-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() =>
                    void navigate({
                      to: "/$environmentId/$threadId",
                      params: buildThreadRouteParams(scopeThreadRef(shell.environmentId, shell.id)),
                    })
                  }
                >
                  {shell.title}
                </button>
                <StatusCard view={resolveStatusCardView(shell)} variant="compact" />
              </li>
            ))}
          </ul>
        )}
      </HomeBox>
    </div>
  );
});
