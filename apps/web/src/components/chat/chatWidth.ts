import type { ChatWidth } from "@t3tools/contracts";

import { tc } from "~/i18n";

/** Narrowest to widest; the keyboard shortcuts step through this order. */
export const CHAT_WIDTH_ORDER: readonly ChatWidth[] = ["comfortable", "wide", "full"];

export const CHAT_WIDTH_LABELS: Record<ChatWidth, string> = {
  comfortable: tc("chat width", "Comfortable"),
  wide: tc("chat width", "Wide"),
  full: tc("chat width", "Full"),
};

/** One step wider (1) or narrower (-1); stays put at either end instead of wrapping. */
export function stepChatWidth(current: ChatWidth, direction: 1 | -1): ChatWidth {
  const index = CHAT_WIDTH_ORDER.indexOf(current);
  const next = Math.min(CHAT_WIDTH_ORDER.length - 1, Math.max(0, index + direction));
  return CHAT_WIDTH_ORDER[next] ?? current;
}
