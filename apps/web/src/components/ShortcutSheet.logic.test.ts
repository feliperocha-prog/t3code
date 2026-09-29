import { describe, expect, it } from "vite-plus/test";
import {
  compileResolvedKeybindingsConfig,
  DEFAULT_RESOLVED_KEYBINDINGS,
} from "@t3tools/shared/keybindings";

import { buildShortcutSheetGroups } from "./ShortcutSheet.logic";

const PLATFORM = "Win32";

function rowsById(groups: ReturnType<typeof buildShortcutSheetGroups>) {
  return new Map(groups.flatMap((group) => group.rows.map((row) => [row.id, row] as const)));
}

describe("buildShortcutSheetGroups", () => {
  it("groups the default bindings in sheet order, leftovers under Other", () => {
    const groups = buildShortcutSheetGroups(DEFAULT_RESOLVED_KEYBINDINGS, PLATFORM);

    expect(groups.map((group) => group.id)).toEqual([
      "conversation",
      "tabs",
      "terminal",
      "files",
      "other",
    ]);
    expect(groups.find((group) => group.id === "tabs")?.rows.map((row) => row.id)).toEqual([
      "tabs.next",
      "tabs.previous",
    ]);
    const otherIds = groups.find((group) => group.id === "other")?.rows.map((row) => row.id);
    expect(otherIds).toContain("help.shortcuts");
    expect(otherIds).toContain("usage.open");
    expect(otherIds).not.toContain("chat.new");
    expect(groups.find((group) => group.id === "terminal")?.footnote).not.toBeNull();
    const files = groups.find((group) => group.id === "files");
    expect(files?.rows.map((row) => row.id)).toContain("fileViewer.requestChange");
    expect(files?.footnote).not.toBeNull();
    expect(otherIds).not.toContain("fileViewer.requestChange");
  });

  it("shows the file viewer change request on Ctrl+I", () => {
    const rows = rowsById(buildShortcutSheetGroups(DEFAULT_RESOLVED_KEYBINDINGS, PLATFORM));

    expect(rows.get("fileViewer.requestChange")?.shortcuts).toEqual(["Ctrl+I"]);
  });

  it("shows every binding of a command", () => {
    const rows = rowsById(buildShortcutSheetGroups(DEFAULT_RESOLVED_KEYBINDINGS, PLATFORM));

    expect(rows.get("chat.new")?.shortcuts).toEqual(["Ctrl+N", "Ctrl+Shift+O"]);
  });

  it("omits commands without a binding and groups left empty", () => {
    const groups = buildShortcutSheetGroups(
      compileResolvedKeybindingsConfig([
        { key: "mod+j", command: "terminal.toggle" },
        { key: "mod+shift+?", command: "help.shortcuts" },
      ]),
      PLATFORM,
    );

    expect(groups.map((group) => [group.id, group.rows.map((row) => row.id)])).toEqual([
      ["terminal", ["terminal.toggle"]],
      ["other", ["help.shortcuts"]],
    ]);
  });

  it("collapses the nine thread jumps into one range row", () => {
    const rows = rowsById(buildShortcutSheetGroups(DEFAULT_RESOLVED_KEYBINDINGS, PLATFORM));

    expect(rows.get("thread.jump")?.shortcuts).toEqual(["Ctrl+1…Ctrl+9"]);
    expect([...rows.keys()].some((id) => id.startsWith("thread.jump."))).toBe(false);
  });
});
