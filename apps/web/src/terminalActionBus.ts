"use client";

/**
 * Typed window-event bus for terminal actions. Lets UI outside `ChatView`
 * (the first-steps cards) reach its terminal state without prop drilling.
 */
export type TerminalAction = "open";

const EVENT_NAME = "t3code:terminal-action";

export function dispatchTerminalAction(action: TerminalAction): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TerminalAction>(EVENT_NAME, { detail: action }));
}

export function subscribeTerminalAction(listener: (action: TerminalAction) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<TerminalAction>).detail;
    if (typeof detail === "string") listener(detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
