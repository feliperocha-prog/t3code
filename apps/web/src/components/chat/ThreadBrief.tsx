import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId, ThreadId } from "@t3tools/contracts";
import { PencilIcon, TargetIcon } from "lucide-react";
import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { t, tc } from "~/i18n";
import type { SidebarThreadSummary } from "~/types";

import { threadEnvironment } from "../../state/threads";
import { useAtomCommand } from "../../state/use-atom-command";
import { Button } from "../ui/button";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { StatusCard } from "./StatusCard";
import { resolveStatusCardView } from "./statusCard.logic";
import {
  needsMissingObjective,
  resolveObjectiveCommit,
  THREAD_OBJECTIVE_MAX_LENGTH,
} from "./threadObjective.logic";
import { requestTimelineScrollToMessage } from "./timelineScrollRequest";

// Threads whose missing objective was already asked of the AI in this session, so
// reopening one never pays for a second generation.
const requestedObjectives = new Set<string>();

export interface ThreadBriefProps {
  readonly environmentId: EnvironmentId;
  readonly threadId: ThreadId;
  readonly shell: SidebarThreadSummary;
  /** The conversation has a user message, so there is something to write an objective from. */
  readonly hasUserMessage: boolean;
  /** The objective on screen was written by the AI, not the user. */
  readonly objectiveGenerated: boolean;
  /** The objective on screen was written by the user; the AI no longer updates it. */
  readonly objectiveManual: boolean;
  readonly editingObjective: boolean;
  readonly onEditingObjectiveChange: (editing: boolean) => void;
}

/**
 * The block under the conversation tabs: what the conversation is for
 * (editable objective) and where it stands (one-line status of the last reply).
 */
