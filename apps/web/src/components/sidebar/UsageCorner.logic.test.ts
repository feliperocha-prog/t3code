import type { ServerProviderUsageWindow } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { cornerTone, pickCornerWindows } from "./UsageCorner.logic";

function usageWindow(
  id: string,
  kind: ServerProviderUsageWindow["kind"],
  usedPercent = 10,
): ServerProviderUsageWindow {
  return { id, kind, label: id, usedPercent };
}

describe("pickCornerWindows", () => {
  it("picks the five-hour session and the general weekly window", () => {
    const session = usageWindow("five_hour", "session");
    const weekly = usageWindow("seven_day", "weekly");
    expect(pickCornerWindows([weekly, session])).toEqual({ session, weekly });
  });

  it("prefers the all-models weekly window over a model-specific one listed first", () => {
    const opus = usageWindow("seven_day_opus", "weekly");
    const weekly = usageWindow("seven_day", "weekly");
    expect(pickCornerWindows([opus, weekly]).weekly).toBe(weekly);
  });

  it("falls back to the first window of the kind when the known id is missing", () => {
    const opus = usageWindow("seven_day_opus", "weekly");
    const primary = usageWindow("primary", "session");
    expect(pickCornerWindows([primary, opus])).toEqual({ session: primary, weekly: opus });
  });

  it("returns nulls when nothing matches", () => {
    expect(pickCornerWindows([usageWindow("monthly", "monthly")])).toEqual({
      session: null,
      weekly: null,
    });
    expect(pickCornerWindows([])).toEqual({ session: null, weekly: null });
  });
});

describe("cornerTone", () => {
  it("turns amber at 70% and red at 90%", () => {
    expect(cornerTone(0)).toBe("ok");
    expect(cornerTone(69.9)).toBe("ok");
    expect(cornerTone(70)).toBe("warning");
    expect(cornerTone(89)).toBe("warning");
    expect(cornerTone(90)).toBe("critical");
    expect(cornerTone(100)).toBe("critical");
  });
});
