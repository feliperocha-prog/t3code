/**
 * Split view: a second conversation shown beside the routed one.
 *
 * The routed thread (left) stays the source of truth for navigation and
 * global shortcuts; this store only remembers which thread sits on the right.
 * Client-only state: opening or closing the split never touches a thread.
 */
import { scopedThreadKey } from "@t3tools/client-runtime/environment";
import type { ScopedThreadRef } from "@t3tools/contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveStorage } from "./lib/storage";

const SPLIT_VIEW_STORAGE_KEY = "t3code:split-view:v1";
const SPLIT_VIEW_STORAGE_VERSION = 1;

interface SplitViewStoreState {
  secondaryThreadRef: ScopedThreadRef | null;
  /** Shows `ref` on the right, replacing whatever was there. */
  openSplit: (ref: ScopedThreadRef) => void;
  closeSplit: () => void;
  /**
   * Closes the split when the right side shows `ref`, read atomically. Swapping
   * sides is navigate-then-`openSplit(oldLeft)` (see SplitPaneHeader): any
   * order passes through a frame with the same thread on both sides.
   */
  closeSplitIfShowing: (ref: ScopedThreadRef) => void;
}

function copyRef(ref: ScopedThreadRef): ScopedThreadRef {
  return { environmentId: ref.environmentId, threadId: ref.threadId };
}

export function sameThreadRef(
  left: ScopedThreadRef | null | undefined,
  right: ScopedThreadRef | null | undefined,
): boolean {
  if (!left || !right) return false;
  return scopedThreadKey(left) === scopedThreadKey(right);
}

export function openSplitRef(
  current: ScopedThreadRef | null,
  ref: ScopedThreadRef,
): ScopedThreadRef | null {
  return sameThreadRef(current, ref) ? current : copyRef(ref);
}

/** The right-side thread once `ref` must not be on the right anymore. */
export function resolveSplitForRoute(
  current: ScopedThreadRef | null,
  ref: ScopedThreadRef,
): ScopedThreadRef | null {
  return sameThreadRef(current, ref) ? null : current;
}

export interface SplitDropZone {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AreaRect {
  left: number;
  right: number;
  bottom: number;
  width: number;
}

/**
 * Where a dragged tab opens the split: the right half of the chat area, below
 * the tab strip. Returns that zone while the pointer is inside it, else null.
 */
export function resolveSplitDropZone(input: {
  area: AreaRect;
  tabStripBottom: number;
  x: number;
  y: number;
}): SplitDropZone | null {
  const { area, tabStripBottom, x, y } = input;
  const middle = area.left + area.width / 2;
  if (x < middle || x > area.right || y <= tabStripBottom || y > area.bottom) {
    return null;
  }
  return {
    left: middle,
    top: tabStripBottom,
    width: area.right - middle,
    height: area.bottom - tabStripBottom,
  };
}

export const useSplitViewStore = create<SplitViewStoreState>()(
  persist(
    (set) => ({
      secondaryThreadRef: null,
      openSplit: (ref) =>
        set((state) => {
          const next = openSplitRef(state.secondaryThreadRef, ref);
          return next === state.secondaryThreadRef ? state : { secondaryThreadRef: next };
        }),
      closeSplit: () =>
        set((state) => (state.secondaryThreadRef === null ? state : { secondaryThreadRef: null })),

      closeSplitIfShowing: (ref) =>
        set((state) => {
          const next = resolveSplitForRoute(state.secondaryThreadRef, ref);
          return next === state.secondaryThreadRef ? state : { secondaryThreadRef: next };
        }),
    }),
    {
      name: SPLIT_VIEW_STORAGE_KEY,
      version: SPLIT_VIEW_STORAGE_VERSION,
      storage: createJSONStorage(() =>
        resolveStorage(typeof window !== "undefined" ? window.localStorage : undefined),
      ),
      partialize: (state) => ({ secondaryThreadRef: state.secondaryThreadRef }),
    },
  ),
);
