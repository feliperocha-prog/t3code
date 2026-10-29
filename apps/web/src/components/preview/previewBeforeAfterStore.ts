import type { DesktopPreviewThumbnail } from "@t3tools/contracts";
import { create } from "zustand";

/**
 * Snapshots of the preview page taken when a turn starts ("before") and when it
 * settles ("after"), one pair per thread, kept in memory only. The pair belongs
 * to the latest turn that ran with the preview open.
 */
export interface PreviewBeforeAfterPair {
  turnId: string;
  before: DesktopPreviewThumbnail | null;
  after: DesktopPreviewThumbnail | null;
}

interface PreviewBeforeAfterState {
  byThreadKey: Record<string, PreviewBeforeAfterPair>;
  setBefore: (threadKey: string, turnId: string, shot: DesktopPreviewThumbnail) => void;
  setAfter: (threadKey: string, turnId: string, shot: DesktopPreviewThumbnail) => void;
}

// Each pair holds two ~960px PNGs; older threads drop out past this count.
export const MAX_BEFORE_AFTER_THREADS = 8;

export const usePreviewBeforeAfterStore = create<PreviewBeforeAfterState>()((set) => ({
  byThreadKey: {},
  setBefore: (threadKey, turnId, shot) =>
    set((state) => {
      const { [threadKey]: _replaced, ...others } = state.byThreadKey;
      // Insertion order is recency: the oldest kept thread is the first key.
      const kept = Object.entries(others).slice(-(MAX_BEFORE_AFTER_THREADS - 1));
      return {
        byThreadKey: {
          ...Object.fromEntries(kept),
          [threadKey]: { turnId, before: shot, after: null },
        },
      };
    }),
  setAfter: (threadKey, turnId, shot) =>
    set((state) => {
      const current = state.byThreadKey[threadKey];
      // An "after" without its own "before" would compare unrelated turns.
      if (!current || current.turnId !== turnId) return state;
      return { byThreadKey: { ...state.byThreadKey, [threadKey]: { ...current, after: shot } } };
    }),
}));

export type TurnCaptureMoment = "before" | "after";

/**
 * Decides which snapshot a latest-turn change calls for. `previous` is the
 * turn seen on the last render; `null` means the panel just mounted, which
 * never counts as a start (the page already shows the agent's work).
 */
export function turnCaptureMoment(
  previous: { turnId: string; running: boolean } | null,
  next: { turnId: string; running: boolean } | null,
): TurnCaptureMoment | null {
  if (previous === null || next === null) return null;
  if (next.running && (previous.turnId !== next.turnId || !previous.running)) return "before";
  if (!next.running && previous.running && previous.turnId === next.turnId) return "after";
  return null;
}
