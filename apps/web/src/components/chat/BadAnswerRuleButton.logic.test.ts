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

  // Escolha: `__` nunca é removido. "__negrito__" tem a mesma forma de
  // "__dirname__", e é melhor sobrar o marcador do que apagar código.
  it("nunca remove __, nem quando é negrito", () => {
    expect(plainTextExcerpt("edite __init__.py e use __dirname__", 220)).toBe(
      "edite __init__.py e use __dirname__",
    );
    expect(plainTextExcerpt("__negrito__ aqui", 220)).toBe("__negrito__ aqui");
  });

  it("troca link e imagem pelo texto visível", () => {
    expect(plainTextExcerpt("Veja [a doc](https://x.com/y) e ![print](img.png)", 220)).toBe(
      "Veja a doc e print",
    );
  });

  it("aceita parêntese dentro da URL do link", () => {
    expect(plainTextExcerpt("Veja [Foo](https://pt.wikipedia.org/wiki/Foo_(bar)) aqui", 220)).toBe(
      "Veja Foo aqui",
    );
  });

  it("corta depois de limpar, então o markdown não conta no tamanho", () => {
    expect(plainTextExcerpt("## Título longo demais aqui", 12)).toBe("Título longo…");
    expect(plainTextExcerpt("**curto**", 5)).toBe("curto");
  });
});
