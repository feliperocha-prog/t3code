import type { ReactNode } from "react";

import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";

import { termHelp, termLabel, termSimple, termTechnical, type TermName } from "./terms";

/**
 * A technical word with a one-line explanation on hover.
 * `inline` shows the plain word in front and the technical term small beside it.
 * `plain` renders only the "Plain · technical" text, for spots that already own
 * a tooltip or popover and must not stack a second one. `technical` renders only
 * the small technical term, for sentences that already say the plain words.
 * `hint` keeps the text already on screen (`children`, else the technical term)
 * and marks it with a dotted underline that explains it on hover.
 */
export function Term({
  term,
  variant = "inline",
  children,
}: {
  term: TermName;
  variant?: "inline" | "plain" | "technical" | "hint";
  children?: ReactNode;
}) {
  if (variant === "plain") return <>{termLabel(term)}</>;
  if (variant === "hint") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="cursor-help underline decoration-dotted decoration-muted-foreground/60 underline-offset-2" />
          }
        >
          {children ?? termTechnical(term)}
        </TooltipTrigger>
        <TooltipPopup side="top">{termHelp(term)}</TooltipPopup>
      </Tooltip>
    );
  }
  if (variant === "technical") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="shrink-0 font-normal text-muted-foreground text-xs" />}
        >
          {termTechnical(term)}
        </TooltipTrigger>
        <TooltipPopup side="top">{termHelp(term)}</TooltipPopup>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex min-w-0 items-baseline gap-1" />}>
        <span className="truncate">{termSimple(term)}</span>
        <span className="shrink-0 font-normal text-muted-foreground text-xs">
          {termTechnical(term)}
        </span>
      </TooltipTrigger>
      <TooltipPopup side="top">{termHelp(term)}</TooltipPopup>
    </Tooltip>
  );
}
