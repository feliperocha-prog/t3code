import { useAtomValue } from "@effect/atom-react";

import { undoLatestThreadAction, useThreadUndoNotice } from "../../hooks/showThreadUndoNotice";
import { shortcutLabelForCommand } from "../../keybindings";
import { primaryServerKeybindingsAtom } from "../../state/server";
import { Alert, AlertDescription } from "../ui/alert";
import { InlineButton } from "../ui/button";
import { t } from "~/i18n";

type UndoNoticeAction = "Settled" | "Snoozed" | "Unpinned" | "Archived";

function undoNoticeLabel(action: UndoNoticeAction, count: number): string {
  const one = count === 1;
  switch (action) {
    case "Settled":
      return one ? t("Settled {count} thread", { count }) : t("Settled {count} threads", { count });
    case "Snoozed":
      return one ? t("Snoozed {count} thread", { count }) : t("Snoozed {count} threads", { count });
    case "Unpinned":
      return one
        ? t("Unpinned {count} thread", { count })
        : t("Unpinned {count} threads", { count });
    case "Archived":
      return one
        ? t("Archived {count} thread", { count })
        : t("Archived {count} threads", { count });
  }
}

export function SidebarThreadUndoNotice() {
  const notice = useThreadUndoNotice((state) => state.notice);
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);

  if (!notice) return null;
  const shortcut = shortcutLabelForCommand(keybindings, "thread.undo");

  return (
    <Alert role="status" variant="sidebar">
      <AlertDescription>
        {undoNoticeLabel(notice.action, notice.count)},{" "}
        <InlineButton onClick={undoLatestThreadAction}>
          {shortcut ? t("{shortcut} to undo", { shortcut }) : t("Undo")}
        </InlineButton>
      </AlertDescription>
    </Alert>
  );
}
