import type { OrchestrationThreadShell } from "@t3tools/contracts";

/** Same cap the server applies to a manual objective. */
export const THREAD_OBJECTIVE_MAX_LENGTH = 200;

/**
 * Objective edit rule: trim, skip the mutation when nothing changed, and send
 * an empty string to clear (the server treats "" as "no objective").
 */
export function resolveObjectiveCommit(input: {
  readonly value: string;
  readonly original: string | null | undefined;
}): { action: "commit"; objective: string } | { action: "noop" } {
  const objective = input.value.trim().slice(0, THREAD_OBJECTIVE_MAX_LENGTH).trim();
  if (objective === (input.original ?? "").trim()) return { action: "noop" };
  return { action: "commit", objective };
}

/**
 * A conversation without an objective gets one asked of the AI when it is opened: older ones
 * from before the automatic objective, and ones imported from Claude Code. A turn on its way
 * or running writes its own objective, so wait for it to settle; the server fills only a slot
 * that is still empty. A manual objective, even an emptied one, is left alone.
 */
export function needsMissingObjective(
  shell: Pick<
    OrchestrationThreadShell,
    "objective" | "objectiveState" | "latestUserMessageAt" | "latestTurn" | "titleRegeneration"
  >,
  hasUserMessage: boolean,
): boolean {
  if (!hasUserMessage || shell.objective?.trim() || shell.objectiveState?.source === "manual") {
    return false;
  }
  if (shell.titleRegeneration != null) return false;
  // No turn yet is a first message still starting one, unless the conversation was imported:
  // those carry messages but never had a turn or a user-message time on the server.
  if (shell.latestTurn == null) return shell.latestUserMessageAt == null;
  return shell.latestTurn.state !== "running";
}
