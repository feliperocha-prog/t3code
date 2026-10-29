import type { BehaviorRule } from "@t3tools/contracts";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { t } from "~/i18n";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { SettingsRow, SettingsSection } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";
import { useScopedSettings, useUpdateScopedSettings } from "./useScopedSettings";

const RULE_KEYS = ["behaviorRules"] as const;

/** Add a rule at the top of the list, skipping text that is already there. */
export function addBehaviorRule(
  rules: ReadonlyArray<BehaviorRule>,
  text: string,
  id: string,
): ReadonlyArray<BehaviorRule> {
  const trimmed = text.replaceAll(/\s+/g, " ").trim();
  if (trimmed.length === 0) return rules;
  if (rules.some((rule) => rule.text.toLowerCase() === trimmed.toLowerCase())) return rules;
  return [{ id, text: trimmed, enabled: true }, ...rules];
}

/**
 * Standing rules sent with every turn while switched on. Switching one off
 * keeps it in the list; the trash button is the way to drop it for good.
 */
export function BehaviorRulesSettings() {
  const savedRules = useScopedSettings((settings) => settings.behaviorRules);
  const updateSettings = useUpdateScopedSettings();
  const [draft, setDraft] = useState("");
  // Server settings only change after the round trip, so a second click before
  // it lands would rebuild the list from the stale copy and drop the first edit.
  // Show and build on the last list we sent until the server echoes a new one.
  const [pending, setPending] = useState<{
    base: ReadonlyArray<BehaviorRule>;
    rules: ReadonlyArray<BehaviorRule>;
  } | null>(null);
  const rules = pending?.base === savedRules ? pending.rules : savedRules;
  const setRules = (behaviorRules: ReadonlyArray<BehaviorRule>) => {
    setPending({ base: savedRules, rules: behaviorRules });
    updateSettings({ behaviorRules });
  };
  const submit = () => {
    const next = addBehaviorRule(rules, draft, crypto.randomUUID());
    if (next !== rules) setRules(next);
    setDraft("");
  };

  return (
    <SettingsSection {...searchableSetting("behavior-rules")}>
      <SettingsRow
        title={t("New rule")}
        description={t("The agent follows every switched-on rule, in every conversation.")}
        serverScoped
        settingKeys={RULE_KEYS}
        control={
          <form
            className="flex w-full items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Input
              size="sm"
              className="min-w-0 flex-1"
              value={draft}
              placeholder={t("e.g. Answer in plain Portuguese, no jargon")}
              aria-label={t("New rule")}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" size="sm" variant="outline" disabled={draft.trim().length === 0}>
              <PlusIcon />
              {t("Add")}
            </Button>
          </form>
        }
      />
      {rules.length === 0 ? (
        <SettingsRow
          title={t("No rules yet")}
          description={t(
            "Add one here, or press “This was bad” under an answer to turn it into a rule.",
          )}
        />
      ) : null}
      {rules.map((rule) => (
        <SettingsRow
          key={rule.id}
          title={rule.text}
          serverScoped
          settingKeys={RULE_KEYS}
          control={
            <div className="flex items-center gap-1.5">
              <Switch
                checked={rule.enabled}
                aria-label={rule.enabled ? t("Switch rule off") : t("Switch rule on")}
                onCheckedChange={(checked) =>
                  setRules(
                    rules.map((entry) =>
                      entry.id === rule.id ? { ...entry, enabled: Boolean(checked) } : entry,
                    ),
                  )
                }
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon-xs"
                      variant="ghost-destructive"
                      aria-label={t("Delete rule")}
                      onClick={() => setRules(rules.filter((entry) => entry.id !== rule.id))}
                    />
                  }
                >
                  <Trash2Icon />
                </TooltipTrigger>
                <TooltipPopup>{t("Delete rule")}</TooltipPopup>
              </Tooltip>
            </div>
          }
        />
      ))}
    </SettingsSection>
  );
}
