import type { BehaviorRule } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { addBehaviorRule, listsInFlight } from "./BehaviorRulesSettings";

const rule = (id: string, enabled = true): BehaviorRule => ({ id, text: `rule ${id}`, enabled });

describe("addBehaviorRule", () => {
  it("puts a new rule first and skips one that is already there", () => {
    const rules = [rule("a")];
    expect(addBehaviorRule(rules, "  Nova   regra ", "b").map((r) => r.text)).toEqual([
      "Nova regra",
      "rule a",
    ]);
    expect(addBehaviorRule(rules, "RULE A", "c")).toBe(rules);
  });
});

describe("listsInFlight", () => {
  const start = [rule("a"), rule("b"), rule("c")];
  const offA = [rule("a", false), rule("b"), rule("c")];
  const offAB = [rule("a", false), rule("b", false), rule("c")];

  it("keeps every sent list while the server still shows the old one", () => {
    expect(listsInFlight({ base: start, lists: [offA, offAB] }, start)).toEqual([offA, offAB]);
  });

  it("keeps the later edit when the server echoes only the first", () => {
    const echo = structuredClone(offA);
    expect(listsInFlight({ base: start, lists: [offA, offAB] }, echo)).toEqual([offAB]);
  });

  it("lets a change made elsewhere win", () => {
    const elsewhere = [rule("z")];
    expect(listsInFlight({ base: start, lists: [offA] }, elsewhere)).toEqual([]);
  });
});
