import type {
  PullRequestChecksState,
  PullRequestMergeability,
  PullRequestReviewDecision,
  PullRequestState,
} from "@t3tools/contracts";
import { tc } from "~/i18n";

/**
 * The fields that decide where a review request stands. Both a list entry and a
 * thread's synced snapshot carry them, so either can be described.
 */
export interface PullRequestStateInput {
  readonly state: PullRequestState;
  readonly isDraft?: boolean | null | undefined;
  readonly checksState?: PullRequestChecksState | null | undefined;
  readonly reviewDecision?: PullRequestReviewDecision | null | undefined;
  readonly mergeability?: PullRequestMergeability | null | undefined;
}

export type PullRequestStateKind =
  | "merged"
  | "closed"
  | "draft"
  | "checksFailing"
  | "changesRequested"
  | "approved"
  | "conflicting"
  | "awaitingReview";

export type PullRequestStateTone = "green" | "yellow" | "red" | "grey";

export interface PullRequestStateDescription {
  readonly kind: PullRequestStateKind;
  readonly label: string;
  readonly tone: PullRequestStateTone;
}

const STATE_COPY: Readonly<
  Record<PullRequestStateKind, { readonly text: string; readonly tone: PullRequestStateTone }>
> = {
  merged: { text: "Already live (joined)", tone: "green" },
  closed: { text: "Closed without joining", tone: "grey" },
  draft: { text: "Draft", tone: "grey" },
  checksFailing: { text: "Checks failing", tone: "red" },
  changesRequested: { text: "Changes requested", tone: "yellow" },
  approved: { text: "Approved, not joined yet", tone: "green" },
  conflicting: { text: "Has a conflict", tone: "red" },
  awaitingReview: { text: "Awaiting review", tone: "yellow" },
};

function resolveKind(entry: PullRequestStateInput): PullRequestStateKind {
  if (entry.state === "merged") return "merged";
  if (entry.state === "closed") return "closed";
  if (entry.isDraft) return "draft";
  if (entry.checksState === "failing") return "checksFailing";
  if (entry.reviewDecision === "changes-requested") return "changesRequested";
  if (entry.reviewDecision === "approved") return "approved";
  if (entry.mergeability === "conflicting") return "conflicting";
  return "awaitingReview";
}

/** Where a review request stands, in plain words, highest-priority state first. */
export function describePullRequestState(
  entry: PullRequestStateInput,
): PullRequestStateDescription {
  const kind = resolveKind(entry);
  const copy = STATE_COPY[kind];
  return { kind, label: tc("pull request status", copy.text), tone: copy.tone };
}
