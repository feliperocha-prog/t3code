import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId, ThreadId } from "@t3tools/contracts";
import { PencilIcon } from "lucide-react";
import { useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { t, tc } from "~/i18n";
import type { SidebarThreadSummary } from "~/types";

import { threadEnvironment } from "../../state/threads";
import { useAtomCommand } from "../../state/use-atom-command";
import { Button } from "../ui/button";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { StatusCard } from "./StatusCard";
import { resolveStatusCardView } from "./statusCard.logic";
import { resolveObjectiveCommit, THREAD_OBJECTIVE_MAX_LENGTH } from "./threadObjective.logic";
import { requestTimelineScrollToMessage } from "./timelineScrollRequest";

export interface ThreadBriefProps {
  readonly environmentId: EnvironmentId;
  readonly threadId: ThreadId;
  readonly shell: SidebarThreadSummary;
  /** The objective on screen was written by the AI, not the user. */
  readonly objectiveGenerated: boolean;
  readonly editingObjective: boolean;
  readonly onEditingObjectiveChange: (editing: boolean) => void;
}

/**
 * The line under the conversation header: what the conversation is for
 * (editable objective) and where it stands (status card of the last reply).
 */
export function ThreadBrief({
  environmentId,
  threadId,
  shell,
  objectiveGenerated,
  editingObjective,
  onEditingObjectiveChange,
}: ThreadBriefProps) {
  const objective = shell.objective?.trim() ? shell.objective.trim() : null;
  const updateThreadMetadata = useAtomCommand(threadEnvironment.updateMetadata, {
    reportFailure: false,
  });
  const committedRef = useRef(false);

  const startEdit = useCallback(() => {
    committedRef.current = false;
    onEditingObjectiveChange(true);
  }, [onEditingObjectiveChange]);

  const commit = useCallback(
    (value: string) => {
      onEditingObjectiveChange(false);
      const resolution = resolveObjectiveCommit({ value, original: objective });
      if (resolution.action === "noop") return;
      void updateThreadMetadata({
        environmentId,
        input: { threadId, objective: resolution.objective },
      }).then((result) => {
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
    [environmentId, objective, onEditingObjectiveChange, threadId, updateThreadMetadata],
  );

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

  return (
    <div
      data-thread-brief
      className="flex min-w-0 flex-col gap-1.5 border-border/60 border-b py-2 pr-(--workspace-gutter-end) pl-(--workspace-gutter-start)"
    >
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className="shrink-0 font-medium text-muted-foreground uppercase tracking-wide">
          {tc("thread objective", "Objective")}
        </span>
        {editingObjective ? (
          <input
            autoFocus
            aria-label={tc("thread objective", "Conversation objective")}
            className="min-w-0 flex-1 rounded-sm bg-transparent text-foreground text-xs outline-none ring-1 ring-ring/50 focus:ring-ring"
            defaultValue={objective ?? ""}
            maxLength={THREAD_OBJECTIVE_MAX_LENGTH}
            placeholder={tc("thread objective", "Set this conversation's objective")}
            onBlur={(event) => {
              if (committedRef.current) return;
              commit(event.currentTarget.value);
            }}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={handleKeyDown}
          />
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
                {objective ?? tc("thread objective", "Set this conversation's objective")}
              </TooltipTrigger>
              {objective ? (
                <TooltipPopup side="bottom">
                  <span className="block max-w-80 whitespace-normal">{objective}</span>
                </TooltipPopup>
              ) : null}
            </Tooltip>
            {objective && objectiveGenerated ? (
              <span className="shrink-0 text-muted-foreground">
                {tc("thread objective", "· proposed by the AI, click to edit")}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0"
              aria-label={tc("thread objective", "Edit objective")}
              onClick={startEdit}
            >
              <PencilIcon aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
      <StatusCard view={view} variant="compact" onReveal={requestTimelineScrollToMessage} />
    </div>
  );
}
