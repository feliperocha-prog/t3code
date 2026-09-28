import {
  isActiveSubagentStatus,
  isTerminalSubagentStatus,
  type RuntimeSubagent,
} from "@t3tools/client-runtime/state/subagentRuntime";
import { t } from "~/i18n";

/** Summarize observed states without treating idle or missing agents as completed. */
export function deriveAgentSpawnSummary({
  agents,
  agentCount,
  coordinatorStatus,
}: {
  agents: ReadonlyArray<Pick<RuntimeSubagent, "kind" | "status">>;
  agentCount: number;
  coordinatorStatus?: RuntimeSubagent["status"] | undefined;
}) {
  const working = agents.filter((agent) => isActiveSubagentStatus(agent.status)).length;
  const failed = agents.filter((agent) => agent.status === "failed").length;
  const idle = agents.filter((agent) => agent.status === "idle").length;
  const stopped = agents.filter(
    (agent) => agent.status === "cancelled" || agent.status === "interrupted",
  ).length;
  const batches = agents.filter((agent) => agent.kind === "subagent_batch").length;
  const individuals = agentCount - batches;
  // Workflow coordinators can keep running between dynamic member launches.
  const live =
    coordinatorStatus !== undefined ? !isTerminalSubagentStatus(coordinatorStatus) : working > 0;
  const subjects = [
    individuals > 0
      ? individuals === 1
        ? t("{count} subagent", { count: individuals })
        : t("{count} subagents", { count: individuals })
      : null,
    batches > 0
      ? individuals > 0
        ? batches === 1
          ? t("{count} batch", { count: batches })
          : t("{count} batches", { count: batches })
        : batches === 1
          ? t("{count} subagent batch", { count: batches })
          : t("{count} subagent batches", { count: batches })
      : null,
  ]
    .filter(Boolean)
    .join(t(" and "));
  const leadSubjects = subjects || t("subagents");
  const lead =
    batches > 0
      ? t("Launched {subjects}", { subjects: leadSubjects })
      : live
        ? t("Kicked off {subjects}", { subjects: leadSubjects })
        : t("Ran {subjects}", { subjects: leadSubjects });

  const completedStatus = t("✓ completed");
  const status = live
    ? working > 0
      ? t("{count} working", { count: working })
      : t("working")
    : coordinatorStatus === "failed"
      ? t("Workflow failed")
      : coordinatorStatus === "cancelled" || coordinatorStatus === "interrupted"
        ? t("Workflow stopped")
        : failed > 0
          ? t("{count} failed", { count: failed })
          : stopped > 0
            ? t("{count} stopped", { count: stopped })
            : idle > 0
              ? t("{count} idle", { count: idle })
              : coordinatorStatus !== "completed" &&
                  (agents.length === 0 || agents.length < agentCount)
                ? t("Status unavailable")
                : completedStatus;
  const tone = live
    ? "working"
    : failed > 0 || coordinatorStatus === "failed"
      ? "failed"
      : status === completedStatus
        ? "completed"
        : "inactive";
  return { live, lead, status, tone };
}
