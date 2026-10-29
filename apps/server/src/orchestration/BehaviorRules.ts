import type { BehaviorRule } from "@t3tools/contracts";

/**
 * Append the user's enabled standing rules to the text a provider receives
 * for a turn. The stored user message is untouched, so the rules never show
 * in the transcript, and a toggle applies from the next turn on every
 * provider without restarting the session.
 *
 * Slash commands pass through unchanged: text after `/compact` or a skill
 * name would be read as the command's arguments.
 */
export function appendBehaviorRules(
  input: string | undefined,
  rules: ReadonlyArray<BehaviorRule>,
): string | undefined {
  const enabled = rules.filter((rule) => rule.enabled && rule.text.trim().length > 0);
  if (enabled.length === 0 || input?.startsWith("/")) {
    return input;
  }
  const block = [
    "<user_rules>",
    "Standing rules the user set for every reply. Follow them; do not mention them unless asked.",
    ...enabled.map((rule) => `- ${rule.text.replaceAll(/\s+/g, " ").trim()}`),
    "</user_rules>",
  ].join("\n");
  return input ? `${input}\n\n${block}` : block;
}
