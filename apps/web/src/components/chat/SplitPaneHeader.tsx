import { scopeThreadRef } from "@t3tools/client-runtime/environment";
import type { EnvironmentId, ThreadId } from "@t3tools/contracts";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeftRightIcon, XIcon } from "lucide-react";
import { type ReactNode, useCallback } from "react";

import { t } from "~/i18n";
import { cn } from "~/lib/utils";
import { useSplitViewStore } from "~/splitViewStore";
import { buildThreadRouteParams, resolveThreadRouteRef } from "~/threadRoutes";
import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { WorkspaceBreadcrumbText } from "../WorkspaceBreadcrumb";

interface SplitPaneHeaderProps {
  environmentId: EnvironmentId;
  threadId: ThreadId;
  title: string;
  electron: boolean;
  /** True when the panel toggles sit in this header, so the title keeps clear of them. */
  reserveControls: boolean;
  /** Electron window-controls overlay: keep clear of the native buttons. */
  reserveNativeControls: boolean;
  /** Panel toggles and their Electron no-drag spacer, same as the routed pane's header. */
  children?: ReactNode;
}

/**
 * Top bar of the right pane in split screen: the thread title, a button that
 * swaps it with the routed (left) conversation and one that closes the split.
 * Replaces the tab strip and the full chat header, which stay with the left pane.
 */
export function SplitPaneHeader({
  environmentId,
  threadId,
  title,
  electron,
  reserveControls,
  reserveNativeControls,
  children,
}: SplitPaneHeaderProps) {
  const router = useRouter();
  const routeThreadRef = useParams({
    strict: false,
    select: (params) => resolveThreadRouteRef(params),
  });

  const swapSides = useCallback(async () => {
    if (!routeThreadRef) return;
    const previousPrimary = routeThreadRef;
    // Navigate first: while the route already shows this thread, the right pane
    // is hidden (same thread on both sides), and reopening it with the old left
    // thread finishes the swap. If navigation fails nothing changes.
    await router.navigate({
      to: "/$environmentId/$threadId",
      params: buildThreadRouteParams(scopeThreadRef(environmentId, threadId)),
    });
    useSplitViewStore.getState().openSplit(previousPrimary);
  }, [environmentId, router, routeThreadRef, threadId]);

  const closeSplit = useCallback(() => {
    useSplitViewStore.getState().closeSplit();
  }, []);

  const swapLabel = t("Swap sides");
  const closeLabel = t("Close split screen");

  return (
    <header
      data-split-pane-header
      className={cn(
        "flex h-[var(--workspace-topbar-height)] min-h-[var(--workspace-topbar-height)] shrink-0 items-center gap-1 bg-background pl-(--workspace-gutter-start) pr-(--workspace-gutter-end)",
        electron && "drag-region",
        reserveNativeControls && "wco:pr-(--workspace-native-controls-inset)",
      )}
    >
      {children}
      <Tooltip>
        <TooltipTrigger render={<h2 aria-label={title} className="min-w-0 flex-1" />}>
          <WorkspaceBreadcrumbText>{title}</WorkspaceBreadcrumbText>
        </TooltipTrigger>
        <TooltipPopup side="bottom">{title}</TooltipPopup>
      </Tooltip>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1",
          // Same reserve as the chat header actions: on top of the header
          // gutter, clear of the fixed panel toggles.
          reserveControls && "pr-(--panel-layout-controls-reserve)",
        )}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={swapLabel}
                className="shrink-0 [-webkit-app-region:no-drag]"
                disabled={!routeThreadRef}
                onClick={() => void swapSides()}
              />
            }
          >
            <ArrowLeftRightIcon />
          </TooltipTrigger>
          <TooltipPopup side="bottom">{swapLabel}</TooltipPopup>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={closeLabel}
                className="shrink-0 [-webkit-app-region:no-drag]"
                onClick={closeSplit}
              />
            }
          >
            <XIcon />
          </TooltipTrigger>
          <TooltipPopup side="bottom">{closeLabel}</TooltipPopup>
        </Tooltip>
      </div>
    </header>
  );
}
