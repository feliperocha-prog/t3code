const FENCE_LINE = /^\s*(?:```|~~~)/;
// Inline code spans are kept verbatim (minus the backticks); emphasis is only
// stripped outside them so `snake_case` or `**kwargs` survive.
const INLINE_CODE = /(`+[^`]*?`+)/;

function stripEmphasis(text: string): string {
  return text
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, "$2")
    .replace(/(^|[^\w*])\*(?=\S)([^*]+?)(?<=\S)\*(?![\w*])/g, "$1$2")
    .replace(/(^|[^\w])_(?=\S)([^_]+?)(?<=\S)_(?!\w)/g, "$1$2");
}

function stripProseLine(line: string): string {
  const withoutMarker = line.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
  return withoutMarker
    .split(INLINE_CODE)
    .map((part, index) => (index % 2 === 1 ? part : stripEmphasis(part)))
    .join("")
    .replace(/`+/g, "");
}

/**
 * Turns a markdown answer into a one-paragraph plain-text quote: drops code
 * fences (keeping their content), inline backticks, emphasis markers, heading
 * hashes and list markers, collapses whitespace, then truncates to `max`.
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
