import { describe, expect, it } from "vite-plus/test";
import { plainTextExcerpt } from "./BadAnswerRuleButton.logic";

describe("plainTextExcerpt", () => {
  it("remove as cercas de código e mantém o conteúdo de dentro", () => {
    const answer = "Rode isto:\n```bash\nvp test run\n```\nPronto.";
    expect(plainTextExcerpt(answer, 220)).toBe("Rode isto: vp test run Pronto.");
  });

  it("tira crases e ênfase sem estragar nome com sublinhado", () => {
    const answer = "Use `plainTextExcerpt` com **cuidado** e _calma_, sem mexer em snake_case.";
    expect(plainTextExcerpt(answer, 220)).toBe(
      "Use plainTextExcerpt com cuidado e calma, sem mexer em snake_case.",
    );
  });

  it("tira título e marcadores de lista e junta tudo numa linha", () => {
    const answer = "# Resumo\n\n- primeiro item\n* segundo item\n1. terceiro item";
    expect(plainTextExcerpt(answer, 220)).toBe("Resumo primeiro item segundo item terceiro item");
  });

  it("corta depois de limpar, então o markdown não conta no tamanho", () => {
    expect(plainTextExcerpt("## Título longo demais aqui", 12)).toBe("Título longo…");
    expect(plainTextExcerpt("**curto**", 5)).toBe("curto");
  });
});
