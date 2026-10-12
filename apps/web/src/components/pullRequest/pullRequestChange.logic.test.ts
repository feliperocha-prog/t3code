import type { ThreadPullRequestLink, ThreadPullRequestSnapshot } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";
import {
  collectPullRequestChanges,
  collectPullRequestObservations,
  createPullRequestChangeTracker,
  PULL_REQUEST_TOAST_COOLDOWN_MS,
  type PullRequestObservation,
} from "./pullRequestChange.logic";
import type { PullRequestStateKind } from "../chat/pullRequestState";

function observation(kind: PullRequestStateKind, number = 7): PullRequestObservation {
  return {
    key: `github.com acme/site ${number}`,
    number,
    title: "Fix checkout",
    url: `https://github.com/acme/site/pull/${number}`,
    kind,
    label: kind,
  };
}

function link(
  number: number,
  snapshot: Partial<ThreadPullRequestSnapshot> | null,
  source: ThreadPullRequestLink["source"] = "created",
): ThreadPullRequestLink {
  return {
    host: "github.com",
    repository: "acme/site",
    number,
    url: `https://github.com/acme/site/pull/${number}`,
    source,
    linkedAt: "2026-10-01T00:00:00.000Z",
    snapshot:
      snapshot === null
        ? null
        : {
            state: "open",
            title: `PR ${number}`,
            headBranch: "feature",
            baseBranch: "main",
            isDraft: false,
            updatedAt: null,
            syncedAt: "2026-10-01T00:00:00.000Z",
            ...snapshot,
          },
  } as ThreadPullRequestLink;
}

describe("collectPullRequestChanges", () => {
  it("does not notify on the first observation", () => {
    const tracker = createPullRequestChangeTracker();
    expect(collectPullRequestChanges(tracker, [observation("approved")], 0)).toEqual([]);
  });

  it("notifies once when the state changes to one worth announcing", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    expect(collectPullRequestChanges(tracker, [observation("checksFailing")], 1_000)).toEqual([
      observation("checksFailing"),
    ]);
    expect(collectPullRequestChanges(tracker, [observation("checksFailing")], 2_000)).toEqual([]);
  });

  it("stays quiet for states that need no action", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    expect(collectPullRequestChanges(tracker, [observation("conflicting")], 1_000)).toEqual([]);
    expect(collectPullRequestChanges(tracker, [observation("draft")], 2_000)).toEqual([]);
  });

  it("never announces the same request and state twice", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    collectPullRequestChanges(tracker, [observation("approved")], 1_000);
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 2 * 60_000);
    expect(collectPullRequestChanges(tracker, [observation("approved")], 4 * 60_000)).toEqual([]);
  });

  it("sends at most one toast per request per minute", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    expect(collectPullRequestChanges(tracker, [observation("approved")], 1_000)).toHaveLength(1);
    expect(collectPullRequestChanges(tracker, [observation("merged")], 2_000)).toEqual([]);
    // Deferred, not lost: the merge is announced once the cooldown is over.
    expect(
      collectPullRequestChanges(
        tracker,
        [observation("merged")],
        1_000 + PULL_REQUEST_TOAST_COOLDOWN_MS,
      ),
    ).toEqual([observation("merged")]);
  });

  it("drops a deferred change that reverted before the cooldown ended", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    expect(collectPullRequestChanges(tracker, [observation("approved")], 1_000)).toHaveLength(1);
    expect(collectPullRequestChanges(tracker, [observation("merged")], 2_000)).toEqual([]);
    expect(collectPullRequestChanges(tracker, [observation("approved")], 3_000)).toEqual([]);
    expect(
      collectPullRequestChanges(
        tracker,
        [observation("approved")],
        1_000 + PULL_REQUEST_TOAST_COOLDOWN_MS,
      ),
    ).toEqual([]);
  });

  it("treats a request that dropped out and came back as a fresh observation", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(tracker, [observation("awaitingReview")], 0);
    collectPullRequestChanges(tracker, [], 1_000);
    expect(collectPullRequestChanges(tracker, [observation("merged")], 2_000)).toEqual([]);
  });

  it("tracks each request on its own", () => {
    const tracker = createPullRequestChangeTracker();
    collectPullRequestChanges(
      tracker,
      [observation("awaitingReview", 1), observation("draft", 2)],
      0,
    );
    expect(
      collectPullRequestChanges(
        tracker,
        [observation("merged", 1), observation("draft", 2)],
        1_000,
      ),
    ).toEqual([observation("merged", 1)]);
  });
});

describe("collectPullRequestObservations", () => {
  it("keeps one entry per request and skips unsynced, dismissed and archived links", () => {
    const observations = collectPullRequestObservations([
      { archivedAt: null, pullRequests: [link(1, { state: "merged" }), link(2, null)] },
      {
        archivedAt: null,
        pullRequests: [link(1, { state: "merged" }), link(3, {}, "stack-dismissed")],
      },
      { archivedAt: "2026-10-02T00:00:00.000Z", pullRequests: [link(4, {})] },
    ]);
    expect(observations.map((entry) => [entry.number, entry.kind, entry.title])).toEqual([
      [1, "merged", "PR 1"],
    ]);
  });
});
