import { parseDiffFromFile } from "@pierre/diffs";

/** An inclusive, 1-based line range on the current side of a file. */
export interface FileAgentChangeRange {
  startLine: number;
  endLine: number;
}

/**
 * Lines of `current` that were added or modified since `snapshot`, the file as
 * it was when a change request was sent. Pure deletions leave nothing to tint
 * on the current side, so they produce no range.
 */
export function fileAgentChangeRanges(
  name: string,
  snapshot: string,
  current: string,
): FileAgentChangeRange[] {
  if (snapshot === current) return [];
  const diff = parseDiffFromFile({ name, contents: snapshot }, { name, contents: current });
  const ranges: FileAgentChangeRange[] = [];
  for (const hunk of diff.hunks) {
    for (const content of hunk.hunkContent) {
      if (content.type !== "change" || content.additions === 0) continue;
      // Diffs built from full contents index `additionLines` over the whole new file.
      const startLine = content.additionLineIndex + 1;
      ranges.push({ startLine, endLine: startLine + content.additions - 1 });
    }
  }
  return ranges;
}

export function isLineInFileAgentChangeRanges(
  ranges: ReadonlyArray<FileAgentChangeRange>,
  line: number,
): boolean {
  return ranges.some((range) => line >= range.startLine && line <= range.endLine);
}
