import { tc } from "~/i18n";

/**
 * Plain name for what a subagent is doing, from its technical role (the
 * subagent_type Claude launched it with). The plain word goes through the
 * dictionary; the technical role is shown as-is beside it, like the git terms.
 */
export type SubagentRoleKind = "thinking" | "building" | "reading" | "reviewing" | "other";

export interface SubagentRoleLabel {
  readonly kind: SubagentRoleKind;
  /** Translated plain word, or the task title when there is no role. */
  readonly label: string;
  /** The technical role as Claude named it; null when there is none. */
  readonly technical: string | null;
}

const ROLE_RULES: ReadonlyArray<{
  readonly kind: Exclude<SubagentRoleKind, "other" | "building">;
  readonly needles: ReadonlyArray<string>;
}> = [
  { kind: "thinking", needles: ["estrategista", "plan", "architect", "think"] },
  { kind: "reviewing", needles: ["revisor", "review", "audit"] },
  { kind: "reading", needles: ["explore", "search", "guide", "research", "reader"] },
];

const KIND_LABEL: Readonly<Record<Exclude<SubagentRoleKind, "other">, string>> = {
  thinking: "Thinking",
  building: "Building",
  reading: "Reading",
  reviewing: "Reviewing",
};

export function subagentRoleLabel(
  role: string | null | undefined,
  title: string | null | undefined,
): SubagentRoleLabel {
  const technical = role?.trim() || null;
  if (!technical) {
    const fallback = title?.trim();
    return {
      kind: "other",
      label: fallback || tc("subagent role", "Agent"),
      technical: null,
    };
  }
  const lowered = technical.toLowerCase();
  // Anything with a role that is not thinking, reviewing or reading is doing
  // the work: operador, executor, general-purpose, builders and unknown types.
  const kind =
    ROLE_RULES.find((rule) => rule.needles.some((needle) => lowered.includes(needle)))?.kind ??
    "building";
  return { kind, label: tc("subagent role", KIND_LABEL[kind]), technical };
}
