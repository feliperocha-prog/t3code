import { describe, expect, it } from "vite-plus/test";

import { translateWorkSummary } from "./workSummary.logic";

describe("translateWorkSummary", () => {
  it("translates a single label", () => {
    expect(translateWorkSummary("Used 2 tools")).toBe("Usou 2 ferramentas");
    expect(translateWorkSummary("Used 1 tool")).toBe("Usou 1 ferramenta");
    expect(translateWorkSummary("Changed 3 files")).toBe("Alterou 3 arquivos");
  });

  it("translates joined labels and keeps the join order", () => {
    expect(translateWorkSummary("Read 2 files and changed 1 file")).toBe(
      "Leu 2 arquivos e alterou 1 arquivo",
    );
    expect(translateWorkSummary("Used BigQuery integration, read 1 file, and ran 2 commands")).toBe(
      "Usou a integração BigQuery, leu 1 arquivo e executou 2 comandos",
    );
  });

  it("does not split a list of sources joined with and", () => {
    expect(translateWorkSummary("Used BigQuery and Sheets integrations and changed 1 file")).toBe(
      "Usou as integrações BigQuery and Sheets e alterou 1 arquivo",
    );
    expect(translateWorkSummary("Used Chrome, Figma, and Linear and read 2 files")).toBe(
      "Usou Chrome, Figma, and Linear e leu 2 arquivos",
    );
  });

  it("leaves an unknown sentence alone", () => {
    expect(translateWorkSummary("Something else")).toBe("Something else");
    expect(translateWorkSummary("")).toBe("");
  });
});
