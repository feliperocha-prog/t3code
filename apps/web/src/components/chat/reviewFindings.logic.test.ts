import { describe, expect, it } from "vite-plus/test";
import { parseReviewFindings, reviewFindingText } from "./reviewFindings.logic";

describe("parseReviewFindings", () => {
  it("reads an approval without defect words as approved", () => {
    expect(parseReviewFindings("  APROVADO. Nada a corrigir nos 3 arquivos.\n")).toEqual({
      kind: "approved",
    });
    expect(parseReviewFindings("Revisão: aprovado")).toEqual({ kind: "approved" });
  });

  it("keeps an approval that merely mentions defects or corrections", () => {
    expect(parseReviewFindings("APROVADO. Nenhum defeito encontrado.")).toEqual({
      kind: "approved",
    });
    expect(parseReviewFindings("APROVADO — nenhuma correção necessária")).toEqual({
      kind: "approved",
    });
    expect(parseReviewFindings("APPROVED, no issues found")).toEqual({ kind: "approved" });
    expect(parseReviewFindings("LGTM")).toEqual({ kind: "approved" });
  });

  it("reads a negated approval as a finding", () => {
    expect(parseReviewFindings("NÃO APROVADO: falta tratar erro de rede.").kind).toBe("findings");
    expect(parseReviewFindings("Reprovado. Veja abaixo.").kind).toBe("findings");
  });

  it("does not treat a word that only contains APROVADO as an approval", () => {
    expect(parseReviewFindings("REPROVADOS dois testes").kind).toBe("findings");
  });

  it("splits path:line findings and ignores the preamble", () => {
    const result = [
      "Revisei 4 arquivos. Achei 2 defeitos.",
      "",
      "apps/web/src/a.tsx:42 — botão some depois do clique",
      "QUEBRA QUANDO: o usuário clica duas vezes",
      "CORREÇÃO: guardar o estado fora do efeito",
      "",
      "packages/x/b.ts:7 — limite errado",
      "QUEBRA QUANDO: resultado passa de 180 caracteres",
      "CORREÇÃO: usar RESULT_CHAR_LIMIT",
    ].join("\n");
    expect(parseReviewFindings(result)).toEqual({
      kind: "findings",
      findings: [
        {
          title: "apps/web/src/a.tsx:42 — botão some depois do clique",
          body: "QUEBRA QUANDO: o usuário clica duas vezes\nCORREÇÃO: guardar o estado fora do efeito",
        },
        {
          title: "packages/x/b.ts:7 — limite errado",
          body: "QUEBRA QUANDO: resultado passa de 180 caracteres\nCORREÇÃO: usar RESULT_CHAR_LIMIT",
        },
      ],
    });
  });

  it("reads '- ' and '1.' list items, dropping the marker from the title", () => {
    const result = [
      "Defeitos:",
      "",
      "- Falta tratar erro de rede",
      "detalhe da falha",
      "",
      "2. Teste não cobre o caso vazio",
      "",
      "continuação do item 2",
    ].join("\n");
    expect(parseReviewFindings(result)).toEqual({
      kind: "findings",
      findings: [
        { title: "Falta tratar erro de rede", body: "detalhe da falha" },
        { title: "Teste não cobre o caso vazio", body: "continuação do item 2" },
      ],
    });
  });

  it("turns loose text into one finding", () => {
    expect(
      parseReviewFindings("O DEFEITO principal é o cache.\nEle nunca expira.\n\nOutro parágrafo."),
    ).toEqual({
      kind: "findings",
      findings: [
        {
          title: "O DEFEITO principal é o cache.",
          body: "Ele nunca expira.\n\nOutro parágrafo.",
        },
      ],
    });
  });

  it("reads a fenced, indented markdown report with a trailer as separate findings", () => {
    const result = [
      "  **REPROVADO.** O arquivo não roda. Revisei só [t.js](t.js).\r",
      "  \r",
      "  ```\r",
      "  C:\\Users\\x\\teste-onda-6\\t.js:1 — [CRÍTICO] require de módulo inexistente\r",
      "  QUEBRA QUANDO: qualquer require → Error: Cannot find module\r",
      "  CORREÇÃO: apontar para um módulo que exista\r",
      "  ```\r",
      "  \r",
      "  ```\r",
      "  C:\\Users\\x\\teste-onda-6\\t.js:4-5 — [CRÍTICO] `resultado` usado antes do `let`\r",
      "  QUEBRA QUANDO: calcularMedia(10, 2) → ReferenceError\r",
      "  CORREÇÃO: `const resultado = total / quantidade;`\r",
      "  ```\r",
      "  \r",
      "  STATUS: bloqueado\r",
      "  VOCÊ: nada\r",
      "agentId: abc (use SendMessage)\r",
      "<usage>subagent_tokens: 1",
    ].join("\n");
    const parsed = parseReviewFindings(result);
    expect(parsed.kind).toBe("findings");
    if (parsed.kind !== "findings") return;
    expect(parsed.findings.map((finding) => finding.title)).toEqual([
      "C:\\Users\\x\\teste-onda-6\\t.js:1 — [CRÍTICO] require de módulo inexistente",
      "C:\\Users\\x\\teste-onda-6\\t.js:4-5 — [CRÍTICO] resultado usado antes do let",
    ]);
    expect(parsed.findings[1]?.body).toBe(
      "QUEBRA QUANDO: calcularMedia(10, 2) → ReferenceError\nCORREÇÃO: const resultado = total / quantidade;",
    );
  });

  it("reads a bold approval as approved", () => {
    expect(parseReviewFindings("**APROVADO**")).toEqual({ kind: "approved" });
  });

  it("joins title and body for the fix message", () => {
    expect(reviewFindingText({ title: "a.ts:1 — x", body: "CORREÇÃO: y" })).toBe(
      "a.ts:1 — x\nCORREÇÃO: y",
    );
    expect(reviewFindingText({ title: "só título", body: "" })).toBe("só título");
  });
});
