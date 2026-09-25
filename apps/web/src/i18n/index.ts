import { ptBR } from "./pt-BR";

type TemplateVars = Readonly<Record<string, string | number>>;

const messages: Readonly<Record<string, string>> = ptBR;

/**
 * Translates a user-facing string. The English source text is the dictionary
 * key, so a screen that has not been translated yet keeps rendering English
 * and a stale entry can never hide the original wording. `{name}` placeholders
 * are filled from `vars` after the lookup so word order can differ per language.
 */
export function t(text: string, vars?: TemplateVars): string {
  const translated = messages[text] ?? text;
  if (!vars) return translated;
  return translated.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}
