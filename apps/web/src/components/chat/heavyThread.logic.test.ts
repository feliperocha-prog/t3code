import { describe, expect, it } from "vite-plus/test";

import { shouldShowHeavyNotice } from "./heavyThread.logic";

describe("shouldShowHeavyNotice", () => {
  it("shows from the threshold up and hides below it", () => {
    expect(
      shouldShowHeavyNotice({ usedPercentage: 59.9, threshold: 60, dismissedAtPercent: null }),
    ).toBe(false);
    expect(
      shouldShowHeavyNotice({ usedPercentage: 60, threshold: 60, dismissedAtPercent: null }),
    ).toBe(true);
  });

  it("never shows when the threshold is 0 or usage is unknown", () => {
    expect(
      shouldShowHeavyNotice({ usedPercentage: 95, threshold: 0, dismissedAtPercent: null }),
    ).toBe(false);
    expect(
      shouldShowHeavyNotice({ usedPercentage: null, threshold: 60, dismissedAtPercent: null }),
    ).toBe(false);
  });

  it("stays dismissed until usage climbs ten points past the dismissal", () => {
    expect(
      shouldShowHeavyNotice({ usedPercentage: 71.9, threshold: 60, dismissedAtPercent: 62 }),
    ).toBe(false);
    expect(
      shouldShowHeavyNotice({ usedPercentage: 72, threshold: 60, dismissedAtPercent: 62 }),
    ).toBe(true);
  });

  it("hides on its own once usage drops below the threshold, dismissed or not", () => {
    expect(
      shouldShowHeavyNotice({ usedPercentage: 40, threshold: 60, dismissedAtPercent: 20 }),
    ).toBe(false);
  });
});
