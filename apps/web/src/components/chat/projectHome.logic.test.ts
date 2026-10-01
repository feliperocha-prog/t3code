import { describe, expect, it } from "vite-plus/test";

import {
  clipSectionBody,
  defaultStateNotePath,
  findH2Section,
  findRunSections,
  normalizeHeading,
  projectFolderName,
  resolveStateNotePath,
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
});

describe("normalizeHeading", () => {
  it("drops accents, case and a trailing date", () => {
    expect(normalizeHeading("  PRÓXIMO   Passo ")).toBe("proximo passo");
    expect(normalizeHeading("Estado (30/09)")).toBe("estado");
  });
});

describe("findH2Section", () => {
  const hub = [
    "# t3code",
    "",
    "## Estado anterior (25/09)",
    "velho",
    "## Estado (30/09)",
    "",
    "Onda 1 em revisão.",
    "",
    "## Próximo passo",
    "Abrir o PR.",
    "# Outro H1",
    "fora",
  ].join("\n");

  it("matches the current state heading, not the older one", () => {
    expect(findH2Section(hub, "Estado")).toBe("Onda 1 em revisão.");
  });

  it("matches without accents and stops at the next H1", () => {
    expect(findH2Section(hub, "proximo passo")).toBe("Abrir o PR.");
  });

  it("returns null for a missing section and for an empty file", () => {
    expect(findH2Section(hub, "Armadilhas")).toBeNull();
    expect(findH2Section("", "Estado")).toBeNull();
  });

  it("ignores headings inside fenced code", () => {
    const note = ["## Armadilhas", "```md", "## Estado", "```", "cuidado"].join("\n");
    expect(findH2Section(note, "Estado")).toBeNull();
    expect(findH2Section(note, "Armadilhas")).toBe("```md\n## Estado\n```\ncuidado");
  });

  it("returns null for a section with an empty body", () => {
    expect(findH2Section("## Armadilhas\n\n## Estado\nok", "Armadilhas")).toBeNull();
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
