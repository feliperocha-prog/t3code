/**
 * Split view panes in the DOM. ThreadRouteView tags each side with
 * `data-split-pane`; window-level listeners use these helpers so a shortcut
 * fires in one pane only.
 */
const SECONDARY_SPLIT_PANE_SELECTOR = '[data-split-pane="secondary"]';

function isInSecondaryPane(node: unknown): boolean {
  return node instanceof Element && node.closest(SECONDARY_SPLIT_PANE_SELECTOR) !== null;
}

/**
 * Whether a window-level key event belongs to the pane that holds `paneNode`.
 * Focus inside the right pane belongs to it; anything else (left pane, body,
 * sidebar) belongs to the routed pane on the left. Without a split every node
 * is "left", so this is always true.
 */
export function keyEventBelongsToPane(
  paneNode: Element | null | undefined,
  target: EventTarget | null,
): boolean {
  return isInSecondaryPane(paneNode) === isInSecondaryPane(target);
}

/** The right pane of a split view that holds `node`, or null outside it. */
export function closestSecondarySplitPane(node: Element): HTMLElement | null {
  return node.closest<HTMLElement>(SECONDARY_SPLIT_PANE_SELECTOR);
}
