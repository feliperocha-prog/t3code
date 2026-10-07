import { describe, expect, it } from "vite-plus/test";

import {
  HUB_SECTION_SYNONYMS,
  clipSectionBody,
  compactRelativeTimeLabel,
  defaultStateNotePath,
  findHubSection,
  findRunSections,
  normalizeHeading,
  projectFolderName,
  readHubDigest,
  resolveStateNotePath,
  toPlainItems,
  toPlainText,
} from "./projectHome.logic";

describe("projectFolderName", () => {
  it("takes the last segment of a POSIX path", () => {
    expect(projectFolderName("/home/felipe/Projetos/t3code")).toBe("t3code");
  });

  it("takes the last segment of a Windows path with a trailing separator", () => {
    expect(projectFolderName("C:\\Users\\felip\\Projetos\\t3code\\")).toBe("t3code");
  });
});

describe("resolveStateNotePath", () => {
  it("defaults to the project's hub under Projetos", () => {
    expect(defaultStateNotePath("C:\\Users\\felip\\Projetos\\minimal-matrix")).toBe(
      "Projetos/minimal-matrix/HUB.md",
    );
    expect(resolveStateNotePath("/work/apex", "   ")).toBe("Projetos/apex/HUB.md");
  });

  it("uses the configured path when the project sets one", () => {
    expect(resolveStateNotePath("/work/apex", " Notas/apex.md ")).toBe("Notas/apex.md");
  });

  it("falls back to the default when the configured path escapes the vault", () => {
    expect(resolveStateNotePath("/work/apex", "../../.ssh/id_rsa")).toBe("Projetos/apex/HUB.md");
    expect(resolveStateNotePath("/work/apex", "Notas/../../x.md")).toBe("Projetos/apex/HUB.md");
    expect(resolveStateNotePath("/work/apex", "/etc/passwd")).toBe("Projetos/apex/HUB.md");
    expect(resolveStateNotePath("/work/apex", "C:\\x\\y.md")).toBe("Projetos/apex/HUB.md");
  });
});

describe("normalizeHeading", () => {
  it("drops accents, case and a trailing date", () => {
    expect(normalizeHeading("  PRÓXIMO   Passo ")).toBe("proximo passo");
    expect(normalizeHeading("Estado (30/09)")).toBe("estado");
  });

  it("drops every parenthetical group, trailing punctuation and leading symbols", () => {
    expect(normalizeHeading("Estado — 02/10")).toBe("estado");
    expect(normalizeHeading("Próximos passos (Onda 2):")).toBe("proximos passos");
    expect(normalizeHeading("✅ Pendente")).toBe("pendente");
    expect(normalizeHeading("Estado anterior (25/09)")).toBe("estado anterior");
  });
});

describe("findHubSection", () => {
  const hub = [
    "# t3code",
    "",
    "## Estado anterior (25/09)",
    "velho",
    "## Estado (02/10)",
    "",
    "Onda 1 em revisão.",
    "",
    "## Armadilhas que migraram junto",
    "não é esta",
    "## Pendente",
    "Abrir o PR.",
    "## Armadilhas",
    "- cuidado",
    "# Outro H1",
    "fora",
  ].join("\n");

  it("matches the current state heading, not the older one", () => {
    expect(findHubSection(hub, HUB_SECTION_SYNONYMS.where)).toBe("Onda 1 em revisão.");
  });

  it("matches a synonym and not a heading that only starts with one", () => {
    expect(findHubSection(hub, HUB_SECTION_SYNONYMS.next)).toBe("Abrir o PR.");
    expect(findHubSection(hub, HUB_SECTION_SYNONYMS.risks)).toBe("- cuidado");
  });

  it("returns null for a missing section and for an empty file", () => {
    expect(findHubSection("## O que é\nx", HUB_SECTION_SYNONYMS.risks)).toBeNull();
    expect(findHubSection("", HUB_SECTION_SYNONYMS.where)).toBeNull();
  });

  it("ignores headings inside fenced code", () => {
    const note = ["## Armadilhas", "```md", "## Estado", "```", "cuidado"].join("\n");
    expect(findHubSection(note, HUB_SECTION_SYNONYMS.where)).toBeNull();
  });

  it("returns null for a section with an empty body", () => {
    expect(findHubSection("## Armadilhas\n\n## Estado\nok", HUB_SECTION_SYNONYMS.risks)).toBeNull();
  });
});

