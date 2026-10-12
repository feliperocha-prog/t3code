import { CircleCheckIcon } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { t, tc } from "~/i18n";

import { parseReviewFindings, reviewFindingText } from "./reviewFindings.logic";

const SENT_FEEDBACK_MS = 3000;

/** The fix buttons live inside rows that toggle on click and Enter/Space. */
function stopRowToggle(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

function FixButton({ label, onFix }: { label: string; onFix: () => void }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(() => setSent(false), SENT_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [sent]);
  return (
    <Button
      size="xs"
      variant="outline"
      disabled={sent}
      onKeyDown={stopRowToggle}
      onClick={(event) => {
        stopRowToggle(event);
        if (sent) return;
        setSent(true);
        onFix();
      }}
    >
      {sent ? tc("review fix", "Sent") : label}
    </Button>
  );
}

/**
 * A reviewer's report as a checklist: an approval line, or one card per
 * defect with a Fix button that sends the defect back to the AI.
 */
export function ReviewFindingsList({
  result,
  onFix,
}: {
  result: string;
  onFix: (text: string, count: number) => void;
}) {
  const parsed = parseReviewFindings(result);
  if (parsed.kind === "approved") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleCheckIcon aria-hidden className="size-4 shrink-0 text-success-foreground" />
        {t("Reviewer approved")}
      </p>
    );
  }
  const { findings } = parsed;
  if (findings.length === 0) return null;
  const texts = findings.map(reviewFindingText);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium">
          {findings.length === 1
            ? t("Reviewer found 1 defect")
            : t("Reviewer found {count} defects", { count: findings.length })}
        </p>
        {findings.length > 1 ? (
          <FixButton
            label={tc("review fix", "Fix all")}
            onFix={() => onFix(texts.join("\n\n"), findings.length)}
          />
        ) : null}
      </div>
      <ol className="flex flex-col gap-1.5">
        {findings.map((finding, index) => (
          <li
            // Findings have no stable id; the report never reorders once settled.
            // oxlint-disable-next-line react/no-array-index-key
            key={index}
            className="flex items-start gap-2 rounded-md border border-border/60 px-2 py-1.5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="break-words text-xs font-semibold">{finding.title}</p>
              {finding.body ? (
                <p className="line-clamp-6 whitespace-pre-wrap break-words text-2xs text-muted-foreground">
                  {finding.body}
                </p>
              ) : null}
            </div>
            <div className="shrink-0">
              <FixButton
                label={tc("review fix", "Fix")}
                onFix={() => onFix(texts[index] ?? finding.title, 1)}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
