import { describe, expect, it } from "vite-plus/test";

import { hasProbeFailedLimits } from "./usageLimitsRetry";

const checkedAt = "2026-09-11T12:00:00Z";

describe("hasProbeFailedLimits", () => {
  it("is true when a provider could not read its limits", () => {
    expect(
      hasProbeFailedLimits([
        { usageLimits: { checkedAt, windows: [] } },
        { usageLimits: { checkedAt, windows: [], unavailable: { reason: "probeFailed" } } },
      ]),
    ).toBe(true);
  });

  it("is false for accounts without subscription limits", () => {
    expect(
      hasProbeFailedLimits([
        { usageLimits: { checkedAt, windows: [], unavailable: { reason: "unsupported" } } },
      ]),
    ).toBe(false);
  });

  it("is false when limits were read or never reported", () => {
    expect(hasProbeFailedLimits([{ usageLimits: { checkedAt, windows: [] } }, {}])).toBe(false);
    expect(hasProbeFailedLimits([])).toBe(false);
  });
});
