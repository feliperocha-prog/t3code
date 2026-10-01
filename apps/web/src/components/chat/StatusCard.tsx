import type { MessageId } from "@t3tools/contracts";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { tc } from "~/i18n";
import { cn } from "~/lib/utils";

import { Badge } from "../ui/badge";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import type { StatusCardHeadline, StatusCardTone, StatusCardView } from "./statusCard.logic";

export type StatusCardVariant = "default" | "compact" | "inline";

const statusCardVariants = cva(
  "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-0.5 rounded-md border border-border/70 bg-card text-left text-card-foreground text-xs",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        default: "px-3 py-2",
        compact: "px-2 py-1",
        inline: "px-3 py-2",
      },
      interactive: {
        true: "cursor-pointer transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        false: "",
      },
    },
  },
);

const TONE_BADGE = {
  working: "info",
  waiting: "warning",
  done: "success",
  failed: "error",
  neutral: "secondary",
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium text-muted-foreground uppercase tracking-wide">{children}</span>
  );
}

export interface StatusCardProps {
  readonly view: StatusCardView;
  readonly variant?: StatusCardVariant;
  /** Scrolls to the reply the card came from. Shown only when the view has a message. */
  readonly onReveal?: ((messageId: MessageId) => void) | undefined;
  readonly className?: string;
}

/**
 * Where a conversation stands: the STATUS / VOCÊ / EU block of the last reply,
 * or the live session state when that outranks it. `compact` keeps every
 * field on one line (full text in a tooltip); `inline` sits inside a reply.
 */
export function StatusCard({ view, variant = "default", onReveal, className }: StatusCardProps) {
  const compact = variant === "compact";
  const messageId = view.messageId;
  const reveal =
    onReveal !== undefined && messageId !== null && variant !== "inline"
      ? () => onReveal(messageId)
      : null;
  const revealable = reveal !== null;
  const headline = headlineText(view.headline);
  const valueClass = compact ? "min-w-0 truncate" : "min-w-0 break-words";

  const body = (
    <>
      <FieldLabel>{tc("status card", "Status")}</FieldLabel>
      <span className="flex min-w-0">
        <Badge variant={TONE_BADGE[view.tone]} size="sm" className="min-w-0 max-w-full">
          <span className="truncate">{headline}</span>
        </Badge>
      </span>
      {view.voce ? (
        <>
          <FieldLabel>{tc("status card", "You")}</FieldLabel>
          <span className={valueClass}>{view.voce}</span>
        </>
      ) : null}
      {view.eu ? (
        <>
          <FieldLabel>{tc("status card", "Me")}</FieldLabel>
          <span className={valueClass}>{view.eu}</span>
        </>
      ) : null}
    </>
  );

  const cardClass = statusCardVariants({ variant, interactive: revealable });
  const cardProps = {
    "data-status-card": variant,
    "data-status-tone": view.tone,
  };
  // The compact card hands this element to TooltipTrigger as `render` and the
  // body as children. Base UI spreads the element's props last, so an explicit
  // `children: undefined` here would blank the body: only set it when given.
  const renderCard = (children?: ReactNode) => {
    const props = {
      className: cardClass,
      ...cardProps,
      ...(children === undefined ? {} : { children }),
    };
    return reveal ? <button type="button" onClick={reveal} {...props} /> : <div {...props} />;
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", variant === "inline" && "my-3", className)}>
      {compact ? (
        <Tooltip>
          <TooltipTrigger render={renderCard()}>{body}</TooltipTrigger>
          <TooltipPopup side="bottom">
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
          </TooltipPopup>
        </Tooltip>
      ) : (
        renderCard(body)
      )}
      {revealable ? (
        <span className="text-muted-foreground text-xs">
          {tc("status card", "↑ from the last reply · click to go to it")}
        </span>
      ) : null}
    </div>
  );
}
