/**
 * Splits a reviewer's final report into findings the user can act on one by
 * one. The reviewer writes either an approval or a list of defects, each
 * starting with "path:line" or a list marker; anything else is one finding.
 */
export interface ReviewFinding {
  readonly title: string;
  readonly body: string;
}

export type ReviewFindings =
  | { readonly kind: "approved" }
  | { readonly kind: "findings"; readonly findings: ReadonlyArray<ReviewFinding> };

const APPROVED_PATTERN = /(?<![\p{L}\p{N}_])(?:APROVADO|APPROVED|LGTM)(?![\p{L}\p{N}_])/iu;
const NEGATED_PATTERN = /N[ÃA]O APROVADO|REPROVADO|NOT APPROVED/iu;
// Structural markers the reviewer uses for a defect; a plain word like
// "defeito" inside an approval sentence must not flip the verdict.
const DEFECT_PATTERN = /QUEBRA QUANDO:|CORREÇÃO:/iu;
const LOCATION_PATTERN = /^[^\s]+\.(ts|tsx|js|mjs|py|sql|md|html|json|yml|yaml|css|liquid):\d+/;
const MARKER_PATTERN = /^(?:- |\d+\.\s?)/;

function isFindingStart(block: string): boolean {
  return LOCATION_PATTERN.test(block) || MARKER_PATTERN.test(block);
}

function toFinding(block: string): ReviewFinding {
  const [first = "", ...rest] = block.split("\n");
  return {
    title: first.replace(MARKER_PATTERN, "").trim(),
    body: rest.join("\n").trim(),
  };
}

export function parseReviewFindings(result: string): ReviewFindings {
  const text = result.trim();
  // The verdict lives on the first line; the rest is commentary.
  const firstLine = text.split("\n")[0] ?? "";
  if (
    APPROVED_PATTERN.test(firstLine) &&
    !NEGATED_PATTERN.test(firstLine) &&
    !DEFECT_PATTERN.test(text)
  ) {
    return { kind: "approved" };
  }
  const blocks = text
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
  const firstFinding = blocks.findIndex(isFindingStart);
  if (firstFinding === -1) {
    return { kind: "findings", findings: text.length > 0 ? [toFinding(text)] : [] };
  }
  // Blocks before the first finding are preamble. A block after it that does
  // not start a new finding continues the previous one, so no defect text is lost.
  const grouped: string[] = [];
  for (const block of blocks.slice(firstFinding)) {
    if (isFindingStart(block) || grouped.length === 0) grouped.push(block);
    else grouped[grouped.length - 1] += `\n\n${block}`;
  }
  return { kind: "findings", findings: grouped.map(toFinding) };
}

/** The finding as one message: title, then its body. */
export function reviewFindingText(finding: ReviewFinding): string {
  return finding.body ? `${finding.title}\n${finding.body}` : finding.title;
}
