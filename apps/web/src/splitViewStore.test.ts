import { type EnvironmentId, ThreadId, type ScopedThreadRef } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import {
  openSplitRef,
  resolveSplitDropZone,
  resolveSplitForRoute,
  sameThreadRef,
} from "./splitViewStore";

function ref(threadId: string, environmentId = "env-a"): ScopedThreadRef {
  return {
    environmentId: environmentId as EnvironmentId,
    threadId: ThreadId.make(threadId),
  };
}

describe("sameThreadRef", () => {
  it("matches the same thread on the same environment", () => {
    expect(sameThreadRef(ref("a"), ref("a"))).toBe(true);
  });

  it("treats the same thread id on another environment as a different thread", () => {
    expect(sameThreadRef(ref("a"), ref("a", "env-b"))).toBe(false);
  });

  it("is false when either side is missing", () => {
    expect(sameThreadRef(null, ref("a"))).toBe(false);
    expect(sameThreadRef(ref("a"), undefined)).toBe(false);
  });
});

describe("openSplitRef", () => {
  it("opens the split on a thread when none is open", () => {
    expect(openSplitRef(null, ref("a"))).toEqual(ref("a"));
  });

  it("replaces the thread on the right", () => {
    expect(openSplitRef(ref("a"), ref("b"))).toEqual(ref("b"));
  });

  it("keeps the same object when the thread is already on the right", () => {
    const current = ref("a");
    expect(openSplitRef(current, ref("a"))).toBe(current);
  });
});

describe("resolveSplitForRoute", () => {
  it("closes the split when the route lands on the thread shown on the right", () => {
    expect(resolveSplitForRoute(ref("a"), ref("a"))).toBeNull();
  });

  it("keeps the split when the route shows another thread", () => {
    const current = ref("a");
    expect(resolveSplitForRoute(current, ref("b"))).toBe(current);
  });

  it("stays closed when no split is open", () => {
    expect(resolveSplitForRoute(null, ref("a"))).toBeNull();
  });
});

describe("resolveSplitDropZone", () => {
  const area = { left: 300, right: 1300, bottom: 900, width: 1000 };
  const tabStripBottom = 84;

  it("returns the right half below the tab strip while the pointer is inside it", () => {
    expect(resolveSplitDropZone({ area, tabStripBottom, x: 1000, y: 400 })).toEqual({
      left: 800,
      top: 84,
      width: 500,
      height: 816,
    });
  });

  it("ignores the left half", () => {
    expect(resolveSplitDropZone({ area, tabStripBottom, x: 799, y: 400 })).toBeNull();
  });

  it("ignores the tab strip itself, so reordering tabs keeps working", () => {
    expect(resolveSplitDropZone({ area, tabStripBottom, x: 1000, y: 84 })).toBeNull();
  });

  it("ignores a pointer outside the chat area", () => {
    expect(resolveSplitDropZone({ area, tabStripBottom, x: 1301, y: 400 })).toBeNull();
    expect(resolveSplitDropZone({ area, tabStripBottom, x: 1000, y: 901 })).toBeNull();
  });
});
