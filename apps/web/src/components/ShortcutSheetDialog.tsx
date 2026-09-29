import { useAtomValue } from "@effect/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { isCommandPaletteOpen } from "../commandPaletteBus";
import { resolveShortcutCommand } from "../keybindings";
import { isEditableFocused } from "../lib/editableFocus";
import { isPreviewFocused } from "../lib/previewFocus";
import { isTerminalFocused } from "../lib/terminalFocus";
import { buildShortcutSheetGroups } from "./ShortcutSheet.logic";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "./ui/dialog";
import { Kbd, KbdGroup } from "./ui/kbd";
import { primaryServerKeybindingsAtom } from "~/state/server";
import { t } from "~/i18n";

const useShortcutSheet = create<{ open: boolean }>(() => ({ open: false }));

/** Opens the keyboard shortcut cheat sheet from anywhere (sidebar, cards). */
export function openShortcutSheet() {
  useShortcutSheet.setState({ open: true });
}

function closeShortcutSheet() {
  useShortcutSheet.setState({ open: false });
}

/**
 * Mounted once at the root. Owns the `help.shortcuts` keybinding so the sheet
 * opens on every route, and renders the dialog while it is open.
 */
export function ShortcutSheetDialogHost() {
  const open = useShortcutSheet((state) => state.open);
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isCommandPaletteOpen()) return;
      const command = resolveShortcutCommand(event, keybindings, {
        context: {
          terminalFocus: isTerminalFocused(),
          previewFocus: isPreviewFocused(),
          editableFocus: isEditableFocused(event.target),
        },
      });
      if (command !== "help.shortcuts") return;
      event.preventDefault();
      event.stopPropagation();
      useShortcutSheet.setState((state) => ({ open: !state.open }));
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [keybindings]);

  return open ? <ShortcutSheetDialog /> : null;
}

function ShortcutSheetDialog() {
  const navigate = useNavigate();
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);
  const groups = useMemo(() => buildShortcutSheetGroups(keybindings), [keybindings]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) closeShortcutSheet();
      }}
    >
      <DialogPopup className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("Keyboard shortcuts")}</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {groups.map((group) => (
              <section key={group.id} className="flex min-w-0 flex-col gap-2">
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {group.heading}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex min-w-0 items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate">{row.label}</span>
                      <KbdGroup className="shrink-0">
                        {row.shortcuts.map((shortcut) => (
                          <Kbd key={shortcut}>{shortcut}</Kbd>
                        ))}
                      </KbdGroup>
                    </li>
                  ))}
                </ul>
                {group.footnote && (
                  <p className="text-muted-foreground text-xs">{group.footnote}</p>
                )}
              </section>
            ))}
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeShortcutSheet();
              void navigate({ to: "/settings/keybindings" });
            }}
          >
            {t("Edit shortcuts")}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
