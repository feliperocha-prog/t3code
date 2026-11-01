import type { BehaviorRule } from "@t3tools/contracts";

/**
 * Append the user's enabled standing rules to the text a provider receives
 * for a turn. The stored user message is untouched, so the rules never show
 * in the transcript, and a toggle applies from the next turn on every
 * provider without restarting the session. The block says it is re-sent each
 * turn: it stays in the model's history, so without that a rule switched off
 * would be followed until the session ended.
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
    "Rules the user set for this reply. Follow them; do not mention them unless asked. They are sent again with each message: a rule missing from the latest message no longer applies.",
    ...enabled.map((rule) => `- ${rule.text.replaceAll(/\s+/g, " ").trim()}`),
    "</user_rules>",
  ].join("\n");
  return input ? `${input}\n\n${block}` : block;
}
