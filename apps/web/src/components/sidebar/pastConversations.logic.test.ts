import { describe, expect, it } from "vite-plus/test";

import {
  buildPastConversationsCommand,
  formatPastConversationDate,
  parsePastConversations,
  pastConversationSummary,
  projectLabel,
  resumeCommand,
} from "./pastConversations.logic";

// Real output of `node buscar-conversa.js "klaviyo" --max 2` (excerpts shortened).
const REAL_OUTPUT = [
  "",
  "■ 2026-10-11 → 2026-10-12 · home · c986fd78-8e4b-401a-85f9-7064defe176a",
  "  1ª msg: Cláudia, hoje é um novo dia. Eu não me recordo onde a gente parou na criação do t3.",
  "  Felipe: …lanning Onda 5 and had just inspected `buscar-conversa.js` output format…",
  "",
  "■ 2026-10-08 · OneDrive-Documentos-Projetos-mcp-sheets-felipe · 47fbafa7-682a-4c52-9bd3-18bc11072c0c",
  "  Felipe: …. **Volta depois** (B) = negócio que nasceu sem campanha…",
  "  Claude: …--|---|---|---| | Base de contagem | mês do **lead**…",
  "",
  "2 conversa(s) de 14 lidas. Transcript: ~/.claude/projects/<pasta>/<sessão>.jsonl",
  "",
].join("\r\n");

describe("parsePastConversations", () => {
  it("parses a block with a date range and first message, and one without", () => {
    const parsed = parsePastConversations(REAL_OUTPUT);
    expect(parsed).toEqual([
      {
        startDate: "2026-10-11",
        endDate: "2026-10-12",
        projectDir: "home",
        sessionId: "c986fd78-8e4b-401a-85f9-7064defe176a",
        firstMessage:
          "Cláudia, hoje é um novo dia. Eu não me recordo onde a gente parou na criação do t3.",
        excerpts: [
          "Felipe: …lanning Onda 5 and had just inspected `buscar-conversa.js` output format…",
        ],
      },
      {
        startDate: "2026-10-08",
        endDate: null,
        projectDir: "OneDrive-Documentos-Projetos-mcp-sheets-felipe",
        sessionId: "47fbafa7-682a-4c52-9bd3-18bc11072c0c",
        firstMessage: null,
        excerpts: [
          "Felipe: …. **Volta depois** (B) = negócio que nasceu sem campanha…",
          "Claude: …--|---|---|---| | Base de contagem | mês do **lead**…",
        ],
      },
    ]);
  });

  it("still parses when the console mangles the non-ASCII separators", () => {
    const mangled =
      "\nâ–  2026-10-08 â†’ 2026-10-09 Â· -t3-userdata-project-briefs Â· 07713a1e-9c0f-43f9-80bb-5df0e67a2843\n  1Âª msg: You summarize\n";
    expect(parsePastConversations(mangled)).toEqual([
      {
        startDate: "2026-10-08",
        endDate: "2026-10-09",
        projectDir: "-t3-userdata-project-briefs",
        sessionId: "07713a1e-9c0f-43f9-80bb-5df0e67a2843",
        firstMessage: "You summarize",
        excerpts: [],
      },
    ]);
  });

  it("returns nothing for empty output or the no-match line", () => {
    expect(parsePastConversations("")).toEqual([]);
    expect(
      parsePastConversations('Nada para "xyz" em 14 conversas. Tente --tudo para incluir saída.\n'),
    ).toEqual([]);
  });
});

describe("buildPastConversationsCommand", () => {
  const base = "node C:/Users/felip/.claude/scripts/buscar-conversa.js";

  it("appends the query words unquoted and caps the results", () => {
    expect(buildPastConversationsCommand(base, "klaviyo sync")).toBe(
      `${base} klaviyo sync --max 8`,
    );
  });

  it("keeps only letters, digits and - _ . so nothing reaches the shell", () => {
    expect(
      buildPastConversationsCommand(
        `  ${base}  `,
        'a" & calc | x > y ^ "b\n%PATH% $(x) `y`; c\\d * ? <z> (w) café v1.2 snake_case',
      ),
    ).toBe(`${base} a calc x y b PATH x y c d z w cafe v1.2 snake_case --max 8`);
  });

  it("strips accents so the batch file code page cannot mangle them", () => {
    expect(buildPastConversationsCommand(base, "orçamento atenção")).toBe(
      `${base} orcamento atencao --max 8`,
    );
  });

  it("drops leading hyphens so a word is never a script flag", () => {
    expect(buildPastConversationsCommand(base, "--max 99 --tudo go-live")).toBe(
      `${base} max 99 tudo go-live --max 8`,
    );
  });
});

describe("helpers", () => {
  it("builds the resume command", () => {
    expect(resumeCommand("c986fd78-8e4b-401a-85f9-7064defe176a")).toBe(
      "claude --resume c986fd78-8e4b-401a-85f9-7064defe176a",
    );
  });

  it("labels projects by what follows the last Projetos- folder", () => {
    expect(projectLabel("home")).toBe("home");
    expect(projectLabel("-t3-userdata-project-briefs")).toBe("t3-userdata-project-briefs");
    expect(projectLabel("OneDrive-Documentos-Projetos-mcp-sheets-felipe")).toBe(
      "mcp-sheets-felipe",
    );
    expect(projectLabel("C--Users-felip-Projetos-x")).toBe("x");
    expect(projectLabel("C--Users-felip")).toBe("home");
  });

  it("formats dates as dd/mm and summarizes with the first message or excerpt", () => {
    expect(formatPastConversationDate("2026-09-22")).toBe("22/09");
    const [first, second] = parsePastConversations(REAL_OUTPUT);
    expect(first && pastConversationSummary(first)).toMatch(/^Cláudia/);
    expect(second && pastConversationSummary(second)).toMatch(/^Felipe:/);
  });
});
