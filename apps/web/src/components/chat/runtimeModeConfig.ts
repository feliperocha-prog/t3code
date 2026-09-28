import type { RuntimeMode } from "@t3tools/contracts";
import { type LucideIcon, LockIcon, LockOpenIcon, PenLineIcon, SparklesIcon } from "lucide-react";
import { t } from "~/i18n";

export const runtimeModeConfig: Record<
  RuntimeMode,
  { label: string; description: string; icon: LucideIcon }
> = {
  "approval-required": {
    label: t("Supervised"),
    description: t("Ask before commands and file changes."),
    icon: LockIcon,
  },
  "auto-accept-edits": {
    label: t("Auto-accept edits"),
    description: t("Auto-approve edits, ask before other actions."),
    icon: PenLineIcon,
  },
  auto: {
    label: t("Auto"),
    description: t("Supported providers approve routine actions; others still ask."),
    icon: SparklesIcon,
  },
  "full-access": {
    label: t("Full access"),
    description: t("Allow commands and edits without prompts."),
    icon: LockOpenIcon,
  },
};

export const runtimeModeOptions = Object.keys(runtimeModeConfig) as RuntimeMode[];
