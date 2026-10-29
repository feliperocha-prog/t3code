import { describe, expect, it } from "vite-plus/test";

import { turnCaptureMoment } from "./previewBeforeAfterStore";

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
