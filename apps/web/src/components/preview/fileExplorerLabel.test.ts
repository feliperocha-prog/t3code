import { describe, expect, it } from "vite-plus/test";

import {
  revealInFileExplorerLabel,
  revealInFileExplorerLabelForKind,
  revealInFileExplorerLabelForOs,
} from "./fileExplorerLabel";
import { t } from "~/i18n";

describe("revealInFileExplorerLabel", () => {
  it.each([
    ["MacIntel", t("Reveal in Finder")],
    ["Win32", t("Reveal in File Explorer")],
    ["Linux x86_64", t("Reveal in Files")],
  ])("maps %s to %s", (platform, expected) => {
    expect(revealInFileExplorerLabel(platform)).toBe(expected);
  });
});

describe("revealInFileExplorerLabelForOs", () => {
  it.each([
    ["darwin", t("Reveal in Finder")],
    ["windows", t("Reveal in File Explorer")],
    ["linux", t("Reveal in Files")],
    ["unknown", t("Reveal in Files")],
  ] as const)("maps %s to %s", (os, expected) => {
    expect(revealInFileExplorerLabelForOs(os)).toBe(expected);
  });
});

describe("revealInFileExplorerLabelForKind", () => {
  it.each([
    ["finder", t("Reveal in Finder")],
    ["file-explorer", t("Reveal in File Explorer")],
    ["files", t("Reveal in Files")],
  ] as const)("maps %s to %s", (kind, expected) => {
    expect(revealInFileExplorerLabelForKind(kind)).toBe(expected);
  });
});
