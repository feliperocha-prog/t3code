interface CommentSubmitShortcutEvent {
  readonly key: string;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly shiftKey?: boolean;
  readonly isComposing?: boolean;
  /** Safari reports the IME-confirming Enter with isComposing=false but keyCode 229. */
  readonly keyCode?: number;
}

interface CommentSubmitShortcutOptions {
  /** Plain Enter submits and Shift+Enter inserts a newline. Command/Ctrl+Enter still submits. */
  readonly submitOnEnter?: boolean;
}

/**
 * Shared guard for inline comment composers. They submit on Command/Ctrl+Enter,
 * and on plain Enter when `submitOnEnter` is set (never mid IME composition).
 */
export function isCommentSubmitShortcut(
  event: CommentSubmitShortcutEvent,
  value: string,
  pending: boolean,
  options?: CommentSubmitShortcutOptions,
): boolean {
  if (pending || event.key !== "Enter" || value.trim().length === 0) return false;
  if (event.metaKey || event.ctrlKey) return true;
  return (
    options?.submitOnEnter === true &&
    event.shiftKey !== true &&
    event.isComposing !== true &&
    event.keyCode !== 229
  );
}
