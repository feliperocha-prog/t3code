/**
 * Pure helpers for the project home: where the project's state note lives in
 * the vault, and which parts of the note and the README it shows.
 */

/** Last path segment of a workspace root, for either separator style. */
export function projectFolderName(cwd: string): string {
  const segments = cwd.split(/[\\/]+/).filter((segment) => segment.length > 0);
  return segments.at(-1) ?? "";
}

/** The state note path used when the project does not set one. */
export function defaultStateNotePath(cwd: string): string {
  return `Projetos/${projectFolderName(cwd)}/HUB.md`;
}

/** The configured note path, or the default one when the setting is empty. */
export function resolveStateNotePath(cwd: string, configured: string): string {
  const trimmed = configured.trim();
  return trimmed.length > 0 ? trimmed : defaultStateNotePath(cwd);
}

/** Lines a box shows before it is cut with "…". */
export const PROJECT_HOME_MAX_LINES = 12;

/**
 * Heading text reduced for comparison: no accents, lower case, and without a
 * trailing parenthetical, so `## Estado (30/09)` matches "estado".
 */
export function normalizeHeading(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MarkdownSection {
  readonly title: string;
  readonly body: string;
}

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const H1_OR_H2 = /^\s{0,3}(#{1,2})\s+(.*?)\s*#*\s*$/;

/** Every H2 of a markdown document with its body (up to the next H1 or H2). Fenced code is skipped. */
export function splitH2Sections(markdown: string): MarkdownSection[] {
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;
  let fence: string | null = null;
  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (fence === null) {
        fence = marker;
      } else if (marker[0] === fence[0] && marker.length >= fence.length) {
        fence = null;
      }
      current?.lines.push(line);
      continue;
    }
    const heading = fence === null ? H1_OR_H2.exec(line) : null;
    if (heading) {
      current = heading[1] === "##" ? { title: heading[2] ?? "", lines: [] } : null;
      if (current) sections.push(current);
      continue;
    }
    current?.lines.push(line);
  }
  return sections.map((section) => ({ title: section.title, body: section.lines.join("\n") }));
}

/**
 * Body of the first H2 whose normalized title equals the wanted one, cut to
 * the box size. Null when the section is missing or empty.
 */
export function findH2Section(markdown: string, title: string): string | null {
  const wanted = normalizeHeading(title);
  const section = splitH2Sections(markdown).find(
    (candidate) => normalizeHeading(candidate.title) === wanted,
  );
  return section ? clipSectionBody(section.body) : null;
}

const RUN_HEADING = /rodar|run|dev|deploy|publicar|start/i;

/** README / AGENTS sections about running or shipping, joined under bold titles. Null when none match. */
export function findRunSections(markdown: string): string | null {
  const parts = splitH2Sections(markdown)
    .filter((section) => RUN_HEADING.test(normalizeHeading(section.title)))
    .map((section) => {
      const body = trimBlankEdges(section.body.split(/\r?\n/)).join("\n");
      return body.length > 0 ? `**${section.title}**\n\n${body}` : `**${section.title}**`;
    });
  return parts.length > 0 ? clipSectionBody(parts.join("\n\n")) : null;
}

function trimBlankEdges(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start]!.trim().length === 0) start += 1;
  while (end > start && lines[end - 1]!.trim().length === 0) end -= 1;
  return lines.slice(start, end);
}

/**
 * Blank edges trimmed; past the line limit the body keeps its first lines and
 * ends with "…", closing a code fence the cut left open. Null when empty.
 */
export function clipSectionBody(body: string, maxLines = PROJECT_HOME_MAX_LINES): string | null {
  const lines = trimBlankEdges(body.split(/\r?\n/));
  if (lines.length === 0) return null;
  if (lines.length <= maxLines) return lines.join("\n");
  const kept = lines.slice(0, maxLines);
  let fence: string | null = null;
  for (const line of kept) {
    const fenceMatch = FENCE.exec(line);
    if (!fenceMatch) continue;
    const marker = fenceMatch[1]!;
    if (fence === null) fence = marker;
    else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
  }
  if (fence !== null) kept.push(fence);
  kept.push("…");
  return kept.join("\n");
}
