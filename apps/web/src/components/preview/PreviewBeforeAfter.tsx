import { scopedThreadKey } from "@t3tools/client-runtime/environment";
import type { DesktopPreviewThumbnail, ScopedThreadRef } from "@t3tools/contracts";
import { Columns2Icon, RefreshCwIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";
import { t } from "~/i18n";
import { useThreadShell } from "~/state/entities";

import { previewBridge } from "./previewBridge";
import { turnCaptureMoment, usePreviewBeforeAfterStore } from "./previewBeforeAfterStore";

// Gives a dev server's hot reload time to repaint before the "after" shot.
const AFTER_SETTLE_MS = 2000;
// Lets a hidden native surface present again before it is photographed.
const SURFACE_SHOW_MS = 400;

function captureInto(
  moment: "before" | "after",
  threadKey: string,
  turnId: string,
  runtimeTabId: string,
): Promise<void> {
  if (!previewBridge) return Promise.resolve();
  return previewBridge
    .captureThumbnail(runtimeTabId)
    .then((shot) => {
      const store = usePreviewBeforeAfterStore.getState();
      if (moment === "before") store.setBefore(threadKey, turnId, shot);
      else store.setAfter(threadKey, turnId, shot);
    })
    .catch((error: unknown) => {
      console.warn("[preview] before/after capture failed", error);
    });
}

/**
 * Photographs the open preview when the thread's turn starts and again when it
 * settles. `canCapture` must be false whenever the page surface is hidden (the
 * compare view is open, the page failed to load); a pending "after" waits for
 * it instead of photographing an empty surface.
 */
export function usePreviewBeforeAfterCapture(
  threadRef: ScopedThreadRef,
  runtimeTabId: string | null,
  canCapture: boolean,
) {
  const threadKey = scopedThreadKey(threadRef);
  const latestTurn = useThreadShell(threadRef)?.latestTurn ?? null;
  const turnId = latestTurn?.turnId ?? null;
  const running = latestTurn?.state === "running";
  const seenRef = useRef<{ threadKey: string; turnId: string; running: boolean } | null>(null);
  const [pendingAfter, setPendingAfter] = useState<{ threadKey: string; turnId: string } | null>(
    null,
  );

  useEffect(() => {
    // A thread switch is a first observation: the other thread's turn state
    // says nothing about this page.
    const seen = seenRef.current;
    const previous = seen?.threadKey === threadKey ? seen : null;
    seenRef.current = turnId === null ? null : { threadKey, turnId, running };
    const next = turnId === null ? null : { turnId, running };
    const moment = turnCaptureMoment(previous, next);
    if (moment === null || next === null) return;
    if (moment === "after") {
      setPendingAfter({ threadKey, turnId: next.turnId });
      return;
    }
    setPendingAfter(null);
    if (canCapture && runtimeTabId)
      void captureInto("before", threadKey, next.turnId, runtimeTabId);
    // Only turn transitions decide; canCapture and the tab are read as they are now.
  }, [running, threadKey, turnId]);

  useEffect(() => {
    if (!pendingAfter || pendingAfter.threadKey !== threadKey) return;
    if (!canCapture || !runtimeTabId) return;
    const timer = window.setTimeout(() => {
      void captureInto("after", pendingAfter.threadKey, pendingAfter.turnId, runtimeTabId);
      setPendingAfter(null);
    }, AFTER_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [canCapture, pendingAfter, runtimeTabId, threadKey]);
}

/**
 * Retakes the "after" shot from the compare view. The compare view hides the
 * page surface, so it closes, waits for the page to show, shoots, and reopens.
 */
export async function retakePreviewAfter(input: {
  threadKey: string;
  turnId: string;
  runtimeTabId: string;
  setCompareOpen: (open: boolean) => void;
}) {
  input.setCompareOpen(false);
  await new Promise((resolve) => window.setTimeout(resolve, SURFACE_SHOW_MS));
  await captureInto("after", input.threadKey, input.turnId, input.runtimeTabId);
  input.setCompareOpen(true);
}

export function usePreviewBeforeAfterPair(threadRef: ScopedThreadRef) {
  const threadKey = scopedThreadKey(threadRef);
  return usePreviewBeforeAfterStore((state) => state.byThreadKey[threadKey] ?? null);
}

export function PreviewBeforeAfterButton({
  available,
  active,
  onToggle,
}: {
  available: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const label = active ? t("Close before × after") : t("Before × after");
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={onToggle}
            aria-label={label}
            aria-pressed={active ? "true" : "false"}
            type="button"
            disabled={!available && !active}
          />
        }
      >
        <Columns2Icon />
      </TooltipTrigger>
      <TooltipPopup>
        {available || active
          ? label
          : t("Before × after appears after Claude answers with the preview open")}
      </TooltipPopup>
    </Tooltip>
  );
}

function Shot({ title, shot }: { title: string; shot: DesktopPreviewThumbnail | null }) {
  return (
    <figure className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
      <figcaption className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{title}</span>
        {shot ? (
          <span className="text-muted-foreground">
            {new Date(shot.createdAt).toLocaleTimeString()}
          </span>
        ) : null}
      </figcaption>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/30">
        {shot ? (
          <img src={shot.dataUrl} alt={title} className="block w-full" />
        ) : (
          <p className="p-4 text-xs text-muted-foreground">
            {t("Waiting for Claude to finish the reply…")}
          </p>
        )}
      </div>
    </figure>
  );
}

/** Side-by-side compare that covers the page area while open. */
export function PreviewBeforeAfterView({
  threadRef,
  onRetakeAfter,
  onClose,
}: {
  threadRef: ScopedThreadRef;
  onRetakeAfter: ((turnId: string) => void) | null;
  onClose: () => void;
}) {
  const pair = usePreviewBeforeAfterPair(threadRef);

  return (
    <div className="@container/before-after absolute inset-0 z-20 flex flex-col gap-2 bg-background p-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {t("Before × after the last reply")}
        </p>
        <Button
          variant="ghost"
          size="xs"
          type="button"
          onClick={() => pair && onRetakeAfter?.(pair.turnId)}
          disabled={!pair || !onRetakeAfter}
        >
          <RefreshCwIcon />
          {t("Retake after")}
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          onClick={onClose}
          aria-label={t("Close")}
        >
          <XIcon />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 @2xl/before-after:flex-row">
        <Shot title={t("Before")} shot={pair?.before ?? null} />
        <Shot title={t("After")} shot={pair?.after ?? null} />
      </div>
    </div>
  );
}
