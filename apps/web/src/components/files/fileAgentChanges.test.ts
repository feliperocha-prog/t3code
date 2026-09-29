import { describe, expect, it } from "vite-plus/test";

import { fileAgentChangeRanges, isLineInFileAgentChangeRanges } from "./fileAgentChanges";

const lines = (...values: string[]) => `${values.join("\n")}\n`;

describe("fileAgentChangeRanges", () => {
  it("marks modified lines on the current side", () => {
    const snapshot = lines("a", "b", "c", "d", "e");
    const current = lines("a", "B", "C", "d", "e");
    expect(fileAgentChangeRanges("src/app.ts", snapshot, current)).toEqual([
      { startLine: 2, endLine: 3 },
    ]);
  });

  it("marks added lines, including separate additions", () => {
    const snapshot = lines("a", "b", "c", "d", "e", "f", "g", "h", "i", "j");
    const current = lines("a", "new1", "b", "c", "d", "e", "f", "g", "h", "i", "j", "new2", "new3");
    expect(fileAgentChangeRanges("src/app.ts", snapshot, current)).toEqual([
      { startLine: 2, endLine: 2 },
      { startLine: 12, endLine: 13 },
    ]);
  });

  it("returns nothing for a deletion-only change", () => {
    const snapshot = lines("a", "b", "c", "d");
    const current = lines("a", "d");
    expect(fileAgentChangeRanges("src/app.ts", snapshot, current)).toEqual([]);
  });

  it("returns nothing for identical content", () => {
    const contents = lines("a", "b", "c");
    expect(fileAgentChangeRanges("src/app.ts", contents, contents)).toEqual([]);
  });
});

describe("isLineInFileAgentChangeRanges", () => {
  it("checks inclusive range bounds", () => {
    const ranges = [{ startLine: 2, endLine: 3 }];
    expect(isLineInFileAgentChangeRanges(ranges, 1)).toBe(false);
    expect(isLineInFileAgentChangeRanges(ranges, 2)).toBe(true);
    expect(isLineInFileAgentChangeRanges(ranges, 3)).toBe(true);
    expect(isLineInFileAgentChangeRanges(ranges, 4)).toBe(false);
  });
});
