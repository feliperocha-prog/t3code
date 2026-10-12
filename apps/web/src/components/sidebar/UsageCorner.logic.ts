import type { ServerProviderUsageWindow } from "@t3tools/contracts";

export interface CornerWindows {
  readonly session: ServerProviderUsageWindow | null;
  readonly weekly: ServerProviderUsageWindow | null;
}

/**
 * The two windows the sidebar corner shows: the five-hour session and the
 * all-models weekly allowance. The well-known id wins, so a model-specific
 * weekly window (`seven_day_opus`) never displaces the general one; otherwise
 * the first window of that kind stands in.
 */
export function pickCornerWindows(
  windows: ReadonlyArray<ServerProviderUsageWindow>,
): CornerWindows {
  const pick = (id: string, kind: ServerProviderUsageWindow["kind"]) =>
    windows.find((window) => window.id === id) ??
    windows.find((window) => window.kind === kind) ??
    null;
  return { session: pick("five_hour", "session"), weekly: pick("seven_day", "weekly") };
}

export type CornerTone = "ok" | "warning" | "critical";

/** Green until 70% used, amber until 90%, red from there. */
export function cornerTone(usedPercent: number): CornerTone {
  if (usedPercent >= 90) return "critical";
  if (usedPercent >= 70) return "warning";
  return "ok";
}
