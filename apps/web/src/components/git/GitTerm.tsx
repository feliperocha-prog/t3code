import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";

import {
  gitTermHelp,
  gitTermLabel,
  gitTermSimple,
  gitTermTechnical,
  type GitTermName,
} from "./gitTerms";

export { gitTermLabel, gitTermSimple } from "./gitTerms";

/**
 * A git word in the bilingual vocabulary: the plain word in front, the technical
 * term small and muted beside it, and a one-line explanation on hover.
 * `plain` renders only the "Plain · technical" text, for spots that already own
 * a tooltip or popover and must not stack a second one. `technical` renders only
 * the small technical term with the explanation on hover, for sentences that
 * already say the plain words.
 */
export function GitTerm({
  term,
  variant = "inline",
}: {
  term: GitTermName;
  variant?: "inline" | "plain" | "technical";
}) {
  if (variant === "plain") return <>{gitTermLabel(term)}</>;
  if (variant === "technical") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="shrink-0 font-normal text-muted-foreground text-xs" />}
        >
          {gitTermTechnical(term)}
        </TooltipTrigger>
        <TooltipPopup side="top">{gitTermHelp(term)}</TooltipPopup>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex min-w-0 items-baseline gap-1" />}>
        <span className="truncate">{gitTermSimple(term)}</span>
        <span className="shrink-0 font-normal text-muted-foreground text-xs">
          {gitTermTechnical(term)}
        </span>
      </TooltipTrigger>
      <TooltipPopup side="top">{gitTermHelp(term)}</TooltipPopup>
    </Tooltip>
  );
}
