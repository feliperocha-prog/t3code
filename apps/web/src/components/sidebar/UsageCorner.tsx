import type { ServerProviderUsageWindow } from "@t3tools/contracts";
import { formatDuration, providersWithLimits } from "@t3tools/shared/usageLimits";
import { useAtomValue } from "@effect/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback } from "react";

import { useNowMinute } from "~/hooks/useNowMinute";
import { cn } from "~/lib/utils";
import { primaryServerProvidersAtom } from "~/state/server";
import { t, tc } from "~/i18n";
import { useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { cornerTone, pickCornerWindows, type CornerTone } from "./UsageCorner.logic";

const TONE_CLASS: Record<CornerTone, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

/**
 * Claude's session and weekly limits as two thin bars above the sidebar's
 * utility menu. Renders nothing until the primary server reports Claude windows.
 */
export const UsageCorner = memo(function UsageCorner() {
  const providers = useAtomValue(primaryServerProvidersAtom);
  const nowMinute = useNowMinute();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const openUsage = useCallback(() => {
    if (isMobile) setOpenMobile(false);
    void navigate({ to: "/usage" });
  }, [isMobile, navigate, setOpenMobile]);

  const limits = providersWithLimits(providers).find(
    (provider) => provider.driver === "claudeAgent" && !provider.usageLimits?.unavailable,
  )?.usageLimits;
  if (!limits) return null;
  const { session, weekly } = pickCornerWindows(limits.windows);
  if (!session && !weekly) return null;
  const now = Date.parse(`${nowMinute}:00.000Z`);

  return (
    <div className="flex flex-col gap-0.5 px-2 pb-1">
      {session ? (
        <UsageCornerRow
          label={tc("usage corner", "Session")}
          tooltip={t("Claude's 5-hour limit")}
          window={session}
          now={now}
          onClick={openUsage}
        />
      ) : null}
      {weekly ? (
        <UsageCornerRow
          label={tc("usage corner", "Week")}
          tooltip={t("Claude's weekly limit")}
          window={weekly}
          now={now}
          onClick={openUsage}
        />
      ) : null}
    </div>
  );
});

function UsageCornerRow({
  label,
  tooltip,
  window,
  now,
  onClick,
}: {
  readonly label: string;
  readonly tooltip: string;
  readonly window: ServerProviderUsageWindow;
  readonly now: number;
  readonly onClick: () => void;
}) {
  const used = Math.round(Math.max(0, Math.min(100, window.usedPercent)));
  const resetsAt = window.resetsAt === undefined ? Number.NaN : Date.parse(window.resetsAt);
  const resetsIn = !Number.isFinite(resetsAt)
    ? null
    : resetsAt <= now
      ? t("resets now")
      : t("resets in {time}", { time: formatDuration(resetsAt - now) });
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label={t("{label}: {percent}% used. See usage and limits", {
              label,
              percent: used,
            })}
            className="flex w-full flex-col gap-1 rounded-md px-2 py-1 text-left text-muted-foreground text-xs hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex w-full items-baseline gap-2">
              <span className="truncate">{label}</span>
              <span className="ms-auto shrink-0 font-medium text-foreground tabular-nums">
                {t("{percent}% used", { percent: used })}
              </span>
              {resetsIn ? <span className="shrink-0 tabular-nums">{resetsIn}</span> : null}
            </span>
            <span className="h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span
                className={cn("block h-full rounded-full", TONE_CLASS[cornerTone(used)])}
                style={{ width: `${used}%` }}
              />
            </span>
          </button>
        }
      />
      <TooltipPopup side="top">{tooltip}</TooltipPopup>
    </Tooltip>
  );
}
