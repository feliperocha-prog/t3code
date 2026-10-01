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
