import { describe, expect, it } from "vite-plus/test";
import { t } from "./index";

describe("t", () => {
  it("returns the Portuguese entry for a known English string", () => {
    expect(t("Settings")).toBe("Configurações");
  });

  it("falls back to the English text when there is no entry", () => {
    expect(t("A string nobody translated")).toBe("A string nobody translated");
  });

  it("fills placeholders after the lookup and keeps unknown ones", () => {
    expect(t("Reconnect {label} to change its settings.", { label: "Casa" })).toBe(
      "Reconecte Casa para alterar as configurações dele.",
    );
    expect(t("{count} left, {other}", { count: 3 })).toBe("3 left, {other}");
  });
});
