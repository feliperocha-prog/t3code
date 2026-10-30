import { describe, expect, it } from "vite-plus/test";

import { draftSchedule } from "./RoutinesSettings";

describe("draftSchedule", () => {
  it("accepts a valid daily time and rejects a partial one", () => {
    expect(draftSchedule("daily", "09:30", "4")).toEqual({ kind: "daily", time: "09:30" });
    expect(draftSchedule("daily", "24:00", "4")).toBeNull();
    expect(draftSchedule("daily", "", "4")).toBeNull();
  });

  it("accepts whole hours from 1 to 24 only", () => {
    expect(draftSchedule("interval", "09:00", "6")).toEqual({ kind: "interval", hours: 6 });
    expect(draftSchedule("interval", "09:00", "0")).toBeNull();
    expect(draftSchedule("interval", "09:00", "25")).toBeNull();
    expect(draftSchedule("interval", "09:00", "1.5")).toBeNull();
    expect(draftSchedule("interval", "09:00", "")).toBeNull();
  });
});
