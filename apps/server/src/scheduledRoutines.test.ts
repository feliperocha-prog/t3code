import { describe, expect, it } from "@effect/vitest";
import { ProjectId, type ScheduledRoutine } from "@t3tools/contracts";
import * as DateTime from "effect/DateTime";

import { routineDueSlot } from "./scheduledRoutines.ts";
import { routinesTaskXml } from "./scheduledRoutinesWindowsTask.ts";

// São Paulo has no daylight saving, so local 09:00 is always 12:00 UTC.
const at = (iso: string) => DateTime.makeZonedUnsafe(iso, { timeZone: "America/Sao_Paulo" });
const ms = (iso: string) => Date.parse(iso);

const routine = (overrides: Partial<ScheduledRoutine> = {}): ScheduledRoutine => ({
  id: "routine-1",
  name: "Check-up",
  projectId: ProjectId.make("project-1"),
  prompt: "Roda o check-up",
  schedule: { kind: "daily", time: "09:00" },
  enabled: true,
  createdAt: "2026-10-20T10:00:00.000Z",
  ...overrides,
});

describe("routineDueSlot", () => {
  it("fires a daily routine at its local time and catches up later that day", () => {
    expect(routineDueSlot(routine(), null, at("2026-10-29T11:59:00.000Z"))).toBeNull();
    expect(routineDueSlot(routine(), null, at("2026-10-29T12:00:00.000Z"))).toBe(
      ms("2026-10-29T12:00:00.000Z"),
    );
    expect(routineDueSlot(routine(), null, at("2026-10-29T20:00:00.000Z"))).toBe(
      ms("2026-10-29T12:00:00.000Z"),
    );
  });

  it("does not repeat a daily slot that already ran", () => {
    const lastRun = ms("2026-10-29T12:00:30.000Z");
    expect(routineDueSlot(routine(), lastRun, at("2026-10-29T15:00:00.000Z"))).toBeNull();
    expect(routineDueSlot(routine(), lastRun, at("2026-10-30T12:00:00.000Z"))).toBe(
      ms("2026-10-30T12:00:00.000Z"),
    );
  });

  it("skips a daily slot that passed before the routine existed", () => {
    const fresh = routine({ createdAt: "2026-10-29T13:00:00.000Z" });
    expect(routineDueSlot(fresh, null, at("2026-10-29T14:00:00.000Z"))).toBeNull();
  });

  it("fires an interval routine hours after its last run or creation", () => {
    const every2h = routine({ schedule: { kind: "interval", hours: 2 } });
    expect(routineDueSlot(every2h, null, at("2026-10-20T11:59:00.000Z"))).toBeNull();
    expect(routineDueSlot(every2h, null, at("2026-10-20T12:00:00.000Z"))).toBe(
      ms("2026-10-20T12:00:00.000Z"),
    );
    const lastRun = ms("2026-10-29T12:00:00.000Z");
    expect(routineDueSlot(every2h, lastRun, at("2026-10-29T13:00:00.000Z"))).toBeNull();
    expect(routineDueSlot(every2h, lastRun, at("2026-10-29T14:30:00.000Z"))).toBe(
      ms("2026-10-29T14:00:00.000Z"),
    );
  });

  it("keeps interval routines on the hour when a run lands late", () => {
    const hourly = routine({ schedule: { kind: "interval", hours: 1 } });
    // The hidden app opened at 10:00 and the run was recorded seconds later.
    const lastRun = ms("2026-10-29T13:00:12.000Z");
    expect(routineDueSlot(hourly, lastRun, at("2026-10-29T14:00:05.000Z"))).toBe(
      ms("2026-10-29T14:00:00.000Z"),
    );
  });

  it("never fires a routine that is off", () => {
    expect(
      routineDueSlot(routine({ enabled: false }), null, at("2026-10-29T12:00:00.000Z")),
    ).toBeNull();
  });
});

describe("routinesTaskXml", () => {
  const launcher = "C:\\Program Files\\T3 & Co\\T3.exe";

  it("has no task when no routine is on", () => {
    expect(routinesTaskXml([], launcher, "2026-10-29")).toBeNull();
    expect(routinesTaskXml([routine({ enabled: false })], launcher, "2026-10-29")).toBeNull();
  });

  it("adds one daily trigger per distinct time and one hourly trigger for intervals", () => {
    const xml = routinesTaskXml(
      [
        routine({ id: "a", schedule: { kind: "daily", time: "09:00" } }),
        routine({ id: "b", schedule: { kind: "daily", time: "09:00" } }),
        routine({ id: "c", schedule: { kind: "daily", time: "18:30" } }),
        routine({ id: "d", schedule: { kind: "interval", hours: 3 } }),
        routine({ id: "e", schedule: { kind: "daily", time: "07:00" }, enabled: false }),
      ],
      launcher,
      "2026-10-29",
    );
    expect(xml?.match(/<CalendarTrigger>/g)).toHaveLength(2);
    expect(xml).toContain("<StartBoundary>2026-10-29T09:00:00</StartBoundary>");
    expect(xml).toContain("<StartBoundary>2026-10-29T18:30:00</StartBoundary>");
    expect(xml).not.toContain("T07:00:00");
    expect(xml?.match(/<Interval>PT1H<\/Interval>/g)).toHaveLength(1);
    expect(xml).toContain("<Command>C:\\Program Files\\T3 &amp; Co\\T3.exe</Command>");
    expect(xml).toContain("<Arguments>--t3-routines</Arguments>");
  });
});
