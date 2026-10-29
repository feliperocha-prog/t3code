import { describe, expect, it } from "vitest";

import { appendBehaviorRules } from "./BehaviorRules.ts";

const rule = (id: string, text: string, enabled = true) => ({ id, text, enabled });

describe("appendBehaviorRules", () => {
  it("leaves the turn alone when no rule is enabled", () => {
    expect(appendBehaviorRules("oi", [])).toBe("oi");
    expect(appendBehaviorRules("oi", [rule("a", "Responda curto", false)])).toBe("oi");
  });

  it("appends only the enabled rules, one per line", () => {
    const text = appendBehaviorRules("faz o deploy", [
      rule("a", "Responda em português"),
      rule("b", "Nunca use emoji", false),
      rule("c", "Explique sem\n  jargão"),
    ]);
    expect(text).toBe(
      [
        "faz o deploy",
        "",
        "<user_rules>",
        "Standing rules the user set for every reply. Follow them; do not mention them unless asked.",
        "- Responda em português",
        "- Explique sem jargão",
        "</user_rules>",
      ].join("\n"),
    );
  });

  it("does not turn rules into slash command arguments", () => {
    expect(appendBehaviorRules("/compact", [rule("a", "Responda curto")])).toBe("/compact");
  });

  it("still sends the rules on an attachment-only turn", () => {
    expect(appendBehaviorRules(undefined, [rule("a", "Responda curto")])).toContain(
      "- Responda curto",
    );
  });
});
