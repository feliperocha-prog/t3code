import type { ServerProvider } from "@t3tools/contracts";

/** How long the usage screen waits before re-reading limits that failed to load. */
export const LIMITS_PROBE_RETRY_DELAY_MS = 25_000;

/** Whether any provider came back with "Could not read limits" (a probe that failed this time). */
export function hasProbeFailedLimits(
  providers: ReadonlyArray<Pick<ServerProvider, "usageLimits">>,
): boolean {
  return providers.some((provider) => provider.usageLimits?.unavailable?.reason === "probeFailed");
}
