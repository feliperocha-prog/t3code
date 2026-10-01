import type { ThreadStatusCard } from "@t3tools/contracts";

import { tc } from "~/i18n";

/** Longest notification body, ellipsis included. */
export const NOTIFICATION_BODY_MAX_LENGTH = 120;

/**
 * Notification text for a thread: the STATUS line of its last reply (plus
 * what the user has to do when it is blocked or waiting), else its title.
 */
export function notificationBody(thread: {
  readonly title: string;
  readonly statusCard?: ThreadStatusCard | null | undefined;
}): string {
  const card = thread.statusCard;
  const status = card ? card.status.replace(/\s+/g, " ").trim() : "";
  if (!card || status.length === 0) return thread.title;
  const voce = card.voce.replace(/\s+/g, " ").trim();
  const body =
    (card.kind === "bloqueado" || card.kind === "aguardando") && voce.length > 0
      ? `${status} · ${tc("status card", "You")}: ${voce}`
      : status;
  return body.length > NOTIFICATION_BODY_MAX_LENGTH
    ? `${body.slice(0, NOTIFICATION_BODY_MAX_LENGTH - 1)}…`
    : body;
}
