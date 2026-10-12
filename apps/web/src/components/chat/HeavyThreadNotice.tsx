import { LayersIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import type { ComposerBannerStackItem } from "./ComposerBannerStack";
import { t } from "~/i18n";

/**
 * The composer notice for a thread whose context has grown past the user's
 * threshold: every further turn resends more, so a fresh thread is cheaper.
 */
export function heavyThreadBannerItem(input: {
  readonly id: string;
  readonly usedPercentage: number;
  readonly onStartNewThread: () => void;
  readonly onCompact: () => void;
  readonly compactDisabled: boolean;
  readonly compactDisabledReason: string | null;
  readonly onDismiss: () => void;
}): ComposerBannerStackItem {
  const compactAction = (
    <Button
      size="xs"
      variant="ghost"
      disabled={input.compactDisabled}
      onClick={() => {
        if (input.compactDisabled) return;
        input.onCompact();
      }}
    >
      {t("Compact this one")}
    </Button>
  );
  return {
    id: input.id,
    variant: "info",
    icon: <LayersIcon />,
    title: t("This conversation is getting heavy ({percent}% of context).", {
      percent: Math.round(input.usedPercentage),
    }),
    description: t("Each message now costs more; it is best to start another conversation."),
    actions: (
      <>
        <Button size="xs" variant="ghost" onClick={input.onStartNewThread}>
          {t("Start another conversation")}
        </Button>
        {input.compactDisabledReason ? (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex">{compactAction}</span>} />
            <TooltipPopup side="top">{input.compactDisabledReason}</TooltipPopup>
          </Tooltip>
        ) : (
          compactAction
        )}
      </>
    ),
    dismissLabel: t("Dismiss heavy conversation notice"),
    onDismiss: input.onDismiss,
  };
}
