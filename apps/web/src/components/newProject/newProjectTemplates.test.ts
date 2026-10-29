import { describe, expect, it } from "vite-plus/test";

import { newProjectFiles, newProjectSlug } from "./newProjectTemplates";

describe("newProjectSlug", () => {
  it("turns a Portuguese title into a safe folder name", () => {
    expect(newProjectSlug("  Relatório de Mídia — Hoomy 2027! ")).toBe(
      "relatorio-de-midia-hoomy-2027",
    );
    expect(newProjectSlug("???")).toBe("");
  });
});

describe("newProjectFiles", () => {
  const files = newProjectFiles({
    name: "Painel de Estoque",
    purpose: "Mostra a ruptura de estoque por SKU.",
    brand: "hoomy",
    owner: "Felipe Rocha",
  });
  const byPath = new Map(files.map((file) => [file.relativePath, file.contents]));

  it("writes the README sections the org standard asks for", () => {
    const readme = byPath.get("README.md")!;
    expect(readme).toContain("## O que faz\n\nMostra a ruptura de estoque por SKU.");
    expect(readme).toContain("## Dono\n\nFelipe Rocha · marca Hoomy.");
    expect(readme).toContain("## Como rodar");
  });

  it("keeps .env and its variants out of git", () => {
    const lines = byPath.get(".gitignore")!.split("\n");
    expect(lines).toContain(".env");
    expect(lines).toContain(".env.*");
  });

  it("carries only the chosen brand's identity and points deploy at the company GCP", () => {
    const claude = byPath.get("CLAUDE.md")!;
    expect(claude).toContain(
      "**Hoomy:** `#4D5878 #333C5E #1D2430 #0D1118`; CTA sempre `#0094FF`. Poppins.",
    );
    expect(claude).not.toContain("#F4762E");
    expect(claude).not.toContain("#FF7E1C");
    expect(claude).toContain("Só **Google Cloud da empresa**; nada de Vercel/conta pessoal.");
  });
});
