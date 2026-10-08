import type { MessageId, ThreadStatusCard } from "@t3tools/contracts";

import { resolveSidebarThreadStatus } from "../Sidebar.logic";

/** Pill colour family. Mapped to Badge variants by StatusCard. */
export type StatusCardTone = "working" | "waiting" | "done" | "failed" | "neutral";

/**
 * What the headline says. Live session states outrank the last reply's
 * STATUS block: a stale "pronto" must never hide a pending approval.
 */
export type StatusCardHeadline =
  | { readonly kind: "working" }
  | { readonly kind: "approval" }
  | { readonly kind: "input" }
  | { readonly kind: "failed" }
  | { readonly kind: "card"; readonly status: string }
  | { readonly kind: "none" };

export interface StatusCardView {
  readonly tone: StatusCardTone;
  readonly headline: StatusCardHeadline;
  /** VOCÊ / EU of the last reply. Empty while a live state is shown: they describe the previous turn. */
  readonly voce: string;
  readonly eu: string;
  /** Message the card came from, for scroll-to; null when there is no card on screen. */
  readonly messageId: MessageId | null;
}

export type StatusCardThreadInput = Parameters<typeof resolveSidebarThreadStatus>[0] & {
  readonly statusCard?: ThreadStatusCard | null | undefined;
};

const CARD_TONE: Record<ThreadStatusCard["kind"], StatusCardTone> = {
  aguardando: "waiting",
  pronto: "done",
  bloqueado: "failed",
  outro: "neutral",
};

export function statusCardToneForKind(kind: ThreadStatusCard["kind"]): StatusCardTone {
  return CARD_TONE[kind];
}

/** A STATUS block read straight from a reply, with no live state and no scroll target. */
export function statusCardViewFromBlock(
  card: Pick<ThreadStatusCard, "kind" | "status" | "voce" | "eu">,
): StatusCardView {
  return {
    tone: statusCardToneForKind(card.kind),
    headline: { kind: "card", status: card.status },
    voce: card.voce,
    eu: card.eu,
    messageId: null,
  };
}

function liveView(tone: StatusCardTone, headline: StatusCardHeadline): StatusCardView {
  return { tone, headline, voce: "", eu: "", messageId: null };
}

/**
 * Same precedence as the sidebar row (approval → input → working → failed),
 * then the last reply's STATUS block, then nothing. Background "monitoring"
 * does not override the card: watch loops are not the user's turn.
 */
export function resolveStatusCardView(thread: StatusCardThreadInput): StatusCardView {
  const live = resolveSidebarThreadStatus(thread);
  switch (live) {
    case "approval":
      return liveView("waiting", { kind: "approval" });
    case "input":
      return liveView("waiting", { kind: "input" });
    case "working":
      return liveView("working", { kind: "working" });
    case "failed":
      return liveView("failed", { kind: "failed" });
    case "monitoring":
    case "ready":
      break;
  }
  const card = thread.statusCard;
  if (!card || card.status.trim().length === 0) {
    return liveView("neutral", { kind: "none" });
  }
  return { ...statusCardViewFromBlock(card), messageId: card.messageId };
}

/**
 * Yes / No / Adjust buttons show whenever the last reply waits on the user
 * ("aguardando") and nothing live outranks it. Deliberately not guessing
 * whether the question is yes/no: a button that sometimes vanishes reads as a
 * bug, and "Yes" on an open question is harmless.
 */
export function statusCardOffersQuickReplies(view: StatusCardView): boolean {
  return view.headline.kind === "card" && view.tone === "waiting";
}

/**
 * The waiting card was already answered from this client: an answer sits in the
 * send queue, or a user message came after the card's reply. Derived rather than
 * remembered, so Stop or removing the queued answer brings the buttons back.
 */
export function statusCardAnswered(
  messageId: MessageId | null,
  messages: ReadonlyArray<{ readonly id: MessageId; readonly role: string }>,
  queuedCount: number,
): boolean {
  if (queuedCount > 0) return true;
  if (messageId === null) return false;
  // Runs on every chat render: walk back from the end, which reaches the card in a few steps.
  let userAfterCard = false;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]!;
    if (message.id === messageId) return userAfterCard;
    if (message.role === "user") userAfterCard = true;
  }
  return false;
}
