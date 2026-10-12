/**
 * Looks for credentials in the lines a unified diff adds, so a publish can be
 * stopped before a key leaves the machine. Only added lines count: a removed
 * secret is already public, and context lines were published earlier.
 */

export type SecretFindingKind =
  | "aws-access-key"
  | "google-api-key"
  | "sk-api-key"
  | "github-token"
  | "slack-token"
  | "stripe-key"
  | "hubspot-token"
  | "private-key"
  | "jwt"
  | "assignment"
  | "env-file";

export interface SecretFinding {
  readonly path: string;
  /** Line number in the new file, or null when the diff gives no position. */
  readonly line: number | null;
  readonly kind: SecretFindingKind;
  /** At most 80 characters, with the secret itself cut to its first 4 characters. */
  readonly excerpt: string;
}

const EXCERPT_MAX_LENGTH = 80;
const MASK_VISIBLE_CHARS = 4;

const TOKEN_PATTERNS: ReadonlyArray<{ readonly kind: SecretFindingKind; readonly regex: RegExp }> =
  [
    { kind: "aws-access-key", regex: /AKIA[0-9A-Z]{16}/g },
    { kind: "google-api-key", regex: /AIza[0-9A-Za-z_-]{35}/g },
    { kind: "sk-api-key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
    { kind: "github-token", regex: /gh[pousr]_[A-Za-z0-9]{36,}/g },
    { kind: "slack-token", regex: /xox[abpr]-[A-Za-z0-9-]{10,}/g },
    { kind: "stripe-key", regex: /[sr]k_(?:live|test)_[A-Za-z0-9]{16,}/g },
    { kind: "hubspot-token", regex: /pat-[a-z0-9]{2,4}-[0-9a-f-]{30,}/g },
    { kind: "private-key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
    { kind: "jwt", regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./g },
  ];

const ASSIGNMENT_PATTERN =
  /(?:password|passwd|secret|api[_-]?key|token|client[_-]?secret)\s*[:=]\s*["']?([A-Za-z0-9/+_-]{12,})/gi;

// Placeholders that look like assignments but hold no credential.
const PLACEHOLDER_PREFIXES = ["process.env", "${", "<", "your-", "xxx", "example", "changeme"];
const PLACEHOLDER_FRAGMENTS = ["your-", "xxx", "example", "changeme"];

const ENV_FILE_SUFFIXES = [".env", ".env.local", ".env.production"];
const KEY_FILE_PATTERN = /\.(?:pem|key)$/;

const HUNK_HEADER = /^@@ -\d+(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

function isSecretFilePath(path: string): boolean {
  return ENV_FILE_SUFFIXES.some((suffix) => path.endsWith(suffix)) || KEY_FILE_PATTERN.test(path);
}

function isPlaceholderValue(afterSeparator: string, value: string): boolean {
  const raw = afterSeparator.toLowerCase();
  const lowered = value.toLowerCase();
  return (
    PLACEHOLDER_PREFIXES.some((prefix) => raw.startsWith(prefix)) ||
    PLACEHOLDER_FRAGMENTS.some((fragment) => lowered.includes(fragment))
  );
}

function maskedExcerpt(line: string, start: number, end: number): string {
  const secret = line.slice(start, end);
  const masked = `${line.slice(0, start)}${secret.slice(0, MASK_VISIBLE_CHARS)}…${line.slice(end)}`;
  const trimmedStart = masked.length - masked.trimStart().length;
  const text = masked.trim();
  if (text.length <= EXCERPT_MAX_LENGTH) return text;
  // Keep the masked secret in view: open the window a little before it.
  const secretAt = Math.max(0, start - trimmedStart);
  const from = Math.min(Math.max(0, secretAt - 20), text.length - (EXCERPT_MAX_LENGTH - 1));
  const window = text.slice(from, from + EXCERPT_MAX_LENGTH - 1);
  return from > 0 ? `…${window.slice(1)}…` : `${window}…`;
}

function scanAddedLine(path: string, line: number | null, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const pattern of TOKEN_PATTERNS) {
    for (const match of text.matchAll(pattern.regex)) {
      const start = match.index ?? 0;
      findings.push({
        path,
        line,
        kind: pattern.kind,
        excerpt: maskedExcerpt(text, start, start + match[0].length),
      });
    }
  }
  // A recognized token on the line already says everything; the assignment
  // around it would only repeat the same finding.
  if (findings.length > 0) return findings;
  for (const match of text.matchAll(ASSIGNMENT_PATTERN)) {
    const value = match[1] ?? "";
    const matchStart = match.index ?? 0;
    const afterSeparator = text
      .slice(matchStart + match[0].search(/[:=]/) + 1)
      .trimStart()
      .replace(/^["']/, "");
    if (isPlaceholderValue(afterSeparator, value)) continue;
    const valueStart = matchStart + match[0].length - value.length;
    findings.push({
      path,
      line,
      kind: "assignment",
      excerpt: maskedExcerpt(text, valueStart, valueStart + value.length),
    });
  }
  return findings;
}

/** Credentials in the lines `diff` adds, in diff order. */
export function scanDiffForSecrets(diff: string): ReadonlyArray<SecretFinding> {
  const findings: SecretFinding[] = [];
  let path: string | null = null;
  let addedFile = false;
  let newLine: number | null = null;
  let oldRemaining = 0;
  let newRemaining = 0;

  const flagSecretFile = () => {
    if (path !== null && addedFile && isSecretFilePath(path)) {
      findings.push({
        path,
        line: null,
        kind: "env-file",
        excerpt: path.slice(-EXCERPT_MAX_LENGTH),
      });
    }
  };

  for (const rawLine of diff.split("\n")) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    const inHunk = oldRemaining > 0 || newRemaining > 0;

    if (inHunk) {
      if (line.startsWith("+")) {
        newRemaining -= 1;
        if (path !== null) findings.push(...scanAddedLine(path, newLine, line.slice(1)));
        if (newLine !== null) newLine += 1;
      } else if (line.startsWith("-")) {
        oldRemaining -= 1;
      } else if (line.startsWith(" ") || line === "") {
        oldRemaining -= 1;
        newRemaining -= 1;
        if (newLine !== null) newLine += 1;
      }
      continue;
    }

    if (line.startsWith("diff --git ")) {
      flagSecretFile();
      const bPath = line.match(/ b\/(.+)$/)?.[1];
      path = bPath ?? null;
      addedFile = false;
      newLine = null;
      continue;
    }
    if (line.startsWith("new file mode")) {
      addedFile = true;
      continue;
    }
    if (line.startsWith("--- ")) {
      if (line === "--- /dev/null") addedFile = true;
      continue;
    }
    if (line.startsWith("+++ ")) {
      const target = line.slice(4);
      if (target !== "/dev/null") path = target.startsWith("b/") ? target.slice(2) : target;
      continue;
    }
    const hunk = HUNK_HEADER.exec(line);
    if (hunk) {
      oldRemaining = hunk[1] === undefined ? 1 : Number(hunk[1]);
      newLine = Number(hunk[2]);
      newRemaining = hunk[3] === undefined ? 1 : Number(hunk[3]);
    }
  }
  flagSecretFile();
  return findings;
}
