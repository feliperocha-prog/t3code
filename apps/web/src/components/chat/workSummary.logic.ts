import { t } from "~/i18n";

type Rule = readonly [RegExp, (match: RegExpMatchArray) => string];

// `summarizeToolGroup` (client-runtime, shared with mobile) builds its sentence
// in English. The web translates that sentence here instead of forking the
// builder, so the counts and joins stay identical across clients.
const n = (match: RegExpMatchArray) => Number(match[1]);
const counted = (match: RegExpMatchArray, one: string, many: string) =>
  t(n(match) === 1 ? one : many, { count: n(match) });

const RULES: ReadonlyArray<Rule> = [
  [/^used (\d+) tools?$/i, (m) => counted(m, "Used 1 tool", "Used {count} tools")],
  [/^changed (\d+) files?$/i, (m) => counted(m, "Changed 1 file", "Changed {count} files")],
  [/^read (\d+) files?$/i, (m) => counted(m, "Read 1 file", "Read {count} files")],
  [/^ran (\d+) commands?$/i, (m) => counted(m, "Ran 1 command", "Ran {count} commands")],
  [
    /^received (\d+) updates?$/i,
    (m) => counted(m, "Received 1 update", "Received {count} updates"),
  ],
  [
    /^linked (\d+) pull requests?$/i,
    (m) => counted(m, "Linked 1 pull request", "Linked {count} pull requests"),
  ],
  [
    /^unlinked (\d+) pull requests?$/i,
    (m) => counted(m, "Unlinked 1 pull request", "Unlinked {count} pull requests"),
  ],
  [/^checked linked pull requests$/i, () => t("Checked linked pull requests")],
  [
    /^checked linked pull requests (\d+) times$/i,
    (m) => t("Checked linked pull requests {count} times", { count: n(m) }),
  ],
  [
    /^searched the web (\d+) times?$/i,
    (m) => counted(m, "Searched the web once", "Searched the web {count} times"),
  ],
  [
    /^searched code (\d+) times?$/i,
    (m) => counted(m, "Searched code once", "Searched code {count} times"),
  ],
  [
    /^used browser (\d+) times?$/i,
    (m) => counted(m, "Used browser once", "Used browser {count} times"),
  ],
  [
    /^used device controls (\d+) times?$/i,
    (m) => counted(m, "Used device controls once", "Used device controls {count} times"),
  ],
  [/^used (.+) integration$/i, (m) => t("Used {name} integration", { name: m[1]! })],
  [/^used (.+) integrations$/i, (m) => t("Used {names} integrations", { names: m[1]! })],
  [/^used (.+)$/i, (m) => t("Used {names}", { names: m[1]! })],
];

// Source names are joined with the same ", " / " and " as the labels ("Used
// BigQuery and Sheets integrations"), so only a join followed by a label verb
// separates labels.
const LABEL_JOIN =
  /(?:, and |, | and )(?=(?:used|changed|read|ran|received|linked|unlinked|checked|searched)\b)/i;

function translatePart(part: string): { text: string; translated: boolean } {
  for (const [pattern, render] of RULES) {
    const match = part.match(pattern);
    if (match) return { text: render(match), translated: true };
  }
  return { text: part, translated: false };
}

/** Translates the English work summary ("Used 2 tools and changed 1 file"). */
export function translateWorkSummary(summary: string): string {
  if (summary === "") return summary;
  const parts = summary.split(LABEL_JOIN);
  if (parts.length === 1) return translatePart(summary).text;
  const translated = parts.map(translatePart);
  const first = translated[0]!.text;
  // An untranslated label keeps its casing: it may be a name, not a verb.
  const rest = translated
    .slice(1)
    .map(({ text, translated }) =>
      translated ? text.charAt(0).toLowerCase() + text.slice(1) : text,
    );
  const last = rest.pop()!;
  const head = [first, ...rest].join(", ");
  return t("{head} and {last}", { head, last });
}
