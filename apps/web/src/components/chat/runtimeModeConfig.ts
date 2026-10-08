import type { RuntimeMode } from "@t3tools/contracts";
import { type LucideIcon, LockIcon, LockOpenIcon, PenLineIcon, SparklesIcon } from "lucide-react";
import { t, tc } from "~/i18n";

/**
 * Mode pickers name each mode by what the agent may do on its own; the
 * provider-style name (Supervised, Full access, ...) stays as `technicalLabel`
 * so the mode can still be matched with provider docs.
 */
export const runtimeModeConfig: Record<
  RuntimeMode,
  { label: string; technicalLabel: string; description: string; icon: LucideIcon }
> = {
  "approval-required": {
    label: tc("runtime mode", "Asks first"),
    technicalLabel: t("Supervised"),
    description: tc("runtime mode", "Asks before commands and file changes."),
    icon: LockIcon,
  },
  "auto-accept-edits": {
    label: tc("runtime mode", "Edits on its own"),
    technicalLabel: t("Auto-accept edits"),
    description: tc("runtime mode", "Changes files without asking; asks before commands."),
    icon: PenLineIcon,
  },
  auto: {
    label: tc("runtime mode", "Decides on its own"),
    technicalLabel: t("Auto"),
    description: tc(
      "runtime mode",
      "Approves routine actions itself and asks about the rest, on providers that support it.",
    ),
    icon: SparklesIcon,
  },
  "full-access": {
    label: tc("runtime mode", "Does everything"),
    technicalLabel: t("Full access"),
    description: tc("runtime mode", "Runs commands and changes files without asking."),
    icon: LockOpenIcon,
  },
};

export const runtimeModeOptions = Object.keys(runtimeModeConfig) as RuntimeMode[];

/** Shown under every mode picker: the mode is the app's lock, not the agent's own rules. */
export const runtimeModeStillAsksNote = tc(
  "runtime mode",
  "In any mode the agent's own rules can still make it ask first — for example before publishing, merging, deleting what it did not create, writing to live systems or spending on paid APIs.",
);
