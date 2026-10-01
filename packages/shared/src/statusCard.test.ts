import { describe, expect, it } from "vite-plus/test";
import { parseStatusCard, STATUS_CARD_MAX_FIELD_LENGTH } from "./statusCard.ts";

describe("parseStatusCard", () => {
  it("reads a block wrapped in a code fence", () => {
    const text = [
      "Build passou.",
      "",
      "```",
      "STATUS: pronto",
      "VOCÊ: nada",
      "EU: nada, acabou",
      "```",
    ].join("\n");
    expect(parseStatusCard(text)).toEqual({
      kind: "pronto",
      status: "pronto",
      voce: "nada",
      eu: "nada, acabou",
    });
  });

  it("reads a loose block at the end of the reply", () => {
    const text =
      "Falta a chave.\nSTATUS: bloqueado\nVOCÊ: gerar a chave no console\nEU: aplicar a chave quando chegar";
    expect(parseStatusCard(text)).toEqual({
      kind: "bloqueado",
      status: "bloqueado",
      voce: "gerar a chave no console",
      eu: "aplicar a chave quando chegar",
    });
  });

  it("tolerates bold markdown labels and inline code", () => {
    const text = [
      "**STATUS:** aguardando sua aprovação",
      "**VOCÊ:** aprovar o push para `master`",
      "**EU**: subir depois do sim",
    ].join("\r\n");
    expect(parseStatusCard(text)).toEqual({
      kind: "aguardando",
      status: "aguardando sua aprovação",
      voce: "aprovar o push para master",
      eu: "subir depois do sim",
    });
  });

  it("accepts the label without accent and in any case", () => {
    const card = parseStatusCard("STATUS: pronto\nvoce : nada\neu: nada");
    expect(card?.voce).toBe("nada");
    expect(card?.eu).toBe("nada");
    expect(parseStatusCard("STATUS: pronto\nVoCê: revisar")?.voce).toBe("revisar");
  });

  it("uses the last block when the reply has two", () => {
    const text = [
      "STATUS: bloqueado",
      "VOCÊ: liberar acesso",
      "EU: esperar",
      "",
      "Acesso chegou, segui.",
      "STATUS: pronto",
      "VOCÊ: nada",
      "EU: nada, acabou",
    ].join("\n");
    expect(parseStatusCard(text)?.kind).toBe("pronto");
    expect(parseStatusCard(text)?.voce).toBe("nada");
  });

  it("returns null for a reply without a block", () => {
    expect(parseStatusCard("Só uma resposta comum, sem estado.")).toBeNull();
    expect(parseStatusCard("")).toBeNull();
  });

  it("leaves missing fields empty and classifies unknown statuses as outro", () => {
    expect(parseStatusCard("STATUS: em andamento\nEU: continuar")).toEqual({
      kind: "outro",
      status: "em andamento",
      voce: "",
      eu: "continuar",
    });
  });

  it("only reads labels within six lines after STATUS", () => {
    const text = ["STATUS: pronto", "1", "2", "3", "4", "5", "6", "VOCÊ: tarde demais"].join("\n");
    expect(parseStatusCard(text)?.voce).toBe("");
  });

  it("cuts long fields and collapses inner whitespace", () => {
    const long = "palavra   ".repeat(60);
    const card = parseStatusCard(`STATUS: pronto\nVOCÊ: ${long}\nEU: nada`);
    expect(card?.voce.length).toBeLessThanOrEqual(STATUS_CARD_MAX_FIELD_LENGTH);
    expect(card?.voce.endsWith("…")).toBe(true);
    expect(card?.voce).not.toContain("  ");
  });

  it("lets bloqueado/aguardando win over pronto in a mixed status", () => {
    expect(parseStatusCard("STATUS: pronto pra subir, aguardando sua aprovação")?.kind).toBe(
      "aguardando",
    );
    expect(parseStatusCard("STATUS: bloqueado — quase pronto")?.kind).toBe("bloqueado");
    expect(parseStatusCard("STATUS: pronto")?.kind).toBe("pronto");
  });

  it("accepts Status in any case and with a list or quote prefix", () => {
    expect(parseStatusCard("Status: pronto\nVocê: nada\nEu: nada")).toEqual({
      kind: "pronto",
      status: "pronto",
      voce: "nada",
      eu: "nada",
    });
    expect(parseStatusCard("- STATUS: bloqueado\n- VOCÊ: liberar\n- EU: espero")?.voce).toBe(
      "liberar",
    );
    expect(parseStatusCard("> STATUS: pronto\n> EU: nada")?.eu).toBe("nada");
  });
});