export function ThreadBrief({
  environmentId,
  threadId,
  shell,
  hasUserMessage,
  objectiveGenerated,
  objectiveManual,
  editingObjective,
  onEditingObjectiveChange,
}: ThreadBriefProps) {
  const objective = shell.objective?.trim() ? shell.objective.trim() : null;
  const updateThreadMetadata = useAtomCommand(threadEnvironment.updateMetadata, {
    reportFailure: false,
  });
  const committedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    committedRef.current = false;
    onEditingObjectiveChange(true);
  }, [onEditingObjectiveChange]);

  const saveMetadata = useCallback(
    (input: Parameters<typeof updateThreadMetadata>[0]["input"]) => {
      void updateThreadMetadata({ environmentId, input }).then((result) => {
        if (result._tag === "Failure" && !isAtomCommandInterrupted(result)) {
          const error = squashAtomCommandFailure(result);
          toastManager.add({
            type: "error",
            title: tc("thread objective", "Failed to save the objective"),
            description: error instanceof Error ? error.message : t("An error occurred."),
          });
        }
      });
    },
    [environmentId, updateThreadMetadata],
  );

  const commit = useCallback(
    (value: string) => {
      onEditingObjectiveChange(false);
      const resolution = resolveObjectiveCommit({ value, original: objective });
      if (resolution.action === "noop") return;
      saveMetadata({ threadId, objective: resolution.objective });
    },
    [objective, onEditingObjectiveChange, saveMetadata, threadId],
  );

  // The way out of manual mode: the AI writes and keeps the objective up to date again.
  // The reset itself asks for the generation, so the empty slot it leaves is not asked again.
  const resetToAutomatic = useCallback(() => {
    committedRef.current = true;
    onEditingObjectiveChange(false);
    requestedObjectives.add(`${environmentId}:${threadId}`);
    saveMetadata({ threadId, resetObjective: true });
  }, [environmentId, onEditingObjectiveChange, saveMetadata, threadId]);

  // Conversations from before the automatic objective, or imported, have none: ask the AI
  // once, the first time one is opened.
  const needsObjective = needsMissingObjective(shell, hasUserMessage);
  useEffect(() => {
    if (!needsObjective) return;
    const key = `${environmentId}:${threadId}`;
    if (requestedObjectives.has(key)) return;
    requestedObjectives.add(key);
    // Silent: the user did not ask for this, so a failure is not theirs to see. A request that
    // did not reach the server is asked again the next time the conversation is opened.
    void updateThreadMetadata({ environmentId, input: { threadId, fillObjective: true } }).then(
      (result) => {
        if (result._tag === "Failure") requestedObjectives.delete(key);
      },
    );
  }, [environmentId, needsObjective, threadId, updateThreadMetadata]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (event.key === "Enter") {
        committedRef.current = true;
        commit(event.currentTarget.value);
      } else if (event.key === "Escape") {
        committedRef.current = true;
        onEditingObjectiveChange(false);
      }
    },
    [commit, onEditingObjectiveChange],
  );

  const view = resolveStatusCardView(shell);
  const objectiveSourceLabel = !objective
    ? null
    : objectiveGenerated
      ? tc("thread objective", "automatic")
      : objectiveManual
        ? tc("thread objective", "written by you")
        : null;

  return (
    <div
      data-thread-brief
      className="flex min-w-0 flex-col gap-1 border-border/50 border-b py-2 pr-(--workspace-gutter-end) pl-(--workspace-gutter-start)"
    >
      <div className="group/objective flex min-w-0 items-center gap-2 text-sm">
        <TargetIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        {editingObjective ? (
          <>
            <input
              ref={inputRef}
              autoFocus
              aria-label={tc("thread objective", "Conversation objective")}
              className="min-w-0 flex-1 rounded-sm bg-transparent text-foreground text-sm outline-none ring-1 ring-ring/50 focus:ring-ring"
              defaultValue={objective ?? ""}
              maxLength={THREAD_OBJECTIVE_MAX_LENGTH}
              placeholder={tc("thread objective", "No objective yet — click to write one")}
              onBlur={(event) => {
                if (committedRef.current) return;
                // Moving focus to "Back to automatic" must not save the draft first.
                if (
                  event.relatedTarget instanceof Element &&
                  event.relatedTarget.closest("[data-objective-reset]")
                ) {
                  return;
                }
                commit(event.currentTarget.value);
              }}
              onFocus={(event) => {
                committedRef.current = false;
                event.currentTarget.select();
              }}
              onKeyDown={handleKeyDown}
            />
            {objectiveManual ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      data-objective-reset
                      variant="ghost"
                      size="xs"
                      className="shrink-0"
                      // Keeps focus in the input, so its blur does not save the draft.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={resetToAutomatic}
                      // Tabbing past the button leaves the edit, so the draft is saved then.
                      onBlur={(event) => {
                        if (committedRef.current || event.relatedTarget === inputRef.current) {
                          return;
                        }
                        if (inputRef.current) {
                          committedRef.current = true;
                          commit(inputRef.current.value);
                        }
                      }}
                    />
                  }
                >
                  {tc("thread objective", "Back to automatic")}
                </TooltipTrigger>
                <TooltipPopup side="bottom">
                  {tc("thread objective", "Claude goes back to writing and updating the objective")}
                </TooltipPopup>
              </Tooltip>
            ) : null}
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    data-thread-objective
                    onClick={startEdit}
                    className={
                      objective
                        ? "min-w-0 cursor-text truncate text-left text-foreground"
                        : "min-w-0 cursor-text truncate text-left text-muted-foreground italic"
                    }
                  />
                }
              >
                {objective ?? tc("thread objective", "No objective yet — click to write one")}
              </TooltipTrigger>
              {objective ? (
                <TooltipPopup side="bottom">
                  <span className="block max-w-80 whitespace-normal">{objective}</span>
                </TooltipPopup>
              ) : null}
            </Tooltip>
            {objectiveSourceLabel ? (
              <span className="shrink-0 text-muted-foreground text-xs">{objectiveSourceLabel}</span>
            ) : null}
            <span className="shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover/objective:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={tc("thread objective", "Edit objective")}
                onClick={startEdit}
              >
                <PencilIcon aria-hidden="true" />
              </Button>
            </span>
          </>
        )}
      </div>
      {view.headline.kind === "none" ? null : (
        <StatusCard view={view} variant="strip" onReveal={requestTimelineScrollToMessage} />
      )}
    </div>
  );
}
