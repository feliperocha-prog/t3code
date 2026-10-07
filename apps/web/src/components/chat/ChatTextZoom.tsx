import { useEffect, useRef, useState } from "react";

import { tc } from "~/i18n";
import {
  getClientSettings,
  useClientSettings,
  useClientSettingsHydrated,
  useUpdateClientSettings,
} from "~/hooks/useSettings";
import { cn } from "~/lib/utils";

import { formatChatTextScale, stepChatTextScale } from "./chatTextScale";

/** Wheel distance (px) per 10% step, so one notch of a mouse wheel is about one step. */
const WHEEL_STEP_DELTA = 50;
/** Firefox reports some wheels in lines; this converts them to pixels. */
const WHEEL_LINE_PX = 16;
const INDICATOR_VISIBLE_MS = 1200;

/**
 * Ctrl (Cmd on macOS) + wheel over `element` steps the conversation text size
 * and saves it. A plain wheel scrolls as usual. The listener is not passive
 * so it can stop the browser's own page zoom.
 */
export function useChatTextZoomWheel(element: HTMLElement | null): void {
  const updateSettings = useUpdateClientSettings();
  useEffect(() => {
    if (!element) return;
    let accumulated = 0;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * WHEEL_LINE_PX : event.deltaY;
      if (delta === 0) return;
      if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
      accumulated += delta;
      const steps = Math.trunc(accumulated / WHEEL_STEP_DELTA);
      if (steps === 0) return;
      accumulated -= steps * WHEEL_STEP_DELTA;
      // Wheel up (negative delta) makes the text bigger.
      const direction = steps < 0 ? 1 : -1;
      const current = getClientSettings().chatTextScale;
      let next = current;
      for (let index = 0; index < Math.abs(steps); index += 1) {
        next = stepChatTextScale(next, direction);
      }
      if (next !== current) void updateSettings({ chatTextScale: next });
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [element, updateSettings]);
}

/**
 * Small pill at the top centre of the conversation that shows the new text
 * size for a moment after it changes. Place it inside a positioned container.
 */
export function ChatTextScaleIndicator() {
  const scale = useClientSettings((settings) => settings.chatTextScale);
  const hydrated = useClientSettingsHydrated();
  const [visible, setVisible] = useState(false);
  const shownScaleRef = useRef(scale);
  const hydratedRef = useRef(hydrated);

  useEffect(() => {
    const wasHydrated = hydratedRef.current;
    hydratedRef.current = hydrated;
    if (shownScaleRef.current === scale) return;
    shownScaleRef.current = scale;
    // The saved size arriving at startup is not a change the user made.
    if (!wasHydrated) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), INDICATOR_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, scale]);

  return (
    <div
      role="status"
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-popover px-3 py-1 text-popover-foreground text-xs shadow-sm transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {tc("chat text scale", "Conversation text: {percent}", {
        percent: formatChatTextScale(scale),
      })}
    </div>
  );
}
