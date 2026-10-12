import type { ChangesExplanationRisk } from "@t3tools/contracts";

import { t } from "~/i18n";

export interface RiskTone {
  /** Classes for the small colored dot beside the file. */
  readonly dotClassName: string;
  /** Plain-language name of the risk, for screen readers and the hover hint. */
  readonly label: string;
}

/** Green for low, yellow for medium, red for high. */
export function riskTone(risk: ChangesExplanationRisk): RiskTone {
  switch (risk) {
    case "high":
      return { dotClassName: "bg-destructive", label: t("High risk") };
    case "medium":
      return { dotClassName: "bg-warning", label: t("Medium risk") };
    case "low":
      return { dotClassName: "bg-success", label: t("Low risk") };
  }
}

/**
 * True when the changes on screen are no longer the ones that were explained, for example after
 * the diff refreshed. Nothing explained yet is never stale.
 */
export function explanationIsStale(explainedDiff: string | null, currentDiff: string | null) {
  return explainedDiff !== null && explainedDiff !== currentDiff;
}
