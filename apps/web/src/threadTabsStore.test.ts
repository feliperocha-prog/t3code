import { scopedThreadKey } from "@t3tools/client-runtime/environment";
import { type EnvironmentId, ThreadId, type ScopedThreadRef } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import {
  closeThreadTab,
  ensureThreadTab,
  hasSameFolderTabConflict,
  moveThreadTab,
  resolveAdjacentTabKey,
  resolveTabKeyAfterClose,
} from "./threadTabsStore";

function ref(threadId: string, environmentId = "env-a"): ScopedThreadRef {
  return {
    environmentId: environmentId as EnvironmentId,
    threadId: ThreadId.make(threadId),
  };
}

const keys = (tabs: ReadonlyArray<ScopedThreadRef>) => tabs.map(scopedThreadKey);

describe("ensureThreadTab", () => {
  it("appends a new thread at the end", () => {
    const tabs = ensureThreadTab([ref("a")], ref("b"));
    expect(keys(tabs)).toEqual(keys([ref("a"), ref("b")]));
  });

  it("is a no-op for a thread that already has a tab", () => {
    const tabs = [ref("a"), ref("b")];
    expect(ensureThreadTab(tabs, ref("a"))).toBe(tabs);
  });

  it("treats the same thread id on another environment as a different tab", () => {
    const tabs = ensureThreadTab([ref("a")], ref("a", "env-b"));
    expect(tabs).toHaveLength(2);
  });
});

describe("closeThreadTab", () => {
  it("removes only the closed tab", () => {
    const tabs = closeThreadTab([ref("a"), ref("b"), ref("c")], ref("b"));
    expect(keys(tabs)).toEqual(keys([ref("a"), ref("c")]));
  });
});

describe("resolveTabKeyAfterClose", () => {
  const [a, b, c] = keys([ref("a"), ref("b"), ref("c")]) as [string, string, string];

  it("prefers the right neighbor", () => {
    expect(resolveTabKeyAfterClose([a, b, c], b)).toBe(c);
  });

  it("falls back to the left neighbor for the last tab", () => {
    expect(resolveTabKeyAfterClose([a, b, c], c)).toBe(b);
  });

  it("returns null when closing the only tab", () => {
    expect(resolveTabKeyAfterClose([a], a)).toBeNull();
  });
});

describe("resolveAdjacentTabKey", () => {
  const [a, b, c] = keys([ref("a"), ref("b"), ref("c")]) as [string, string, string];

  it("steps forward and wraps from the last tab to the first", () => {
    expect(resolveAdjacentTabKey([a, b, c], a, "next")).toBe(b);
    expect(resolveAdjacentTabKey([a, b, c], c, "next")).toBe(a);
  });

  it("steps backward and wraps from the first tab to the last", () => {
    expect(resolveAdjacentTabKey([a, b, c], b, "previous")).toBe(a);
    expect(resolveAdjacentTabKey([a, b, c], a, "previous")).toBe(c);
  });

  it("enters the list at an end when the active thread has no tab", () => {
    expect(resolveAdjacentTabKey([a, b, c], "env-a:missing", "next")).toBe(a);
    expect(resolveAdjacentTabKey([a, b, c], null, "previous")).toBe(c);
  });

  it("returns null with no tabs", () => {
    expect(resolveAdjacentTabKey([], a, "next")).toBeNull();
  });
});

describe("moveThreadTab", () => {
  const tabs = [ref("a"), ref("b"), ref("c")];
  const [a, b, c] = keys(tabs) as [string, string, string];

  it("moves a tab forward into the target position", () => {
    expect(keys(moveThreadTab(tabs, a, c))).toEqual([b, c, a]);
  });

  it("moves a tab backward into the target position", () => {
    expect(keys(moveThreadTab(tabs, c, a))).toEqual([c, a, b]);
  });

  it("keeps the list when a key is unknown", () => {
    expect(moveThreadTab(tabs, a, "env-a:missing")).toBe(tabs);
  });
});

describe("hasSameFolderTabConflict", () => {
  const self = { key: "env-a:a", worktreePath: null, isWorking: true };
  const other = { key: "env-a:b", worktreePath: null, isWorking: true };
  const openTabKeys = new Set([self.key, other.key]);

  it("flags two open tabs working in the same checkout", () => {
    expect(hasSameFolderTabConflict({ self, projectThreads: [self, other], openTabKeys })).toBe(
      true,
    );
  });

  it("ignores a sibling that is idle, in a worktree, or not open as a tab", () => {
    for (const sibling of [
      { ...other, isWorking: false },
      { ...other, worktreePath: "/tmp/wt" },
    ]) {
      expect(hasSameFolderTabConflict({ self, projectThreads: [self, sibling], openTabKeys })).toBe(
        false,
      );
    }
    expect(
      hasSameFolderTabConflict({
        self,
        projectThreads: [self, other],
        openTabKeys: new Set([self.key]),
      }),
    ).toBe(false);
  });

  it("does not flag a tab that is not working itself", () => {
    expect(
      hasSameFolderTabConflict({
        self: { ...self, isWorking: false },
        projectThreads: [self, other],
        openTabKeys,
      }),
    ).toBe(false);
  });
});
