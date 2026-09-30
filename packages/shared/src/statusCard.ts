/**
 * Parses the closing status block an assistant reply ends with:
 *
 *   STATUS: pronto | bloqueado | aguardando sua aprovação
 *   VOCÊ: <what the user has to do>
 *   EU: <what the agent does next>
 *
 * The thread shell carries the parsed card so the sidebar can show where a
 * thread stands without opening it. Fields are cut short on purpose: the
 * shell is resent on every thread event.
 */
export type StatusCardKind = "pronto" | "bloqueado" | "aguardando" | "outro";

export interface StatusCard {
  readonly kind: StatusCardKind;
  readonly status: string;
  readonly voce: string;
  readonly eu: string;
}

export const STATUS_CARD_MAX_FIELD_LENGTH = 200;

const STATUS_LINE = /^\s*\**\s*STATUS\s*\**\s*:\s*(.+)$/u;
const VOCE_LINE = /^\s*\**\s*VOC[EÊ]\s*\**\s*:\s*(.*)$/iu;
const EU_LINE = /^\s*\**\s*EU\s*\**\s*:\s*(.*)$/iu;
const FOLLOWING_LINE_WINDOW = 6;

function cleanField(raw: string): string {
  const cleaned = raw.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= STATUS_CARD_MAX_FIELD_LENGTH) return cleaned;
  return `${cleaned.slice(0, STATUS_CARD_MAX_FIELD_LENGTH - 1).trimEnd()}…`;
}

function statusCardKind(status: string): StatusCardKind {
  const normalized = status.toLowerCase();
  if (normalized.includes("pronto")) return "pronto";
  if (normalized.includes("bloque")) return "bloqueado";
  if (normalized.includes("aguard") || normalized.includes("aprova")) return "aguardando";
  return "outro";
}

function firstMatch(lines: ReadonlyArray<string>, pattern: RegExp): string {
  for (const line of lines) {
    const match = pattern.exec(line);
    if (match) return cleanField(match[1] ?? "");
  }
  return "";
}

/** Returns the last status block in `text`, or null when the reply has none. */
export function parseStatusCard(text: string): StatusCard | null {
  const lines = text.normalize("NFC").split(/\r?\n/);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const match = STATUS_LINE.exec(lines[index] ?? "");
    if (!match) continue;
    const status = cleanField(match[1] ?? "");
    if (status.length === 0) continue;
    const following = lines.slice(index + 1, index + 1 + FOLLOWING_LINE_WINDOW);
    return {
      kind: statusCardKind(status),
      status,
      voce: firstMatch(following, VOCE_LINE),
      eu: firstMatch(following, EU_LINE),
    };
  }
  return null;
}
