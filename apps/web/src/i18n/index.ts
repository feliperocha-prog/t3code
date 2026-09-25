import { ptBR } from "./pt-BR";

type TemplateVars = Readonly<Record<string, string | number>>;
type Dictionary = Readonly<Record<string, string>>;

// Every file in ./areas contributes its own dictionary, so parallel
// translation work never edits the same file.
const areaModules = import.meta.glob<{ default: Dictionary }>("./areas/*.ts", { eager: true });

export const dictionarySources: ReadonlyArray<readonly [string, Dictionary]> = [
  ["./pt-BR.ts", ptBR],
  ...Object.entries(areaModules).map(([path, module]) => [path, module.default] as const),
];

const messages: Dictionary = Object.assign({}, ...dictionarySources.map(([, dict]) => dict));

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
