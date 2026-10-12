import type { ProjectScript } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import {
  checklistDecision,
  pickCheckScripts,
  reviewVerdict,
  type ChecklistItemState,
} from "./publishChecklist.logic";

function script(overrides: Partial<ProjectScript> & Pick<ProjectScript, "id">): ProjectScript {
  return {
    name: overrides.id,
    command: `pnpm ${overrides.id}`,
    icon: "play",
    runOnWorktreeCreate: false,
    ...overrides,
  } as ProjectScript;
}

describe("pickCheckScripts", () => {
  it("prefers the build and test icons", () => {
    const picked = pickCheckScripts([
      script({ id: "compile", name: "Build all", command: "pnpm build:all" }),
      script({ id: "bundle", icon: "build", command: "pnpm bundle" }),
      script({ id: "check", icon: "test", command: "pnpm check" }),
    ]);
    expect(picked.build?.id).toBe("bundle");
    expect(picked.test?.id).toBe("check");
  });

  it("falls back to scripts named or invoking build/test", () => {
    const picked = pickCheckScripts([
      script({ id: "web", name: "Web", command: "pnpm build" }),
      script({ id: "unit", name: "Unit tests", command: "vp run unit" }),
    ]);
    expect(picked.build?.id).toBe("web");
    expect(picked.test?.id).toBe("unit");
  });

  it("never picks dev servers or words that only contain build/test", () => {
    const picked = pickCheckScripts([
      script({ id: "dev", icon: "build", command: "pnpm dev", async: true }),
      script({ id: "preview", name: "Test preview", previewUrl: "http://localhost:3000" }),
      script({ id: "upgrade", name: "Upgrade", command: "npx tool@latest --prebuild" }),
    ]);
    expect(picked).toEqual({ build: null, test: null });
  });
});

describe("reviewVerdict", () => {
  it("fails on high-risk files and lists at most three paths", () => {
    const verdict = reviewVerdict({
      files: ["a.ts", "b.ts", "c.ts", "d.ts"].map((path) => ({ path, what: "", risk: "high" })),
    });
    expect(verdict.status).toBe("fail");
    expect(verdict.reason).toContain("a.ts, b.ts, c.ts");
    expect(verdict.reason).not.toContain("d.ts");
    expect(verdict.reason).toContain("4");
  });

  it("warns on medium risk and passes on low risk only", () => {
    expect(
      reviewVerdict({
        files: [
          { path: "a.ts", what: "", risk: "medium" },
          { path: "b.ts", what: "", risk: "low" },
        ],
      }).status,
    ).toBe("warn");
    expect(reviewVerdict({ files: [{ path: "a.ts", what: "", risk: "low" }] }).status).toBe("pass");
    expect(reviewVerdict({ files: [] }).status).toBe("pass");
  });
});

describe("checklistDecision", () => {
  const item = (id: ChecklistItemState["id"], status: ChecklistItemState["status"]) => ({
    id,
    status,
    detail: "",
  });

  it("allows publishing when every item passed, warned or was skipped", () => {
    expect(
      checklistDecision([
        item("secrets", "pass"),
        item("build", "skipped"),
        item("tests", "pass"),
        item("review", "warn"),
      ]),
    ).toEqual({ canPublish: true, needsOverride: false, isRunning: false, blockingReasons: [] });
  });

  it("asks for an override naming every failed item", () => {
    const decision = checklistDecision([
      item("secrets", "fail"),
      item("build", "pass"),
      item("tests", "fail"),
      item("review", "pass"),
    ]);
    expect(decision.canPublish).toBe(false);
    expect(decision.needsOverride).toBe(true);
    expect(decision.blockingReasons).toHaveLength(2);
  });

  it("blocks publishing while anything still runs", () => {
    const decision = checklistDecision([item("secrets", "fail"), item("build", "running")]);
    expect(decision.canPublish).toBe(false);
    expect(decision.isRunning).toBe(true);
  });
});
