import { create } from "zustand";

/**
 * The file as it was when a change request was sent from the file viewer,
 * keyed by thread and relative path. In memory only: the tint it drives is a
 * short-lived hint, not history worth persisting.
 */
interface FileAgentChangeStoreState {
  snapshotsByKey: Record<string, string>;
  record: (key: string, contents: string) => void;
  clear: (key: string) => void;
}

export function fileAgentChangeKey(threadKey: string, relativePath: string): string {
  return `${threadKey}\u0000${relativePath}`;
}

export const useFileAgentChangeStore = create<FileAgentChangeStoreState>()((set) => ({
  snapshotsByKey: {},
  record: (key, contents) =>
    set((state) => ({ snapshotsByKey: { ...state.snapshotsByKey, [key]: contents } })),
  clear: (key) =>
    set((state) => {
      if (!(key in state.snapshotsByKey)) return state;
      const { [key]: _removed, ...rest } = state.snapshotsByKey;
      return { snapshotsByKey: rest };
    }),
}));
