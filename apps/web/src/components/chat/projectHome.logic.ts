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
  if (trimmed.length === 0) return defaultStateNotePath(cwd);
  // The note lives inside the vault folder: an absolute path or a ".." segment
  // would escape it (the server refuses the read anyway; this keeps the UI honest).
  const escapes = /^(?:[a-zA-Z]:)?[\\/]/.test(trimmed) || trimmed.split(/[\\/]+/).includes("..");
  return escapes ? defaultStateNotePath(cwd) : trimmed;
}

/** Lines a box shows before it is cut with "…". */
export const PROJECT_HOME_MAX_LINES = 12;

/**
 * Heading text reduced for comparison: no accents, lower case, without any
 * parenthetical group and without trailing punctuation or dates, so
 * `## Estado (30/09)` and `## Estado — 30/09` both match "estado".
 */
export function normalizeHeading(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[\s\d/.,;:!?\-–—]+$/u, "")
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

/** Heading synonyms of each hub block. A heading matches when its normalized title equals one. */
export const HUB_SECTION_SYNONYMS = {
  where: ["estado", "status", "onde estamos"],
  next: [
    "proximo passo",
    "proximos passos",
    "pendente",
    "pendentes",
    "pendencias",
    "a fazer",
    "o que falta",
    "falta",
    "to do",
    "todo",
    "next step",
    "next steps",
  ],
  risks: ["armadilhas", "riscos", "cuidados", "atencao", "pitfalls"],
} as const satisfies Record<string, readonly string[]>;

/** Items each hub block shows. */
export const HUB_ITEM_LIMITS = { where: 3, next: 4, risks: 3 } as const;

/**
 * Body of the first H2 whose normalized title equals one of the synonyms, so
 * `## Estado (02/10)` matches "estado" but `## Estado anterior` does not.
 * Null when the section is missing or empty.
 */
export function findHubSection(markdown: string, synonyms: readonly string[]): string | null {
  const wanted = new Set(synonyms.map(normalizeHeading));
  const section = splitH2Sections(markdown).find((candidate) =>
    wanted.has(normalizeHeading(candidate.title)),
  );
  if (!section) return null;
  const body = trimBlankEdges(section.body.split(/\r?\n/)).join("\n");
  return body.length > 0 ? body : null;
}

/** Longest plain item, in characters, before it is cut with "…". */
export const PLAIN_ITEM_MAX_CHARS = 180;

const LIST_MARKER = /^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/;
const HEADING_MARKER = /^\s{0,3}#{1,6}\s+/;
const RULE = /^\s{0,3}(?:[-*_]\s*){3,}$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|?$/;
const HEX_HASH = /^[0-9a-f]{7,40}$/i;
// A loose commit hash: hex only, with at least one digit and one letter, so words are safe.
const LOOSE_HASH = /(?<![\w/])(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}(?![\w/])/gi;
const FILE_EXTENSION =
  /(?:^\.[\w.-]+|\.(?:[cm]?[jt]sx?|json|md|mdx|ya?ml|toml|lock|css|scss|html|sql|sh|ps1|py|txt|env|local))$/i;

/** Inline code kept as text, or dropped when it is a hash or a file path. */
function plainCode(code: string): string {
  const text = code.trim();
  if (HEX_HASH.test(text)) return "";
  if (/[\\/]/.test(text) || FILE_EXTENSION.test(text)) return "";
  return text;
}

function wikiLinkText(target: string, alias: string | undefined): string {
  if (alias !== undefined && alias.trim().length > 0) return alias;
  const page = target.split("#")[0] ?? target;
  return (page.split(/[\\/]/).at(-1) ?? page).replace(/\.md$/i, "");
}

/** One markdown item reduced to plain text: no markup, links, hashes or file paths. Cut at 180 chars. */
export function toPlainText(text: string): string {
  const plain = text
    .replace(/`+([^`]*?)`+/g, (_match, code: string) => plainCode(code))
    .replace(
      /!?\[\[([^\]|]*)(?:\|([^\]]*))?\]\]/g,
      (_match, target: string, alias: string | undefined) => wikiLinkText(target, alias),
    )
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/(^|[^\w*])\*(?!\s)([^*]+?)\*(?![\w*])/g, "$1$2")
    .replace(/(^|[^\w])_(?!\s)([^_]+?)_(?!\w)/g, "$1$2")
    .replace(LOOSE_HASH, "")
    // Parentheses emptied by the removals above: "( )", "(, x)".
    .replace(/(^|\s)\(\s*[,;]?\s*\)/g, "$1")
    .replace(/\(\s*[,;]\s*/g, "(")
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .trim();
  if (plain.length <= PLAIN_ITEM_MAX_CHARS) return plain;
  return `${plain.slice(0, PLAIN_ITEM_MAX_CHARS - 1).trimEnd()}…`;
}

/**
 * A hub section split into short plain-text items: each list entry or
 * paragraph is one item, headings stand alone, code blocks and rules are
 * dropped, table rows read as their cells joined by "·". First `max` non-empty items.
 */
export function toPlainItems(sectionText: string, max: number): string[] {
  const raw: string[] = [];
  let current: string[] | null = null;
  let fence: string | null = null;
  const close = () => {
    if (current !== null) raw.push(current.join(" "));
    current = null;
  };
  for (const line of sectionText.split(/\r?\n/)) {
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (fence === null) {
        close();
        fence = marker;
      } else if (marker[0] === fence[0] && marker.length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (fence !== null) continue;
    const trimmed = line.trim();
    if (trimmed.length === 0 || RULE.test(line) || /^<!--.*-->$/.test(trimmed)) {
      close();
      continue;
    }
    if (HEADING_MARKER.test(line)) {
      close();
      raw.push(line.replace(HEADING_MARKER, ""));
      continue;
    }
    if (trimmed.startsWith("|")) {
      close();
      if (!TABLE_SEPARATOR.test(trimmed)) {
        const cells = trimmed
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0);
        raw.push(cells.join(" · "));
      }
      continue;
    }
    const content = trimmed.replace(/^>\s?/, "");
    if (LIST_MARKER.test(content)) {
      close();
      current = [content.replace(LIST_MARKER, "")];
    } else if (current !== null) {
      current.push(content);
    } else {
      current = [content];
    }
  }
  close();
  const items: string[] = [];
  for (const item of raw) {
    if (items.length >= max) break;
    const plain = toPlainText(item);
    if (plain.length > 0) items.push(plain);
  }
  return items;
}

export interface HubDigest {
  readonly where: readonly string[];
  readonly next: readonly string[];
  readonly risks: readonly string[];
}

/** The three hub blocks read straight from the note, without the model. */
export function readHubDigest(markdown: string): HubDigest {
  const block = (key: keyof typeof HUB_SECTION_SYNONYMS) => {
    const section = findHubSection(markdown, HUB_SECTION_SYNONYMS[key]);
    return section === null ? [] : toPlainItems(section, HUB_ITEM_LIMITS[key]);
  };
  return { where: block("where"), next: block("next"), risks: block("risks") };
}

/** The sidebar's compact relative time: "5m ago" reads "5m", "just now" reads `nowLabel`. */
export function compactRelativeTimeLabel(label: string, nowLabel: string): string {
  if (label === "just now") return nowLabel;
  return label.endsWith(" ago") ? label.slice(0, -4) : label;
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
