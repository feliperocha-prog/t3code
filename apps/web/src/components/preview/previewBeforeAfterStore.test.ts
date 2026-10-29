import { describe, expect, it } from "vite-plus/test";

import type { DesktopPreviewThumbnail } from "@t3tools/contracts";

import {
  MAX_BEFORE_AFTER_THREADS,
  turnCaptureMoment,
  usePreviewBeforeAfterStore,
} from "./previewBeforeAfterStore";

const running = (turnId: string) => ({ turnId, running: true });
const settled = (turnId: string) => ({ turnId, running: false });

describe("turnCaptureMoment", () => {
  it("ignores the first observation, so opening the panel mid-turn takes no before shot", () => {
    expect(turnCaptureMoment(null, running("t1"))).toBeNull();
    expect(turnCaptureMoment(null, settled("t1"))).toBeNull();
  });

  it("takes the before shot when a new turn starts running", () => {
    expect(turnCaptureMoment(settled("t1"), running("t2"))).toBe("before");
    expect(turnCaptureMoment(running("t1"), running("t2"))).toBe("before");
  });

  it("takes the after shot when the same turn stops running", () => {
    expect(turnCaptureMoment(running("t1"), settled("t1"))).toBe("after");
  });

  it("does nothing while a turn keeps running or stays settled", () => {
    expect(turnCaptureMoment(running("t1"), running("t1"))).toBeNull();
    expect(turnCaptureMoment(settled("t1"), settled("t1"))).toBeNull();
  });

  it("skips an after shot for a turn that settled without being seen running", () => {
    expect(turnCaptureMoment(running("t1"), settled("t2"))).toBeNull();
  });
});

describe("usePreviewBeforeAfterStore", () => {
  const shot = (url: string): DesktopPreviewThumbnail => ({
    tabId: "tab",
    url,
    dataUrl: "data:image/png;base64,",
    createdAt: "2026-10-29T10:00:00.000Z",
  });

  it("keeps only the most recent threads", () => {
    const store = usePreviewBeforeAfterStore.getState();
    for (let index = 0; index <= MAX_BEFORE_AFTER_THREADS; index += 1) {
      store.setBefore(`thread-${index}`, "t1", shot(`u${index}`));
    }
    const keys = Object.keys(usePreviewBeforeAfterStore.getState().byThreadKey);
    expect(keys).toHaveLength(MAX_BEFORE_AFTER_THREADS);
    expect(keys).not.toContain("thread-0");
    expect(keys.at(-1)).toBe(`thread-${MAX_BEFORE_AFTER_THREADS}`);
  });

  it("drops an after shot that belongs to a different turn", () => {
    const store = usePreviewBeforeAfterStore.getState();
    store.setBefore("thread-a", "t1", shot("before"));
    store.setAfter("thread-a", "t2", shot("stale"));
    expect(usePreviewBeforeAfterStore.getState().byThreadKey["thread-a"]?.after).toBeNull();
    store.setAfter("thread-a", "t1", shot("after"));
    expect(usePreviewBeforeAfterStore.getState().byThreadKey["thread-a"]?.after?.url).toBe("after");
  });
});
