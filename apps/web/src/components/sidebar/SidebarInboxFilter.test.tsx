import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { SidebarInboxFilter } from "./SidebarInboxFilter";

function render(value: "tudo" | "esperando" | "trabalhando" | "acabou", waitingCount: number) {
  return renderToStaticMarkup(
    <SidebarInboxFilter value={value} onValueChange={() => {}} waitingCount={waitingCount} />,
  );
}

function pressedLabels(markup: string): string[] {
  return [...markup.matchAll(/<button[^>]*aria-pressed="true"[^>]*>(.*?)<\/button>/g)].map(
    (match) => match[1]!.replace(/<[^>]+>/g, ""),
  );
}

describe("SidebarInboxFilter", () => {
  it("renders the four chips in order with only the current one pressed", () => {
    const markup = render("trabalhando", 0);
    const labels = [...markup.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((match) =>
      match[1]!.replace(/<[^>]+>/g, ""),
    );
    expect(labels).toEqual(["Tudo", "Pra você", "Rodando", "Prontas"]);
    expect(pressedLabels(markup)).toEqual(["Rodando"]);
    expect(markup).toContain('aria-label="Filtrar threads por estado"');
  });

  it("shows the waiting counter only on the waiting chip and only above zero", () => {
    expect(pressedLabels(render("esperando", 3))).toEqual(["Pra você3"]);
    const withCount = render("tudo", 3);
    expect(withCount).toMatch(/Pra você<span[^>]*>3<\/span>/);
    expect(withCount.match(/>3<\/span>/g)?.length).toBe(1);
    expect(render("tudo", 0)).not.toMatch(/>\d+<\/span>/);
  });
});
