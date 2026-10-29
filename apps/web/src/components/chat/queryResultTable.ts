export interface QueryResultTable {
  readonly columns: ReadonlyArray<string>;
  readonly rows: ReadonlyArray<ReadonlyArray<string>>;
  /** The SQL the agent ran, when the tool input carries it. */
  readonly sql: string | null;
  /** Text the tool printed after the rows, such as the bytes billed. */
  readonly footer: string | null;
}

// Local `bq_query` servers, Google's BigQuery MCP (`execute_sql_readonly`,
// `get_query_results`) and anything else that names BigQuery.
const BIGQUERY_TOOL = /bigquery|(?:^|_)bq_|execute_sql|get_query_results/i;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

function toolNameOf(toolData: Record<string, unknown>): string {
  const parts = [toolData.toolName, toolData.server, toolData.tool, toolData.name];
  return parts.filter((part): part is string => typeof part === "string").join(" ");
}

/** Text blocks of an MCP result: `{content: [{type: "text", text}]}`, a string, or structured content. */
function resultTexts(result: unknown): string[] {
  if (typeof result === "string") return [result];
  const record = asRecord(result);
  if (!record) return Array.isArray(result) ? [JSON.stringify(result)] : [];
  const texts: string[] = [];
  // The server forwards BigQuery output as `{content: text}`.
  if (typeof record.content === "string") texts.push(record.content);
  if (Array.isArray(record.content)) {
    for (const block of record.content) {
      const text = asRecord(block)?.text;
      if (typeof text === "string") texts.push(text);
    }
  }
  if (record.structuredContent !== undefined) texts.push(JSON.stringify(record.structuredContent));
  return texts;
}

/** JSON at the start of `text`, plus whatever follows it. */
function leadingJson(text: string): { value: unknown; rest: string } | null {
  const trimmed = text.trim();
  const close = trimmed.startsWith("[") ? "]" : trimmed.startsWith("{") ? "}" : null;
  if (!close) return null;
  // Each attempt parses the whole prefix; a trailer rarely holds more than a few brackets.
  let attempts = 8;
  for (
    let end = trimmed.lastIndexOf(close);
    end > 0 && attempts > 0;
    end = trimmed.lastIndexOf(close, end - 1), attempts -= 1
  ) {
    try {
      return { value: JSON.parse(trimmed.slice(0, end + 1)), rest: trimmed.slice(end + 1).trim() };
    } catch {
      // Keep shrinking until the prefix is valid JSON.
    }
  }
  return null;
}

const cellText = (value: unknown): string =>
  value === null || value === undefined
    ? ""
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

function tableFromRecords(records: ReadonlyArray<unknown>) {
  const objects = records.map(asRecord);
  if (objects.length === 0 || objects.some((row) => row === null)) return null;
  const columns: string[] = [];
  for (const row of objects) {
    for (const key of Object.keys(row!)) if (!columns.includes(key)) columns.push(key);
  }
  return { columns, rows: objects.map((row) => columns.map((column) => cellText(row![column]))) };
}

/** BigQuery REST shape: `{schema: {fields: [{name}]}, rows: [{f: [{v}]}]}`. */
function tableFromRestRows(schema: unknown, rows: ReadonlyArray<unknown>) {
  const fields = asRecord(schema)?.fields;
  if (!Array.isArray(fields)) return null;
  const columns = fields.map((field) => cellText(asRecord(field)?.name));
  const cells = rows.map((row) => asRecord(row)?.f);
  if (cells.some((cell) => !Array.isArray(cell))) return null;
  return {
    columns,
    rows: cells.map((cell) =>
      columns.map((_, index) => cellText(asRecord((cell as unknown[])[index])?.v)),
    ),
  };
}

function tableFromJson(value: unknown): Pick<QueryResultTable, "columns" | "rows"> | null {
  if (Array.isArray(value)) return tableFromRecords(value);
  const record = asRecord(value);
  if (!record) return null;
  const nested = asRecord(record.result) ?? asRecord(record.data);
  const holder = Array.isArray(record.rows) ? record : nested;
  if (!holder || !Array.isArray(holder.rows)) return null;
  if (holder.rows.length === 0) {
    const fields = asRecord(holder.schema)?.fields;
    return Array.isArray(fields)
      ? { columns: fields.map((field) => cellText(asRecord(field)?.name)), rows: [] }
      : null;
  }
  return tableFromRestRows(holder.schema, holder.rows) ?? tableFromRecords(holder.rows);
}

/**
 * A BigQuery tool result as a table, or null when the call is not BigQuery or
 * its output is not tabular (errors, dry runs, schema listings).
 */
export function parseQueryResultTable(toolData: unknown): QueryResultTable | null {
  const record = asRecord(toolData);
  if (!record || !BIGQUERY_TOOL.test(toolNameOf(record))) return null;
  const input = asRecord(record.input) ?? asRecord(record.arguments);
  const sql = typeof input?.query === "string" ? input.query.trim() : null;
  for (const text of resultTexts(record.result)) {
    const parsed = leadingJson(text);
    const table = parsed ? tableFromJson(parsed.value) : null;
    if (table && table.columns.length > 0) {
      return { ...table, sql, footer: parsed!.rest.replace(/^-+\s*/, "") || null };
    }
  }
  return null;
}

/** Tab-separated text, which pastes into Google Sheets as one value per cell. */
export function queryResultToTsv(table: Pick<QueryResultTable, "columns" | "rows">): string {
  const clean = (value: string) => value.replace(/[\t\r\n]+/g, " ");
  return [table.columns, ...table.rows].map((row) => row.map(clean).join("\t")).join("\n");
}
