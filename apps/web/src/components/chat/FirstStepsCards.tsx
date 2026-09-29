import { useAtomValue } from "@effect/atom-react";
import type { KeybindingCommand } from "@t3tools/contracts";
import { FileSearchIcon, KeyboardIcon, TerminalIcon, TextSearchIcon } from "lucide-react";
import { memo, type ComponentType } from "react";

import { openCommandPalette } from "../../commandPaletteBus";
import { shortcutLabelForCommand } from "../../keybindings";
import { cn } from "../../lib/utils";
import { dispatchTerminalAction } from "../../terminalActionBus";
import { openShortcutSheet } from "../ShortcutSheetDialog";
import { Kbd } from "../ui/kbd";
import { primaryServerKeybindingsAtom } from "~/state/server";
import { t } from "~/i18n";

interface FirstStepCard {
  readonly id: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly title: string;
  readonly hint: string;
  readonly command: KeybindingCommand;
  readonly run: () => void;
}

/**
 * Starter actions under the empty new-conversation composer. Each card runs
 * its action right away and shows the shortcut that does the same.
 */
export const FirstStepsCards = memo(function FirstStepsCards({
  terminalAvailable,
}: {
  /** The terminal needs a project to open in. */
  terminalAvailable: boolean;
}) {
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);
  const cards: ReadonlyArray<FirstStepCard> = [
    ...(terminalAvailable
      ? [
          {
            id: "terminal",
            icon: TerminalIcon,
            title: t("Open the terminal"),
            hint: t("Run commands in the project"),
            command: "terminal.toggle",
            run: () => dispatchTerminalAction("open"),
          } satisfies FirstStepCard,
        ]
      : []),
    {
      id: "search",
      icon: TextSearchIcon,
      title: t("Search in a file"),
      hint: t("Find text in any file"),
      command: "projectSearch.toggle",
      run: () => openCommandPalette({ mode: "content" }),
    },
    {
      id: "files",
      icon: FileSearchIcon,
      title: t("Open a file"),
      hint: t("Jump straight to a file by name"),
      command: "filePicker.toggle",
      run: () => openCommandPalette({ mode: "files" }),
    },
    {
      id: "shortcuts",
      icon: KeyboardIcon,
      title: t("See all shortcuts"),
      hint: t("The cheat sheet with every shortcut"),
      command: "help.shortcuts",
      run: openShortcutSheet,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2",
        cards.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3",
      )}
    >
      {cards.map((card) => {
        const shortcut = shortcutLabelForCommand(keybindings, card.command);
        return (
          <button
            key={card.id}
            type="button"
            onClick={card.run}
            className="flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg border border-border/60 p-3 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center justify-between gap-2">
              <card.icon className="size-4 shrink-0" />
              {shortcut ? <Kbd>{shortcut}</Kbd> : null}
            </span>
            <span className="truncate font-medium text-foreground text-sm">{card.title}</span>
            <span className="line-clamp-2 text-xs">{card.hint}</span>
          </button>
        );
      })}
    </div>
  );
});
