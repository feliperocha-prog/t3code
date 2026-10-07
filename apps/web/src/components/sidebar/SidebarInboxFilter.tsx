/**
 * Inbox filter above the thread list: Tudo · Pra você · Rodando · Prontas.
 * One segmented row that never wraps; each button's title spells out the
 * full name. Controlled — the sidebar owns the persisted value and applies it.
 *
 * Exactly one button is always pressed: an empty change (pressing the active
 * one again) is ignored. The waiting counter shows only on "Pra você" and only
 * when something is waiting; the caller computes it within the current
 * project scope.
 */
import { Toggle, ToggleGroup } from "~/components/ui/toggle-group";
import { tc } from "~/i18n";
import { isSidebarInboxFilter, type SidebarInboxFilter as InboxFilter } from "~/uiStateStore";

const CHIPS: readonly {
  readonly value: InboxFilter;
  readonly label: string;
  readonly title: string;
}[] = [
  { value: "tudo", label: "All", title: "All — every conversation" },
  {
    value: "esperando",
    label: "For you",
    title: "Waiting for you — conversations that need something from you",
  },
  { value: "trabalhando", label: "Running", title: "Working — conversations running right now" },
  { value: "acabou", label: "Ready", title: "Done — finished conversations" },
];

export function SidebarInboxFilter(props: {
  readonly value: InboxFilter;
  readonly onValueChange: (value: InboxFilter) => void;
  readonly waitingCount: number;
}) {
  const { value, onValueChange, waitingCount } = props;
  return (
    <div className="px-2 pt-1.5">
      <ToggleGroup
        aria-label={tc("sidebar inbox", "Filter threads by status")}
        className="w-full"
        variant="segmented"
        size="compact"
        value={[value]}
        onValueChange={(next) => {
          const chosen = next[0];
          if (isSidebarInboxFilter(chosen) && chosen !== value) onValueChange(chosen);
        }}
      >
        {CHIPS.map((chip) => (
          <Toggle
            key={chip.value}
            value={chip.value}
            className="min-w-0 flex-auto"
            title={tc("sidebar inbox", chip.title)}
          >
            <span className="min-w-0 truncate text-xs">
              {tc("sidebar inbox short", chip.label)}
              {chip.value === "esperando" && waitingCount > 0 ? (
                <span className="ms-1 font-medium text-warning-foreground tabular-nums">
                  {waitingCount}
                </span>
              ) : null}
            </span>
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
