import { describe, expect, it } from "vite-plus/test";
import { dictionarySources, t, tc } from "./index";

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

  it("uses the context entry when one exists and plain t() otherwise", () => {
    expect(tc("pull request state", "Open")).toBe("Aberto");
    expect(t("Open")).toBe("Abrir");
    expect(tc("pull request state", "Settings")).toBe("Configurações");
  });
});

describe("dictionaries", () => {
  it("never translate the same English text two different ways", () => {
    const seen = new Map<string, readonly [string, string]>();
    const conflicts: string[] = [];
    for (const [source, dict] of dictionarySources) {
      for (const [key, value] of Object.entries(dict)) {
        const previous = seen.get(key);
        if (previous && previous[1] !== value) {
          conflicts.push(`${JSON.stringify(key)}: ${previous[0]} vs ${source}`);
        }
        seen.set(key, [source, value]);
      }
    }
    expect(conflicts).toEqual([]);
  });

  it("keep every placeholder of the English text in the translation", () => {
    const broken: string[] = [];
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [source, dict] of dictionarySources) {
      for (const [key, value] of Object.entries(dict)) {
        if (placeholders(key).join() !== placeholders(value).join()) {
          broken.push(`${source} ${JSON.stringify(key)}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});
