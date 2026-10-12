/**
 * "Did we talk about this?": parses the output of the local conversation search
 * script (`buscar-conversa.js`) into rows, and builds the shell command that runs it.
 *
 * The header of each block looks like
 *   ■ 2026-09-22 → 2026-09-23 · OneDrive-Documentos-Projetos-x · 7f3a…-uuid
 * Parsing anchors on the ASCII parts (dates, uuid, `Felipe:`/`Claude:`) so a
 * mangled console encoding of `■`, `·` or `→` still yields results.
 */

export const PAST_CONVERSATIONS_MAX_RESULTS = 8;

export interface PastConversation {
  readonly startDate: string;
  readonly endDate: string | null;
  readonly projectDir: string;
  readonly sessionId: string;
  readonly firstMessage: string | null;
  readonly excerpts: ReadonlyArray<string>;
}

const DATE = String.raw`\d{4}-\d{2}-\d{2}`;
const UUID = String.raw`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`;
const HEADER_PATTERN = new RegExp(
  String.raw`^\S*\s*(${DATE})(?:\s+\S+\s+(${DATE}))?\s+\S+\s+(.*?)\s+\S+\s+(${UUID})\s*$`,
);
const EXCERPT_PATTERN = /^(Felipe|Claude):\s*/;
// "1ª msg:" — matched loosely so a broken "ª" still works.
const FIRST_MESSAGE_PATTERN = /^1\S*\s*msg:\s*/i;

function parseBlock(lines: ReadonlyArray<string>): PastConversation | null {
  const [header, ...body] = lines;
  const match = header === undefined ? null : HEADER_PATTERN.exec(header.trim());
  if (!match) return null;
  const [, startDate = "", endDate, projectDir = "", sessionId = ""] = match;
  let firstMessage: string | null = null;
  const excerpts: string[] = [];
  for (const raw of body) {
    const line = raw.trim();
    if (line.length === 0) continue;
    if (EXCERPT_PATTERN.test(line)) {
      excerpts.push(line);
    } else if (firstMessage === null) {
      firstMessage = line.replace(FIRST_MESSAGE_PATTERN, "");
    }
  }
  return {
    startDate,
    endDate: endDate ?? null,
    projectDir,
    sessionId,
    firstMessage,
    excerpts,
  };
}

/** Blocks are separated by blank lines; anything without a valid header (summary, "Nada para…") is dropped. */
export function parsePastConversations(output: string): PastConversation[] {
  const results: PastConversation[] = [];
  for (const block of output.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((line) => line.trim().length > 0);
    const parsed = parseBlock(lines);
    if (parsed) results.push(parsed);
  }
  return results;
}

/**
 * The query reaches cmd.exe (Windows) or `sh -lc` unquoted, because quotes cannot
 * survive the trip on Windows (libuv turns inner quotes into `\"`, which cmd keeps
 * literally). So only letters, digits, `-`, `_` and `.` are kept, and leading
 * hyphens are dropped so a word is never read as a script flag. The script
 * requires every word to appear in the conversation.
 */
export function sanitizePastConversationsQuery(query: string): string {
  // Accents are stripped (the script compares without them anyway): the
  // command goes through a batch file that cmd.exe reads in the OEM code page.
  return query
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9_.-]+/g, " ")
    .split(" ")
    .map((word) => word.replace(/^-+/, ""))
    .filter((word) => word.length > 0)
    .join(" ");
}

export function buildPastConversationsCommand(base: string, query: string): string {
  return `${base.trim()} ${sanitizePastConversationsQuery(query)} --max ${PAST_CONVERSATIONS_MAX_RESULTS}`;
}

export function resumeCommand(sessionId: string): string {
  return `claude --resume ${sessionId}`;
}

/**
 * The script already drops the `C--Users-<user>-` prefix of the encoded folder
 * name (it prints "home" for the home folder). Hyphens there mean both "/" and
 * "-", so the label is everything after the last `Projetos-`, when present.
 */
export function projectLabel(projectDir: string): string {
  const trimmed = projectDir
    .replace(/^[A-Za-z]--Users-[^-]+-?/, "")
    .replace(/^-+/, "")
    .trim();
  if (trimmed.length === 0) return "home";
  const marker = "Projetos-";
  const index = trimmed.lastIndexOf(marker);
  if (index >= 0 && index + marker.length < trimmed.length) {
    return trimmed.slice(index + marker.length);
  }
  return trimmed;
}

/** "2026-09-22" → "22/09". */
export function formatPastConversationDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return month && day ? `${day}/${month}` : isoDate;
}

/** The one line shown under the date: the first message, else the first excerpt. */
export function pastConversationSummary(conversation: PastConversation): string {
  return conversation.firstMessage ?? conversation.excerpts[0] ?? "";
}
