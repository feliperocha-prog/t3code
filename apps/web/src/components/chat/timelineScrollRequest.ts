import type { MessageId } from "@t3tools/contracts";

/**
 * Lets UI outside the timeline (the status card under the header) ask the
 * mounted timeline to bring a message into view. Message ids are unique, so
 * a timeline that does not hold the message simply ignores the request.
 */
type TimelineScrollListener = (messageId: MessageId) => void;

const listeners = new Set<TimelineScrollListener>();

export function requestTimelineScrollToMessage(messageId: MessageId): void {
  for (const listener of listeners) listener(messageId);
}

export function subscribeTimelineScrollRequests(listener: TimelineScrollListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
