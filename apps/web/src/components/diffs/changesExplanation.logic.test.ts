import { describe, expect, it } from "vite-plus/test";

import { explanationIsStale, riskTone } from "./changesExplanation.logic";

describe("riskTone", () => {
  it("colors low green, medium yellow and high red", () => {
    expect(riskTone("low").dotClassName).toBe("bg-success");
    expect(riskTone("medium").dotClassName).toBe("bg-warning");
    expect(riskTone("high").dotClassName).toBe("bg-destructive");
  });

  it("names each risk in plain language", () => {
    expect(riskTone("high").label).toBe("Risco alto");
  });
});

describe("explanationIsStale", () => {
  it("is stale only when the explained changes differ from the ones on screen", () => {
    expect(explanationIsStale(null, "diff")).toBe(false);
    expect(explanationIsStale("diff", "diff")).toBe(false);
    expect(explanationIsStale("diff", "diff novo")).toBe(true);
    expect(explanationIsStale("diff", null)).toBe(true);
  });
});
