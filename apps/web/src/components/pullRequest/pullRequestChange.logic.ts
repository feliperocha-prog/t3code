import type { ThreadPullRequestLink } from "@t3tools/contracts";
import { describePullRequestState, type PullRequestStateKind } from "../chat/pullRequestState";

/** States worth interrupting someone for: something to act on, or it went live. */
export const NOTIFIABLE_PULL_REQUEST_KINDS: ReadonlySet<PullRequestStateKind> = new Set([
  "checksFailing",
  "changesRequested",
  "approved",
  "merged",
]);

/** At most one toast per review request inside this window. */
export const PULL_REQUEST_TOAST_COOLDOWN_MS = 60_000;

export interface PullRequestObservation {
  /** host + repository + number: the same request linked from two threads is one entry. */
  readonly key: string;
  readonly number: number;
  readonly title: string;
  readonly url: string;
  readonly kind: PullRequestStateKind;
  readonly label: string;
}

export interface PullRequestChangeTracker {
  /** Last described state per request seen in this page session. */
  readonly previous: Map<string, PullRequestStateKind>;
  /** `key|kind` pairs already announced, so a state is never announced twice. */
  readonly announced: Set<string>;
  /** When the last toast for each request went out. */
  readonly lastToastAt: Map<string, number>;
}

export function createPullRequestChangeTracker(): PullRequestChangeTracker {
  return { previous: new Map(), announced: new Set(), lastToastAt: new Map() };
}

interface ThreadShellPullRequests {
  readonly archivedAt?: string | null;
  readonly pullRequests?: ReadonlyArray<ThreadPullRequestLink>;
}

/**
 * Review requests the client already holds in memory (synced onto each thread's
 * links by the server), one entry per request. Links without a synced snapshot
 * and stack layers the user dismissed are skipped.
 */
export function collectPullRequestObservations(
  threads: ReadonlyArray<ThreadShellPullRequests>,
): PullRequestObservation[] {
  const byKey = new Map<string, PullRequestObservation>();
  for (const thread of threads) {
    if (thread.archivedAt) continue;
    for (const link of thread.pullRequests ?? []) {
      if (link.source === "stack-dismissed" || link.snapshot === null) continue;
      const key = `${link.host} ${link.repository} ${link.number}`;
      if (byKey.has(key)) continue;
      const description = describePullRequestState(link.snapshot);
      byKey.set(key, {
        key,
        number: link.number,
        title: link.snapshot.title,
        url: link.url,
        kind: description.kind,
        label: description.label,
      });
    }
  }
  return [...byKey.values()];
}

/**
 * Compares this observation with the previous one and returns the requests that
 * should raise a toast. A request seen for the first time (page load, or coming
 * back after it dropped out, e.g. on reconnect) only records its state.
 */
export function collectPullRequestChanges(
  tracker: PullRequestChangeTracker,
  observations: ReadonlyArray<PullRequestObservation>,
  now: number,
): PullRequestObservation[] {
  const changes: PullRequestObservation[] = [];
  const seen = new Set<string>();
  for (const observation of observations) {
    seen.add(observation.key);
    const previousKind = tracker.previous.get(observation.key);
    if (previousKind === observation.kind) continue;
    const announcement = `${observation.key}|${observation.kind}`;
    const lastToastAt = tracker.lastToastAt.get(observation.key);
    const coolingDown =
      lastToastAt !== undefined && now - lastToastAt < PULL_REQUEST_TOAST_COOLDOWN_MS;
    const announceable =
      previousKind !== undefined &&
      NOTIFIABLE_PULL_REQUEST_KINDS.has(observation.kind) &&
      !tracker.announced.has(announcement);
    // A change that lands inside the cooldown is deferred, not dropped: the
    // previous state stays as it was so the next tick re-evaluates the transition.
    if (announceable && coolingDown) continue;
    tracker.previous.set(observation.key, observation.kind);
    if (!announceable) continue;
    tracker.announced.add(announcement);
    tracker.lastToastAt.set(observation.key, now);
    changes.push(observation);
  }
  for (const key of tracker.previous.keys()) {
    if (!seen.has(key)) tracker.previous.delete(key);
  }
  return changes;
}