describe("toPlainText", () => {
  it("cleans the real t3code hub state paragraph", () => {
    expect(
      toPlainText(
        "`pt-br` em `5b73e70700` = **base fechada** (v0.0.44 + 118 chaves pt-BR, CI `fork-verificar.yml` verde). Plano T3 Top encerrado em 29/09 → v3 em ondas.",
      ),
    ).toBe(
      "pt-br em = base fechada (v0.0.44 + 118 chaves pt-BR, CI verde). Plano T3 Top encerrado em 29/09 → v3 em ondas.",
    );
  });

  it("drops loose and inline commit hashes", () => {
    expect(toPlainText("branch `t3top/onda-1` em `60a3e0f1f9` (worktree `x/y`), 29 commits")).toBe(
      "branch em (worktree), 29 commits",
    );
    expect(toPlainText("commit 60a3e0f1f9 subiu; decade e 2026 ficam")).toBe(
      "commit subiu; decade e 2026 ficam",
    );
  });

  it("keeps the text of wiki links and markdown links", () => {
    expect(toPlainText("ver [[Projetos/t3code/HUB|hub]] e [[Projetos/t3code/HUB]]")).toBe(
      "ver hub e HUB",
    );
    expect(toPlainText("abrir o [PR #12](https://github.com/x/y/pull/12)")).toBe("abrir o PR #12");
  });

  it("drops file paths in inline code but keeps plain code words", () => {
    expect(toPlainText("mexi em `apps/web/src/x.ts` e rodei `vp test`")).toBe(
      "mexi em e rodei vp test",
    );
    expect(toPlainText("função `t()` e `.env.local`")).toBe("função t() e");
    expect(toPlainText("Base em `v0.0.44`, Node `22.x`, versão `1.2.3`")).toBe(
      "Base em v0.0.44, Node 22.x, versão 1.2.3",
    );
    expect(toPlainText("`v2.x` e `Effect.gen`, ver `README.md` e `fork-verificar.yml`")).toBe(
      "v2.x e Effect.gen, ver e",
    );
  });

  it("removes emphasis without touching snake_case", () => {
    expect(toPlainText("**Congelado** no _original_, ~~velho~~, *agora* em snake_case_word")).toBe(
      "Congelado no original, velho, agora em snake_case_word",
    );
  });

  it("cuts long items at 180 characters with an ellipsis", () => {
    const cut = toPlainText("a ".repeat(150));
    expect(cut.length).toBeLessThanOrEqual(180);
    expect(cut.endsWith("…")).toBe(true);
  });
});

describe("toPlainItems", () => {
  it("splits list entries and paragraphs, up to the limit", () => {
    const section = [
      "- **Congelado** no original",
      "  continua aqui",
      "- [ ] tarefa aberta",
      "",
      "Parágrafo solto",
      "na linha seguinte.",
      "",
      "1. quarto",
      "2. quinto",
    ].join("\n");
    expect(toPlainItems(section, 4)).toEqual([
      "Congelado no original continua aqui",
      "tarefa aberta",
      "Parágrafo solto na linha seguinte.",
      "quarto",
    ]);
  });

  it("drops code blocks, rules and items left empty, and reads tables as cells", () => {
    const section = [
      "```bash",
      "vp i",
      "```",
      "---",
      "- `abc1234def`",
      "| Item | Estado |",
      "|---|---|",
      "| PR | aberto |",
      "### Subtítulo",
    ].join("\n");
    expect(toPlainItems(section, 5)).toEqual(["Item · Estado", "PR · aberto", "Subtítulo"]);
  });
});

describe("readHubDigest", () => {
  it("reads the three blocks with their limits and leaves a missing one empty", () => {
    const hub = [
      "## Estado (02/10)",
      "Onda 1 instalada em `60a3e0f1f9`.",
      "## Próximo passo",
      "- um",
      "- dois",
      "- três",
      "- quatro",
      "- cinco",
    ].join("\n");
    expect(readHubDigest(hub)).toEqual({
      where: ["Onda 1 instalada em."],
      next: ["um", "dois", "três", "quatro"],
      risks: [],
    });
  });
});

describe("compactRelativeTimeLabel", () => {
  it("matches the sidebar's compact labels", () => {
    expect(compactRelativeTimeLabel("5m ago", "agora")).toBe("5m");
    expect(compactRelativeTimeLabel("just now", "agora")).toBe("agora");
    expect(compactRelativeTimeLabel("", "agora")).toBe("");
  });
});

describe("clipSectionBody", () => {
  it("cuts past 12 lines with an ellipsis", () => {
    const body = Array.from({ length: 15 }, (_, index) => `linha ${index + 1}`).join("\n");
    const clipped = clipSectionBody(body)!.split("\n");
    expect(clipped).toHaveLength(13);
    expect(clipped[11]).toBe("linha 12");
    expect(clipped[12]).toBe("…");
  });

  it("keeps a body of exactly 12 lines whole", () => {
    const body = Array.from({ length: 12 }, (_, index) => `l${index}`).join("\n");
    expect(clipSectionBody(body)).toBe(body);
  });

  it("closes a code fence the cut left open", () => {
    const body = ["```bash", ...Array.from({ length: 14 }, () => "vp i")].join("\n");
    const clipped = clipSectionBody(body)!.split("\n");
    expect(clipped.slice(-2)).toEqual(["```", "…"]);
  });
});

describe("findRunSections", () => {
  it("joins the run and publish sections of a README", () => {
    const readme = [
      "# App",
      "## O que é",
      "Um app.",
      "## Como rodar",
      "vp run dev",
      "## Deploy",
      "",
      "gcloud run deploy",
    ].join("\n");
    expect(findRunSections(readme)).toBe(
      "**Como rodar**\n\nvp run dev\n\n**Deploy**\n\ngcloud run deploy",
    );
  });

  it("returns null when no section is about running", () => {
    expect(findRunSections("## O que é\nUm app.")).toBeNull();
  });
});
