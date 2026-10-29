import { describe, expect, it } from "vite-plus/test";

import { collectGalleryItems, galleryPathsInText } from "./galleryItems";

describe("galleryPathsInText", () => {
  it("finds markdown, code span and bare paths, Windows and relative", () => {
    const text = [
      "Print: ![tela](C:/Users/felip/Downloads/prova/tela-1.png)",
      "Guia em `C:\\Users\\felip\\Downloads\\t3code-onda-6\\guia.html`.",
      "Também gerei docs/relatorio.html e ./out/grafico.svg:12.",
      "[com espaço](<C:/Users/felip/One Drive/foto final.jpg>)",
    ].join("\n");
    expect(galleryPathsInText(text)).toEqual([
      "C:/Users/felip/Downloads/prova/tela-1.png",
      "C:/Users/felip/One Drive/foto final.jpg",
      "C:\\Users\\felip\\Downloads\\t3code-onda-6\\guia.html",
      "docs/relatorio.html",
      "./out/grafico.svg",
    ]);
  });

  it("ignores web URLs and other files, and decodes file URLs", () => {
    expect(
      galleryPathsInText(
        "veja https://site.com/a.png e `src/app.ts`, abra file:///C:/tmp/meu%20print.png",
      ),
    ).toEqual(["C:/tmp/meu print.png"]);
  });

  it("does not split a quoted path with spaces into a fake relative one", () => {
    expect(galleryPathsInText("`C:/Pasta Nova/sub/a.png`")).toEqual(["C:/Pasta Nova/sub/a.png"]);
  });
});

describe("collectGalleryItems", () => {
  it("lists newest first, keeps changed over mentioned, skips user text and deletions", () => {
    const items = collectGalleryItems({
      messages: [
        { role: "user", text: "olha `minha.png`", createdAt: "2026-10-28T10:00:00.000Z" },
        {
          role: "assistant",
          text: "Pronto: `site/index.html` e `prints/antes.png`",
          createdAt: "2026-10-28T10:05:00.000Z",
        },
        {
          role: "assistant",
          text: "Novo print `prints/depois.png`",
          createdAt: "2026-10-28T10:09:00.000Z",
        },
      ],
      checkpoints: [
        {
          completedAt: "2026-10-28T10:05:00.000Z",
          files: [
            { path: "site/index.html", kind: "modified" },
            { path: "site/velho.png", kind: "deleted" },
            { path: "site/app.css", kind: "modified" },
          ],
        },
      ],
    });
    expect(items.map((item) => [item.path, item.kind, item.source])).toEqual([
      ["prints/depois.png", "image", "mentioned"],
      ["site/index.html", "page", "changed"],
      ["prints/antes.png", "image", "mentioned"],
    ]);
  });

  it("merges an absolute mention with the checkpoint's workspace-relative path", () => {
    const items = collectGalleryItems({
      workspaceRoot: "C:\\Users\\felip\\repo",
      messages: [
        {
          role: "assistant",
          text: "Criei `C:\\Users\\felip\\repo\\prova.svg`",
          createdAt: "2026-10-28T10:05:00.000Z",
        },
      ],
      checkpoints: [
        {
          completedAt: "2026-10-28T10:05:01.000Z",
          files: [{ path: "prova.svg", kind: "added" }],
        },
      ],
    });
    expect(items.map((item) => [item.path, item.source])).toEqual([["prova.svg", "changed"]]);
  });
});
