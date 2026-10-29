import { scopedThreadKey } from "@t3tools/client-runtime/environment";
import type { DesktopPreviewThumbnail, ScopedThreadRef } from "@t3tools/contracts";
import { Columns2Icon, RefreshCwIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";
import { t } from "~/i18n";
import { useThreadShell } from "~/state/entities";

import { previewBridge } from "./previewBridge";
import { turnCaptureMoment, usePreviewBeforeAfterStore } from "./previewBeforeAfterStore";

// Gives a dev server's hot reload time to repaint before the "after" shot.
const AFTER_SETTLE_MS = 2000;

/**
 * Photographs the open preview when the thread's turn starts and again when it
 * settles. Runs only while the preview panel is mounted with a live page.
 */
export function usePreviewBeforeAfterCapture(
  threadRef: ScopedThreadRef,
  runtimeTabId: string | null,
  enabled: boolean,
) {
  const threadKey = scopedThreadKey(threadRef);
  const latestTurn = useThreadShell(threadRef)?.latestTurn ?? null;
  const turnId = latestTurn?.turnId ?? null;
  const running = latestTurn?.state === "running";
  const seenRef = useRef<{ turnId: string; running: boolean } | null>(null);

  useEffect(() => {
    const previous = seenRef.current;
    const next = turnId === null ? null : { turnId, running };
    seenRef.current = next;
    if (!enabled || !runtimeTabId || !previewBridge || next === null) return;
    const moment = turnCaptureMoment(previous, next);
    if (moment === null) return;
    const bridge = previewBridge;
    const capture = () =>
      bridge
        .captureThumbnail(runtimeTabId)
        .then((shot) => {
          const store = usePreviewBeforeAfterStore.getState();
          if (moment === "before") store.setBefore(threadKey, next.turnId, shot);
          else store.setAfter(threadKey, next.turnId, shot);
        })
        .catch((error: unknown) => {
          console.warn("[preview] before/after capture failed", error);
        });
    if (moment === "before") {
      void capture();
      return;
    }
    const timer = window.setTimeout(() => void capture(), AFTER_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, running, runtimeTabId, threadKey, turnId]);
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
  runtimeTabId,
  onClose,
}: {
  threadRef: ScopedThreadRef;
  runtimeTabId: string | null;
  onClose: () => void;
}) {
  const threadKey = scopedThreadKey(threadRef);
  const pair = usePreviewBeforeAfterPair(threadRef);
  const retakeAfter = useCallback(() => {
    if (!pair || !runtimeTabId || !previewBridge) return;
    const turnId = pair.turnId;
    void previewBridge
      .captureThumbnail(runtimeTabId)
      .then((shot) => usePreviewBeforeAfterStore.getState().setAfter(threadKey, turnId, shot))
      .catch((error: unknown) => {
        console.warn("[preview] before/after capture failed", error);
      });
  }, [pair, runtimeTabId, threadKey]);

  return (
    <div className="@container/before-after absolute inset-0 z-20 flex flex-col gap-2 bg-background p-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {t("Before × after the last reply")}
        </p>
        <Button variant="ghost" size="xs" type="button" onClick={retakeAfter} disabled={!pair}>
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
