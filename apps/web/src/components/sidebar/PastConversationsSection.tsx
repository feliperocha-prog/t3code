import type { ClientSettings } from "@t3tools/contracts";
import { useEffect, useState } from "react";

import { Spinner } from "~/components/ui/spinner";
import { toastManager } from "~/components/ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { useClientSettings } from "~/hooks/useSettings";
import { t } from "~/i18n";
import { usePrimaryEnvironmentId } from "~/state/environments";
import { useProjects } from "~/state/entities";
import { projectEnvironment } from "~/state/projects";
import { useAtomCommand } from "~/state/use-atom-command";

import {
  buildPastConversationsCommand,
  formatPastConversationDate,
  parsePastConversations,
  PAST_CONVERSATIONS_MAX_RESULTS,
  pastConversationSummary,
  projectLabel,
  resumeCommand,
  sanitizePastConversationsQuery,
  type PastConversation,
} from "./pastConversations.logic";

const SEARCH_DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;
const SEARCH_TIMEOUT_MS = 15_000;
// Eight blocks of a few hundred characters each; the tail would cut the first ones.
const SEARCH_OUTPUT_CHARS = 32_000;

const selectCommand = (settings: ClientSettings) => settings.pastConversationsCommand;

type SearchState =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | { readonly status: "done"; readonly results: ReadonlyArray<PastConversation> };

/**
 * "Did we talk about this?": old Claude Code terminal conversations matching the
 * sidebar search, found by a local script on the primary environment. A click
 * copies the command that resumes the conversation; the app opens no terminal.
 */
export function PastConversationsSection({ query }: { query: string }) {
  const baseCommand = useClientSettings(selectCommand).trim();
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const projects = useProjects();
  // The script reads absolute paths, so any existing folder on that machine works as cwd.
  const cwd =
    projects.find((project) => project.environmentId === primaryEnvironmentId)?.workspaceRoot ??
    null;
  const runCheckScript = useAtomCommand(projectEnvironment.runCheckScript, {
    reportFailure: false,
  });
  const [state, setState] = useState<SearchState | null>(null);

  const searchTerm = sanitizePastConversationsQuery(query);
  const enabled =
    baseCommand.length > 0 &&
    primaryEnvironmentId !== null &&
    cwd !== null &&
    searchTerm.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!enabled || primaryEnvironmentId === null || cwd === null) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setState({ status: "loading" });
      void runCheckScript({
        environmentId: primaryEnvironmentId,
        input: {
          cwd,
          command: buildPastConversationsCommand(baseCommand, searchTerm),
          timeoutMs: SEARCH_TIMEOUT_MS,
          maxOutputChars: SEARCH_OUTPUT_CHARS,
        },
      }).then((result) => {
        // A newer query (or the checklist sharing this queue) may have answered first.
        if (cancelled) return;
        if (result._tag === "Failure" || result.value.exitCode !== 0 || result.value.timedOut) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "done", results: parsePastConversations(result.value.outputTail) });
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [baseCommand, cwd, enabled, primaryEnvironmentId, runCheckScript, searchTerm]);

  const { copyToClipboard } = useCopyToClipboard<void>({
    onCopy: () => {
      toastManager.add({
        type: "success",
        title: t("Command copied — paste it in the terminal inside the project folder"),
      });
    },
    onError: (error) => {
      toastManager.add({
        type: "error",
        title: t("Could not copy the command"),
        description: error.message,
      });
    },
  });

  if (!enabled || state === null) return null;
  const results =
    state.status === "done" ? state.results.slice(0, PAST_CONVERSATIONS_MAX_RESULTS) : [];
  if (state.status === "done" && results.length === 0) return null;

  return (
    <section className="mt-3 flex flex-col gap-1 border-sidebar-border border-t px-1 pt-2">
      <div className="flex items-center gap-1.5 px-1 text-sidebar-muted-foreground">
        <Tooltip>
          <TooltipTrigger render={<h3 className="text-xs font-medium" />}>
            {t("Did we talk about this? (Claude Code)")}
          </TooltipTrigger>
          <TooltipPopup side="right">
            {t(
              "Old Claude Code conversations from the terminal. Click to copy the command that reopens the conversation.",
            )}
          </TooltipPopup>
        </Tooltip>
        {state.status === "loading" ? <Spinner size="xs" /> : null}
      </div>
      {state.status === "error" ? (
        <p className="px-1 text-sidebar-muted-foreground text-xs">
          {t("Could not search old conversations")}
        </p>
      ) : null}
      {results.length > 0 ? (
        <ul className="flex flex-col gap-px">
          {results.map((conversation) => (
            <li key={conversation.sessionId}>
              <button
                type="button"
                className="flex w-full min-w-0 flex-col gap-0.5 rounded-md px-1.5 py-1 text-left outline-none hover:bg-sidebar-row-hover focus-visible:bg-sidebar-row-hover"
                onClick={() => copyToClipboard(resumeCommand(conversation.sessionId))}
              >
                <span className="flex min-w-0 items-baseline gap-1.5 text-xs">
                  <span className="shrink-0 tabular-nums text-sidebar-muted-foreground">
                    {formatPastConversationDate(conversation.endDate ?? conversation.startDate)}
                  </span>
                  <span className="truncate font-medium">
                    {projectLabel(conversation.projectDir)}
                  </span>
                </span>
                <span className="truncate text-sidebar-muted-foreground text-xs">
                  {pastConversationSummary(conversation)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
