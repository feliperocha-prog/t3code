import {
  CHAT_TEXT_SCALE_STEP,
  type ChatTextScale,
  MAX_CHAT_TEXT_SCALE,
  MIN_CHAT_TEXT_SCALE,
} from "@t3tools/contracts";

/** Rounds to one decimal so repeated steps never drift (0.1 + 0.2 ≠ 0.3). */
function roundScale(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Every value the conversation text size can take, 80% to 180%. */
export const CHAT_TEXT_SCALE_LEVELS: readonly ChatTextScale[] = Array.from(
  { length: Math.round((MAX_CHAT_TEXT_SCALE - MIN_CHAT_TEXT_SCALE) / CHAT_TEXT_SCALE_STEP) + 1 },
  (_, index) => roundScale(MIN_CHAT_TEXT_SCALE + index * CHAT_TEXT_SCALE_STEP),
);

/** One step up (direction 1) or down (-1), kept inside the allowed range. */
export function stepChatTextScale(current: number, direction: 1 | -1): ChatTextScale {
  const next = roundScale(current + direction * CHAT_TEXT_SCALE_STEP);
  return Math.min(MAX_CHAT_TEXT_SCALE, Math.max(MIN_CHAT_TEXT_SCALE, next));
}

export function formatChatTextScale(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}
