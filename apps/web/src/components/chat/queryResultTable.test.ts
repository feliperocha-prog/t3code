import { describe, expect, it } from "vite-plus/test";

import { parseQueryResultTable, queryResultToTsv } from "./queryResultTable";

const bqQuery = (text: string, toolName = "mcp__bigquery__bq_query") => ({
  toolName,
  input: { query: "SELECT marca, receita FROM t" },
  result: { type: "tool_result", content: [{ type: "text", text }] },
});

describe("parseQueryResultTable", () => {
  it("reads a local bq_query answer and keeps the cost line", () => {
    const table = parseQueryResultTable(
      bqQuery(
        '[\n  {"marca": "Minimal", "receita": "12345.67"},\n  {"marca": "Hoomy", "receita": null}\n]\n\n-- 0.00 GB cobrados · R$ 0.00',
      ),
    );
    expect(table).toEqual({
      columns: ["marca", "receita"],
      rows: [
        ["Minimal", "12345.67"],
        ["Hoomy", ""],
      ],
      sql: "SELECT marca, receita FROM t",
      footer: "0.00 GB cobrados · R$ 0.00",
    });
  });

  it("reads the result as the server forwards it, a plain content string", () => {
    const table = parseQueryResultTable({
      toolName: "mcp__bigquery__bq_query",
      input: { query: "SELECT 1 AS n" },
      result: { content: '[{"n": "1"}]' },
    });
    expect(table?.rows).toEqual([["1"]]);
  });

  it("reads the BigQuery REST shape from Google's MCP", () => {
    const table = parseQueryResultTable(
      bqQuery(
        JSON.stringify({
          jobComplete: true,
          schema: { fields: [{ name: "dia" }, { name: "pedidos" }] },
          rows: [{ f: [{ v: "2026-10-27" }, { v: "41" }] }],
        }),
        "mcp__claude_ai_Google_Cloud_BigQuery__execute_sql_readonly",
      ),
    );
    expect(table?.columns).toEqual(["dia", "pedidos"]);
    expect(table?.rows).toEqual([["2026-10-27", "41"]]);
  });

  it("ignores other tools, errors and non-tabular output", () => {
    expect(parseQueryResultTable(bqQuery('[{"a":1}]', "mcp__playwright__browser_click"))).toBe(
      null,
    );
    expect(parseQueryResultTable(bqQuery("Erro: tabela não existe"))).toBe(null);
    expect(parseQueryResultTable(bqQuery('["a","b"]'))).toBe(null);
    expect(parseQueryResultTable(bqQuery('[{"a":1}]', "mcp__postgres__execute_sql"))).toBe(null);
  });

  it("matches Codex's '<server> <tool>' name", () => {
    expect(parseQueryResultTable(bqQuery('[{"a":1}]', "minimal bq_query"))?.rows).toEqual([["1"]]);
  });
});

describe("queryResultToTsv", () => {
  it("joins cells with tabs and flattens line breaks inside a cell", () => {
    expect(queryResultToTsv({ columns: ["a", "b"], rows: [["1", "x\ny"]] })).toBe("a\tb\n1\tx y");
  });
});
