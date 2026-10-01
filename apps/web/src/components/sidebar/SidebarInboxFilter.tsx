/**
 * Inbox chips above the thread list: Tudo · Esperando você · Trabalhando ·
 * Acabou. Controlled — the sidebar owns the persisted value and applies it.
 *
 * Exactly one chip is always pressed: an empty change (pressing the active
 * chip again) is ignored. The waiting counter shows only on "Esperando você"
 * and only when something is waiting; the caller computes it within the
 * current project scope.
 */
import { Badge } from "~/components/ui/badge";
import { Toggle, ToggleGroup } from "~/components/ui/toggle-group";
import { tc } from "~/i18n";
import { isSidebarInboxFilter, type SidebarInboxFilter as InboxFilter } from "~/uiStateStore";

const CHIPS: readonly { readonly value: InboxFilter; readonly label: string }[] = [
  { value: "tudo", label: "All" },
  { value: "esperando", label: "Waiting for you" },
  { value: "trabalhando", label: "Working" },
  { value: "acabou", label: "Done" },
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
        className="flex-wrap"
        variant="default"
        size="segmented"
        value={[value]}
        onValueChange={(next) => {
          const chosen = next[0];
          if (isSidebarInboxFilter(chosen) && chosen !== value) onValueChange(chosen);
        }}
      >
        {CHIPS.map((chip) => (
          <Toggle key={chip.value} value={chip.value} variant="pill">
            {tc("sidebar inbox", chip.label)}
            {chip.value === "esperando" && waitingCount > 0 ? (
              <Badge variant="warning" size="sm">
                {waitingCount}
              </Badge>
            ) : null}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
