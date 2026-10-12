import { describe, expect, it } from "vite-plus/test";
import { tc } from "~/i18n";
import { subagentRoleLabel } from "./subagentRole.logic";

const label = (text: string) => tc("subagent role", text);

describe("subagentRoleLabel", () => {
  it("names planners as Thinking", () => {
    expect(subagentRoleLabel("estrategista", "Plano")).toEqual({
      kind: "thinking",
      label: label("Thinking"),
      technical: "estrategista",
    });
    expect(subagentRoleLabel("Plan", null).kind).toBe("thinking");
  });

  it("names reviewers as Reviewing", () => {
    expect(subagentRoleLabel("revisor", "Revisar diff")).toEqual({
      kind: "reviewing",
      label: label("Reviewing"),
      technical: "revisor",
    });
    expect(subagentRoleLabel("code-reviewer", null).kind).toBe("reviewing");
  });

  it("names searchers as Reading, case-insensitively", () => {
    expect(subagentRoleLabel("Explore", null).kind).toBe("reading");
    expect(subagentRoleLabel("claude-code-guide", null).kind).toBe("reading");
  });

  it("names doers and unknown roles as Building", () => {
    expect(subagentRoleLabel("operador", null).label).toBe(label("Building"));
    expect(subagentRoleLabel("executor", null).kind).toBe("building");
    expect(subagentRoleLabel("general-purpose", null).kind).toBe("building");
    expect(subagentRoleLabel("something-new", null).kind).toBe("building");
  });

  it("falls back to the title, then to Agent, when there is no role", () => {
    expect(subagentRoleLabel(null, "Map the files")).toEqual({
      kind: "other",
      label: "Map the files",
      technical: null,
    });
    expect(subagentRoleLabel("  ", "")).toEqual({
      kind: "other",
      label: label("Agent"),
      technical: null,
    });
  });
});
