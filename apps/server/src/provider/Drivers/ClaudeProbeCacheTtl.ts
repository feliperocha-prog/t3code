import * as Duration from "effect/Duration";
import * as Exit from "effect/Exit";

/** A probe that read the usage limits stays cached for five minutes. */
export const CAPABILITIES_PROBE_TTL = Duration.minutes(5);

/**
 * A probe that came back without usage limits (the optional `get_usage`
 * request timed out, or the whole probe failed) is retried soon, so
 * "Could not read limits" does not stick for the full five minutes.
 */
export const CAPABILITIES_PROBE_RETRY_TTL = Duration.seconds(20);

export const probeCacheTtl = <A extends { readonly usage?: unknown } | undefined, E>(
  exit: Exit.Exit<A, E>,
): Duration.Duration =>
  Exit.isSuccess(exit) && exit.value?.usage !== undefined
    ? CAPABILITIES_PROBE_TTL
    : CAPABILITIES_PROBE_RETRY_TTL;
