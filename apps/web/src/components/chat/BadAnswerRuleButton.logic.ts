const FENCE_LINE = /^\s*(?:```|~~~)/;
// Inline code spans are kept verbatim (minus the backticks); emphasis is only
// stripped outside them so `snake_case` or `**kwargs` survive.
const INLINE_CODE = /(`+[^`]*?`+)/;

// `__bold__` is left as-is on purpose: it has the same shape as `__dirname__`
// or `__init__.py`, and a raw marker is better than a mangled identifier.
function stripEmphasis(text: string): string {
  return text
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, "$1")
    .replace(/(^|[^\w*])\*(?=\S)([^*]+?)(?<=\S)\*(?![\w*])/g, "$1$2")
    .replace(/(^|[^\w])_(?=\S)([^_]+?)(?<=\S)_(?!\w)/g, "$1$2");
}

// Links and images keep only their visible text: [a doc](url) -> "a doc".
function stripLinks(text: string): string {
  return text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
}

function stripProseLine(line: string): string {
  const withoutMarker = line.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
  return withoutMarker
    .split(INLINE_CODE)
    .map((part, index) => (index % 2 === 1 ? part : stripEmphasis(stripLinks(part))))
    .join("")
    .replace(/`+/g, "");
}

/**
 * Turns a markdown answer into a one-paragraph plain-text quote: drops code
 * fences (keeping their content), inline backticks, link/image syntax, emphasis
 * markers, heading hashes and list markers, collapses whitespace, then truncates to `max`.
 */
export function plainTextExcerpt(answerText: string, max: number): string {
  const lines: string[] = [];
  let inFence = false;
  for (const line of answerText.split(/\r?\n/)) {
    if (FENCE_LINE.test(line)) {
      inFence = !inFence;
      continue;
    }
    lines.push(inFence ? line : stripProseLine(line));
  }
  const plain = lines.join(" ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
}
