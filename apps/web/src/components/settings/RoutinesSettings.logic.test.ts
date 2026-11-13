import { describe, expect, it } from "vite-plus/test";

import { draftSchedule } from "./RoutinesSettings";
import { normalizeDailyTime } from "./RoutinesSettings.logic";

describe("normalizeDailyTime", () => {
  it("completa hora e minuto com zero", () => {
    expect(normalizeDailyTime("9:00")).toBe("09:00");
    expect(normalizeDailyTime("9:5")).toBe("09:05");
    expect(normalizeDailyTime("09:00")).toBe("09:00");
  });

  it("não mexe no que não tem forma de hora", () => {
    expect(normalizeDailyTime("")).toBe("");
    expect(normalizeDailyTime("900")).toBe("900");
    expect(normalizeDailyTime("123:00")).toBe("123:00");
  });

  it("hora fora do intervalo continua inválida", () => {
    expect(draftSchedule("daily", normalizeDailyTime("24:00"), "")).toBeNull();
    expect(draftSchedule("daily", normalizeDailyTime("9:60"), "")).toBeNull();
    expect(draftSchedule("daily", normalizeDailyTime("9:00"), "")).not.toBeNull();
  });
});
