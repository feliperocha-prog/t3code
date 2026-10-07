/** A generated objective is refreshed each time the user-message count crosses a multiple of this. */
export const OBJECTIVE_REFRESH_EVERY_USER_MESSAGES = 3;

/**
 * Whether a settled turn should refresh the thread's generated objective.
 * `previousCount` is the user-message count this thread was last seen at, or
 * undefined the first time since startup: that sighting only records the count,
 * so a restart never regenerates every thread at once (a refresh due right then
 * waits for the next multiple). A reset to automatic (`force`) refreshes at once.
 */
export function shouldRefreshThreadObjective(input: {
  readonly previousCount: number | undefined;
  readonly userMessageCount: number;
  readonly force: boolean;
}): boolean {
  const { previousCount, userMessageCount, force } = input;
  if (force) return userMessageCount > 0;
  if (previousCount === undefined) return false;
  const every = OBJECTIVE_REFRESH_EVERY_USER_MESSAGES;
  return Math.floor(userMessageCount / every) > Math.floor(previousCount / every);
}
