/**
 * Open conversation tabs shown under the chat header.
 *
 * Tabs are client-only state: closing one never touches the thread or its
 * agent. Only refs are stored; titles and status come from the live thread
 * shell so a tab can never show a stale label.
 */
import { scopedThreadKey } from "@t3tools/client-runtime/environment";
import type { ScopedThreadRef } from "@t3tools/contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveStorage } from "./lib/storage";

const THREAD_TABS_STORAGE_KEY = "t3code:thread-tabs:v1";
const THREAD_TABS_STORAGE_VERSION = 1;

export type ThreadTabDirection = "next" | "previous";

interface ThreadTabsStoreState {
  tabs: ScopedThreadRef[];
  /** Appends the thread as the last tab; a no-op when it already has one. */
  ensureTab: (ref: ScopedThreadRef) => void;
  closeTab: (ref: ScopedThreadRef) => void;
  /** Moves the tab keyed `fromKey` into the position of the tab keyed `toKey`. */
  moveTab: (fromKey: string, toKey: string) => void;
}

export function ensureThreadTab(
  tabs: ReadonlyArray<ScopedThreadRef>,
  ref: ScopedThreadRef,
): ReadonlyArray<ScopedThreadRef> {
  const key = scopedThreadKey(ref);
  if (tabs.some((tab) => scopedThreadKey(tab) === key)) return tabs;
  return [...tabs, { environmentId: ref.environmentId, threadId: ref.threadId }];
}

export function closeThreadTab(
  tabs: ReadonlyArray<ScopedThreadRef>,
  ref: ScopedThreadRef,
): ReadonlyArray<ScopedThreadRef> {
  const key = scopedThreadKey(ref);
  const next = tabs.filter((tab) => scopedThreadKey(tab) !== key);
  return next.length === tabs.length ? tabs : next;
}

export function moveThreadTab(
  tabs: ReadonlyArray<ScopedThreadRef>,
  fromKey: string,
  toKey: string,
): ReadonlyArray<ScopedThreadRef> {
  const fromIndex = tabs.findIndex((tab) => scopedThreadKey(tab) === fromKey);
  const toIndex = tabs.findIndex((tab) => scopedThreadKey(tab) === toKey);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return tabs;
  const next = [...tabs];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return tabs;
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * The tab to show after closing `closingKey`: its right neighbor, else its
 * left neighbor, else null when it was the only tab (or is not in the list).
 */
export function resolveTabKeyAfterClose(
  orderedKeys: ReadonlyArray<string>,
  closingKey: string,
): string | null {
  const index = orderedKeys.indexOf(closingKey);
  if (index === -1) return null;
  return orderedKeys[index + 1] ?? orderedKeys[index - 1] ?? null;
}

/**
 * The tab one step from `activeKey`, wrapping at both ends. When the active
 * conversation has no tab, "next" starts at the first tab and "previous" at
 * the last.
 */
export function resolveAdjacentTabKey(
  orderedKeys: ReadonlyArray<string>,
  activeKey: string | null,
  direction: ThreadTabDirection,
): string | null {
  if (orderedKeys.length === 0) return null;
  const index = activeKey === null ? -1 : orderedKeys.indexOf(activeKey);
  if (index === -1) {
    return direction === "next" ? orderedKeys[0]! : orderedKeys[orderedKeys.length - 1]!;
  }
  const step = direction === "next" ? 1 : -1;
  return orderedKeys[(index + step + orderedKeys.length) % orderedKeys.length]!;
}

export interface SameFolderTabCandidate {
  key: string;
  worktreePath: string | null;
  isWorking: boolean;
}

/**
 * True when this tab and another open tab of the same project are both
 * working in the project's own checkout (no worktree), so their edits can
 * collide. `projectThreads` are the threads of this tab's project.
 */
export function hasSameFolderTabConflict(input: {
  self: SameFolderTabCandidate;
  projectThreads: ReadonlyArray<SameFolderTabCandidate>;
  openTabKeys: ReadonlySet<string>;
}): boolean {
  const { self, projectThreads, openTabKeys } = input;
  if (!self.isWorking || self.worktreePath !== null) return false;
  return projectThreads.some(
    (thread) =>
      thread.key !== self.key &&
      openTabKeys.has(thread.key) &&
      thread.worktreePath === null &&
      thread.isWorking,
  );
}

export const useThreadTabsStore = create<ThreadTabsStoreState>()(
  persist(
    (set) => ({
      tabs: [],
      ensureTab: (ref) =>
        set((state) => {
          const tabs = ensureThreadTab(state.tabs, ref);
          return tabs === state.tabs ? state : { tabs: [...tabs] };
        }),
      closeTab: (ref) =>
        set((state) => {
          const tabs = closeThreadTab(state.tabs, ref);
          return tabs === state.tabs ? state : { tabs: [...tabs] };
        }),
      moveTab: (fromKey, toKey) =>
        set((state) => {
          const tabs = moveThreadTab(state.tabs, fromKey, toKey);
          return tabs === state.tabs ? state : { tabs: [...tabs] };
        }),
    }),
    {
      name: THREAD_TABS_STORAGE_KEY,
      version: THREAD_TABS_STORAGE_VERSION,
      storage: createJSONStorage(() =>
        resolveStorage(typeof window !== "undefined" ? window.localStorage : undefined),
      ),
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
);
