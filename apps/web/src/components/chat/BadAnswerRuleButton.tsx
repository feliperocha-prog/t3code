import type { EnvironmentId } from "@t3tools/contracts";
import { ThumbsDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { useEnvironmentSettings, useUpdateEnvironmentSettings } from "~/hooks/useSettings";
import { t } from "~/i18n";
import { randomUUID } from "~/lib/utils";
import { addBehaviorRule } from "../settings/BehaviorRulesSettings";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

const EXCERPT_LENGTH = 220;

function suggestions(): ReadonlyArray<string> {
  return [
    t("Keep answers short and get to the point"),
    t("Explain without technical jargon"),
    t("Ask me before making a decision that changes scope"),
    t("Do not touch files I did not ask about"),
  ];
}

/**
 * "This was bad" under an assistant answer: turns the complaint into a
 * standing rule, so the next turn on any thread already follows it.
 */
export function BadAnswerRuleButton({
  environmentId,
  answerText,
}: {
  environmentId: EnvironmentId;
  answerText: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaId = useId();
  const rules = useEnvironmentSettings(environmentId, (settings) => settings.behaviorRules);
  const updateSettings = useUpdateEnvironmentSettings(environmentId);
  const excerpt =
    answerText.length > EXCERPT_LENGTH
      ? `${answerText.slice(0, EXCERPT_LENGTH).trimEnd()}…`
      : answerText;

  const save = () => {
    const next = addBehaviorRule(rules, draft, randomUUID());
    if (next !== rules) {
      updateSettings({ behaviorRules: next });
      toastManager.add({
        type: "success",
        title: t("Rule saved"),
        description: t("It applies from your next message. Manage it in Settings › General."),
      });
    }
    setOpen(false);
    setDraft("");
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="xs"
              variant="ghost-muted"
              aria-label={t("This was bad")}
              onClick={() => setOpen(true)}
            />
          }
        >
          <ThumbsDownIcon className="size-3" />
        </TooltipTrigger>
        <TooltipPopup>
          <p>{t("This was bad: turn it into a rule")}</p>
        </TooltipPopup>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("What should the agent do differently?")}</DialogTitle>
            <DialogDescription>
              {t("It becomes a rule the agent follows in every conversation.")}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="grid gap-3">
              {excerpt.length > 0 ? (
                <blockquote className="line-clamp-4 border-l-2 border-border pl-3 text-xs text-muted-foreground">
                  {excerpt}
                </blockquote>
              ) : null}
              <label htmlFor={textareaId} className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">{t("New rule")}</span>
                <Textarea
                  id={textareaId}
                  value={draft}
                  autoFocus
                  placeholder={t("e.g. Answer in plain Portuguese, no jargon")}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      save();
                    }
                  }}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestions().map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => setDraft(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button size="sm" disabled={draft.trim().length === 0} onClick={save}>
              {t("Save rule")}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  );
}
