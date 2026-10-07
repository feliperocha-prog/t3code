import type { MessageId } from "@t3tools/contracts";
import type { ReactNode } from "react";

import { tc } from "~/i18n";
import { cn } from "~/lib/utils";

import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import type { StatusCardHeadline, StatusCardTone, StatusCardView } from "./statusCard.logic";

export type StatusCardVariant = "strip" | "inline";

// Same semantic tokens the Badge tones use, so a state reads the same colour
// everywhere in the app.
const TONE_TEXT = {
  working: "text-info-foreground",
  waiting: "text-warning-foreground",
  done: "text-success-foreground",
  failed: "text-destructive-foreground",
  neutral: "text-muted-foreground",
} as const satisfies Record<StatusCardTone, string>;

const TONE_DOT = {
  working: "bg-info",
  waiting: "bg-warning",
  done: "bg-success",
  failed: "bg-destructive",
  neutral: "bg-muted-foreground",
} as const satisfies Record<StatusCardTone, string>;

const TONE_BORDER = {
  working: "border-info",
  waiting: "border-warning",
  done: "border-success",
  failed: "border-destructive",
  neutral: "border-muted-foreground/50",
} as const satisfies Record<StatusCardTone, string>;

function headlineText(headline: StatusCardHeadline): string {
  switch (headline.kind) {
    case "working":
      return tc("status card", "Working…");
    case "approval":
      return tc("status card", "Waiting on you: approve");
    case "input":
      return tc("status card", "Waiting on you: answer");
    case "failed":
      return tc("status card", "Failed");
    case "none":
      return tc("status card", "No status");
    case "card":
      return headline.status;
  }
}

function ToneDot({ tone }: { tone: StatusCardTone }) {
  return <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", TONE_DOT[tone])} />;
}

export interface StatusCardProps {
  readonly view: StatusCardView;
  readonly variant?: StatusCardVariant;
  /** Scrolls to the reply the card came from. Used only when the view has a message. */
  readonly onReveal?: ((messageId: MessageId) => void) | undefined;
  readonly className?: string;
}

/**
 * Where a conversation stands: the STATUS / VOCÊ / EU block of the last reply,
 * or the live session state when that outranks it. `strip` is the one-line
 * summary at the top of a conversation and `inline` the card that replaces
 * the raw block inside a reply.
 */
export function StatusCard({ view, variant = "strip", onReveal, className }: StatusCardProps) {
  const headline = headlineText(view.headline);
  const cardProps = {
    "data-status-card": variant,
    "data-status-tone": view.tone,
  };

  if (variant === "inline") {
    return (
      <div
        {...cardProps}
        className={cn(
          "my-3 flex min-w-0 flex-col gap-1.5 rounded-lg border-l-3 bg-muted/30 px-4 py-3 text-left text-sm",
          TONE_BORDER[view.tone],
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <ToneDot tone={view.tone} />
          <span className={cn("min-w-0 break-words font-semibold", TONE_TEXT[view.tone])}>
            {headline}
          </span>
        </div>
        {view.voce ? (
          <div className="flex min-w-0 gap-2">
            <span className="w-10 shrink-0 text-muted-foreground">{tc("status card", "You")}</span>
            <span className="min-w-0 break-words">{view.voce}</span>
          </div>
        ) : null}
        {view.eu ? (
          <div className="flex min-w-0 gap-2">
            <span className="w-10 shrink-0 text-muted-foreground">{tc("status card", "Me")}</span>
            <span className="min-w-0 break-words text-muted-foreground">{view.eu}</span>
          </div>
        ) : null}
      </div>
    );
  }

  const messageId = view.messageId;
  const reveal = onReveal !== undefined && messageId !== null ? () => onReveal(messageId) : null;
  const separator = <span className="text-muted-foreground">{" · "}</span>;

  // One line: dot, then the whole sentence truncates as a unit.
  const line = (
    <>
      <ToneDot tone={view.tone} />
      <span className="min-w-0 truncate">
        <span className={cn("font-medium", TONE_TEXT[view.tone])}>{headline}</span>
        {view.voce ? (
          <>
            {separator}
            <span className="text-muted-foreground">{tc("status card", "You")}: </span>
            <span className="font-medium text-foreground">{view.voce}</span>
          </>
        ) : null}
        {view.eu ? (
          <>
            {separator}
            <span className="text-muted-foreground">{tc("status card", "Me")}: </span>
            <span className="text-muted-foreground">{view.eu}</span>
          </>
        ) : null}
      </span>
    </>
  );

  const lineClass = cn(
    "flex min-w-0 max-w-full items-center gap-2 text-left text-sm",
    reveal &&
      "cursor-pointer rounded-sm hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  );

  // TooltipTrigger receives this element as `render` and the line as children.
  // Base UI spreads the element's props last, so the element must not carry
  // its own `children` or it would blank the line.
  const trigger = reveal ? (
    <button type="button" onClick={reveal} className={lineClass} {...cardProps} />
  ) : (
    <div className={lineClass} {...cardProps} />
  );

  return (
    <Tooltip>
      <TooltipTrigger render={trigger}>{line}</TooltipTrigger>
      <TooltipPopup side="bottom">
        <StatusTooltipBody headline={headline} view={view} revealable={reveal !== null} />
      </TooltipPopup>
    </Tooltip>
  );
}

function StatusTooltipBody({
  headline,
  view,
  revealable,
}: {
  headline: string;
  view: StatusCardView;
  revealable: boolean;
}): ReactNode {
  return (
    <span className="block max-w-80 whitespace-normal">
      <span className="block">
        {tc("status card", "Status")}: {headline}
      </span>
      {view.voce ? (
        <span className="block">
          {tc("status card", "You")}: {view.voce}
        </span>
      ) : null}
      {view.eu ? (
        <span className="block">
          {tc("status card", "Me")}: {view.eu}
        </span>
      ) : null}
      {revealable ? (
        <span className="mt-1 block text-muted-foreground">
          {tc("status card", "Go to the reply this came from")}
        </span>
      ) : null}
    </span>
  );
}
