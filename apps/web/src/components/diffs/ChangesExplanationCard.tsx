import { t } from "~/i18n";

import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { riskTone } from "./changesExplanation.logic";
import type { ChangesExplanationState } from "./useChangesExplanation";

export interface ChangesExplanationCardProps {
  readonly explanation: ChangesExplanationState;
  /** True when the changes on screen are newer than the ones explained. */
  readonly stale: boolean;
  readonly onRedo: () => void;
  readonly onClose: () => void;
}

/** Plain-language explanation of the changes, shown above the file list of the diff panel. */
export function ChangesExplanationCard({
  explanation,
  stale,
  onRedo,
  onClose,
}: ChangesExplanationCardProps) {
  const { data, isPending, error } = explanation;

  return (
    <section
      aria-label={t("What changed")}
      className="max-h-[45%] shrink-0 overflow-auto border-b border-border/70 bg-muted/30 px-3 py-2.5 text-xs"
    >
      <h3 className="mb-1.5 text-sm font-medium text-foreground">{t("What changed")}</h3>
      {data === null ? (
        isPending ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Spinner size="sm" tone="muted" />
            {t("Reading the changes…")}
          </p>
        ) : error !== null ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-error/80">{error}</p>
            <Button size="xs" variant="outline" onClick={onRedo}>
              {t("Try again")}
            </Button>
          </div>
        ) : null
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.truncated ? (
            <p className="text-2xs text-muted-foreground">
              {t("The patch was large; the explanation covers only the beginning.")}
            </p>
          ) : null}
          {stale ? (
            <p className="text-2xs text-warning-foreground">
              {t("The changes on screen are newer than this explanation.")}
            </p>
          ) : null}
          {error !== null ? <p className="text-error/80">{error}</p> : null}
          {data.summary.length > 0 ? (
            <p className="leading-relaxed text-foreground/90">{data.summary}</p>
          ) : null}
          {data.files.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {data.files.map((file, index) => {
                const tone = riskTone(file.risk);
                return (
                  <li key={`${index}:${file.path}`} className="flex items-start gap-2">
                    <span
                      role="img"
                      aria-label={tone.label}
                      title={tone.label}
                      className={`mt-1 size-2 shrink-0 rounded-full ${tone.dotClassName}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-2xs text-muted-foreground">
                        {file.path}
                      </p>
                      <p className="text-foreground/90">{file.what}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {data.attention.length > 0 ? (
            <div>
              <p className="mb-1 font-medium text-foreground">{t("Worth testing by hand")}</p>
              <ul className="list-disc space-y-0.5 ps-4 text-foreground/90">
                {data.attention.map((item, index) => (
                  <li key={`${index}:${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {isPending ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Spinner size="sm" tone="muted" />
              {t("Reading the changes…")}
            </p>
          ) : null}
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-1.5">
        {data !== null ? (
          <Button size="xs" variant="outline" disabled={isPending} onClick={onRedo}>
            {t("Redo")}
          </Button>
        ) : null}
        <Button size="xs" variant="ghost" onClick={onClose}>
          {t("Close")}
        </Button>
      </div>
    </section>
  );
}
