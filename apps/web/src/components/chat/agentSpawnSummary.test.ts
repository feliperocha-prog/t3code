import { describe, expect, it } from "vite-plus/test";
import type { RuntimeSubagent } from "@t3tools/client-runtime/state/subagentRuntime";
import { deriveAgentSpawnSummary } from "./agentSpawnSummary";
import { t } from "~/i18n";

const batch = (status: RuntimeSubagent["status"]) => ({ kind: "subagent_batch" as const, status });
const agent = (status: RuntimeSubagent["status"]) => ({ kind: "subagent" as const, status });

describe("deriveAgentSpawnSummary", () => {
  it("counts a native batch without claiming the number of children", () => {
    expect(deriveAgentSpawnSummary({ agents: [batch("running")], agentCount: 1 })).toEqual({
      live: true,
      lead: t("Launched {subjects}", { subjects: t("{count} subagent batch", { count: 1 }) }),
      status: t("{count} working", { count: 1 }),
      tone: "working",
    });
    expect(deriveAgentSpawnSummary({ agents: [batch("idle")], agentCount: 1 })).toEqual({
      live: false,
      lead: t("Launched {subjects}", { subjects: t("{count} subagent batch", { count: 1 }) }),
      status: t("{count} idle", { count: 1 }),
      tone: "inactive",
    });
  });

  it("keeps individual agents and batches separate in a mixed group", () => {
    expect(
      deriveAgentSpawnSummary({
        agents: [agent("running"), batch("running"), batch("idle")],
        agentCount: 3,
      }).lead,
    ).toBe(
      t("Launched {subjects}", {
        subjects: [t("{count} subagent", { count: 1 }), t("{count} batches", { count: 2 })].join(
          t(" and "),
        ),
      }),
    );
  });

  it.each([
    ["idle", t("{count} idle", { count: 1 }), "inactive"],
    ["cancelled", t("{count} stopped", { count: 1 }), "inactive"],
    ["interrupted", t("{count} stopped", { count: 1 }), "inactive"],
    ["failed", t("{count} failed", { count: 1 }), "failed"],
    ["completed", t("✓ completed"), "completed"],
  ] as const)("reports %s accurately alongside a completed agent", (state, status, tone) => {
    expect(
      deriveAgentSpawnSummary({ agents: [agent("completed"), agent(state)], agentCount: 2 }),
    ).toMatchObject({ live: false, status, tone });
  });

  it("does not claim completion when the roster is missing a member", () => {
    expect(deriveAgentSpawnSummary({ agents: [agent("completed")], agentCount: 2 })).toMatchObject({
      status: t("Status unavailable"),
      tone: "inactive",
    });
  });

  it("keeps a workflow active between child launches", () => {
    expect(
      deriveAgentSpawnSummary({
        agents: [agent("completed")],
        agentCount: 1,
        coordinatorStatus: "running",
      }),
    ).toMatchObject({ live: true, status: t("working"), tone: "working" });
  });

  it.each([
    ["failed", t("Workflow failed"), "failed"],
    ["cancelled", t("Workflow stopped"), "inactive"],
  ] as const)(
    "preserves a %s workflow outcome when its children completed",
    (coordinatorStatus, status, tone) => {
      expect(
        deriveAgentSpawnSummary({ agents: [agent("completed")], agentCount: 1, coordinatorStatus }),
      ).toMatchObject({ live: false, status, tone });
    },
  );
});
