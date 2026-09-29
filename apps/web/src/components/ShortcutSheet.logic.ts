import {
  THREAD_JUMP_KEYBINDING_COMMANDS,
  type KeybindingCommand,
  type ResolvedKeybindingsConfig,
} from "@t3tools/contracts";

import { t } from "~/i18n";
import { formatShortcutLabel } from "../keybindings";
import { commandLabel } from "./settings/KeybindingsSettings.logic";

export type ShortcutSheetGroupId = "conversation" | "tabs" | "terminal" | "files" | "other";

export interface ShortcutSheetRow {
  /** The command, or "thread.jump" for the collapsed 1–9 row. */
  readonly id: string;
  readonly label: string;
  /** One formatted chip per binding, in keybinding order. */
  readonly shortcuts: ReadonlyArray<string>;
}

export interface ShortcutSheetGroup {
  readonly id: ShortcutSheetGroupId;
  readonly heading: string;
  readonly footnote: string | null;
  readonly rows: ReadonlyArray<ShortcutSheetRow>;
}

type CuratedEntry =
  | { readonly command: KeybindingCommand; readonly label: () => string }
  | { readonly command: "thread.jump"; readonly label: () => string };

interface CuratedGroup {
  readonly id: Exclude<ShortcutSheetGroupId, "other">;
  readonly heading: () => string;
  readonly footnote?: () => string;
  readonly entries: ReadonlyArray<CuratedEntry>;
}

const THREAD_JUMP_ROW_ID = "thread.jump";

const CURATED_GROUPS: ReadonlyArray<CuratedGroup> = [
  {
    id: "conversation",
    heading: () => t("Conversation"),
    entries: [
      { command: "chat.new", label: () => t("New conversation") },
      { command: "chat.newLocal", label: () => t("New conversation in the current project") },
      { command: "thread.previous", label: () => t("Previous conversation") },
      { command: "thread.next", label: () => t("Next conversation") },
      { command: THREAD_JUMP_ROW_ID, label: () => t("Go to conversation 1–9") },
      { command: "thread.pin", label: () => t("Pin or unpin conversation") },
      { command: "thread.undo", label: () => t("Undo the last conversation action") },
      { command: "modelPicker.toggle", label: () => t("Change model") },
      { command: "commandPalette.toggle", label: () => t("Command palette (search everything)") },
    ],
  },
  {
    id: "tabs",
    heading: () => t("Tabs"),
    entries: [
      { command: "tabs.next", label: () => t("Next tab") },
      { command: "tabs.previous", label: () => t("Previous tab") },
    ],
  },
  {
    id: "terminal",
    heading: () => t("Terminal"),
    footnote: () => t("Split, new and close work with the terminal focused."),
    entries: [
      { command: "terminal.toggle", label: () => t("Open/close the terminal") },
      { command: "terminal.new", label: () => t("New terminal") },
      { command: "terminal.split", label: () => t("Split terminal") },
      { command: "terminal.splitVertical", label: () => t("Split terminal vertically") },
      { command: "terminal.close", label: () => t("Close terminal") },
    ],
  },
  {
    id: "files",
    heading: () => t("Files"),
    footnote: () => t("Works with lines selected in an open file."),
    entries: [
      { command: "filePicker.toggle", label: () => t("Open a file") },
      { command: "projectSearch.toggle", label: () => t("Search text in files") },
      { command: "diff.toggle", label: () => t("See what the agent changed") },
      { command: "rightPanel.toggle", label: () => t("Side panel") },
      { command: "editor.openFavorite", label: () => t("Open in editor") },
      {
        command: "fileViewer.requestChange",
        label: () => t("Ask for a change in the selected lines"),
      },
    ],
  },
];

const CURATED_COMMANDS: ReadonlySet<string> = new Set([
  ...CURATED_GROUPS.flatMap((group) => group.entries.map((entry) => entry.command)),
  ...THREAD_JUMP_KEYBINDING_COMMANDS,
]);

/**
 * Groups every bound command for the keyboard shortcut cheat sheet. Reads the
 * resolved keybindings directly, so user customizations win and a command with
 * several bindings shows all of them; unbound commands are left out.
 */
export function buildShortcutSheetGroups(
  keybindings: ResolvedKeybindingsConfig,
  platform: string = navigator.platform,
): ReadonlyArray<ShortcutSheetGroup> {
  const shortcutsByCommand = new Map<string, Array<string>>();
  for (const binding of keybindings) {
    const label = formatShortcutLabel(binding.shortcut, platform);
    const labels = shortcutsByCommand.get(binding.command);
    if (!labels) {
      shortcutsByCommand.set(binding.command, [label]);
    } else if (!labels.includes(label)) {
      labels.push(label);
    }
  }

  const groups: Array<ShortcutSheetGroup> = [];
  for (const group of CURATED_GROUPS) {
    const rows: Array<ShortcutSheetRow> = [];
    for (const entry of group.entries) {
      const shortcuts =
        entry.command === THREAD_JUMP_ROW_ID
          ? threadJumpShortcuts(shortcutsByCommand)
          : (shortcutsByCommand.get(entry.command) ?? []);
      if (shortcuts.length > 0) {
        rows.push({ id: entry.command, label: entry.label(), shortcuts });
      }
    }
    if (rows.length > 0) {
      groups.push({
        id: group.id,
        heading: group.heading(),
        footnote: group.footnote?.() ?? null,
        rows,
      });
    }
  }

  const otherRows = [...shortcutsByCommand]
    .filter(([command]) => !CURATED_COMMANDS.has(command))
    .map(([command, shortcuts]) => ({
      id: command,
      label: commandLabel(command as KeybindingCommand),
      shortcuts,
    }))
    .toSorted((left, right) => left.label.localeCompare(right.label));
  if (otherRows.length > 0) {
    groups.push({ id: "other", heading: t("Other"), footnote: null, rows: otherRows });
  }
  return groups;
}

/** The nine jump bindings read as one range chip: first and last bound label. */
function threadJumpShortcuts(
  shortcutsByCommand: ReadonlyMap<string, ReadonlyArray<string>>,
): ReadonlyArray<string> {
  const bound = THREAD_JUMP_KEYBINDING_COMMANDS.flatMap((command) => {
    const first = shortcutsByCommand.get(command)?.[0];
    return first === undefined ? [] : [first];
  });
  const first = bound[0];
  const last = bound.at(-1);
  if (first === undefined || last === undefined) return [];
  return [first === last ? first : `${first}…${last}`];
}
