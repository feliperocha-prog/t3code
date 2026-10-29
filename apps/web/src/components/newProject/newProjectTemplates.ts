/**
 * The files a project made from scratch starts with: README, .gitignore and a
 * CLAUDE.md carrying the Moon Ventures rules plus the chosen brand's identity.
 * The rule text is copied verbatim from the org standard; edit it there first.
 */

export type NewProjectBrand = "moon" | "minimal" | "hoomy";

export interface NewProjectBrandInfo {
  readonly id: NewProjectBrand;
  readonly label: string;
  /** The identity line as the org standard writes it. */
  readonly identity: string;
  /** Colors shown on the picker card, darkest first. */
  readonly swatches: ReadonlyArray<string>;
}

export const NEW_PROJECT_BRANDS: ReadonlyArray<NewProjectBrandInfo> = [
  {
    id: "moon",
    label: "Moon",
    identity:
      "**Moon:** `#EFF0F1 #000000 #292C2F #3F4347`; destaque `#FF7E1C #FF330F`. Untitled Sans.",
    swatches: ["#000000", "#292C2F", "#EFF0F1", "#FF7E1C", "#FF330F"],
  },
  {
    id: "minimal",
    label: "Minimal Club",
    identity:
      "**Minimal:** cinzas `#EFF0F1`–`#292C2F`; laranja `#F4762E` só destaque, texto sobre ele preto. Untitled Sans.",
    swatches: ["#292C2F", "#EFF0F1", "#F4762E"],
  },
  {
    id: "hoomy",
    label: "Hoomy",
    identity: "**Hoomy:** `#4D5878 #333C5E #1D2430 #0D1118`; CTA sempre `#0094FF`. Poppins.",
    swatches: ["#0D1118", "#1D2430", "#333C5E", "#4D5878", "#0094FF"],
  },
];

export interface NewProjectAnswers {
  readonly name: string;
  readonly purpose: string;
  readonly brand: NewProjectBrand;
  readonly owner: string;
}

/** Folder name for a project title: lowercase ASCII words joined by dashes. */
export function newProjectSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

function brandInfo(brand: NewProjectBrand): NewProjectBrandInfo {
  return NEW_PROJECT_BRANDS.find((info) => info.id === brand) ?? NEW_PROJECT_BRANDS[0]!;
}

const singleLine = (text: string) => text.trim().replace(/\s+/g, " ");

function readme(answers: NewProjectAnswers): string {
  return `# ${singleLine(answers.name)}

## O que faz

${answers.purpose.trim()}

## Dono

${singleLine(answers.owner)} · marca ${brandInfo(answers.brand).label}. O sistema é da empresa, não do autor.

## Como rodar

Ainda sem código. Quando houver, descreva aqui: como instalar as dependências, quais variáveis de ambiente ele lê (só os nomes; os valores ficam no Secret Manager) e o comando que sobe local.
`;
}

const GITIGNORE = `# Segredos nunca vão pro git: use o Secret Manager do GCP
.env
.env.*
!.env.example
*.pem
*-key.json
service-account*.json

# Dependências e build
node_modules/
dist/
build/
.next/
.venv/
__pycache__/

# Sistema e editor
.DS_Store
Thumbs.db
*.log
`;

// The Moon Ventures standard, minus the identity of the brands not chosen.
const MOON_RULES = `## Git
Repo privado na org Moon-Ventures, nunca pessoal. Commit desde o dia 1. README: o que faz, dono, como rodar. \`.gitignore\` cobre \`.env\`. Auditar histórico: segredo apagado segue no commit velho.

## Deploy
Só **Google Cloud da empresa**; nada de Vercel/conta pessoal. Fluxo: localhost → B.Ops → auditoria → GCP. **Já tem GCP liberado? Pode publicar.** Gate: dado ou usuário real.
- **Workload Identity**, sem chave de vida longa. Workflow em \`workflows-off/\` até liberar.
- Config em **arquivo versionado** (\`--env-vars-file\`): \`--set-env-vars\` quebra valor em vírgula.
- Projeto, URL, região e fuso **fora do código**.

## Banco
**Firestore** no sistema simples (sem custo fixo) · **Cloud SQL** se precisar de relação e junção (~R$78/mês). Supabase/Base44 nunca é final.
- **Login não depende do banco** — sessão própria.
- Em SQL: **protocolo Postgres, não SDK do provedor** — SDK prende e migrar vira reescrever tudo. Dado atrás de **uma** porta.
- Banco compartilhado: usuário criado aqui vale no sistema vizinho.
- Export truncado reporta sucesso: **confira a contagem**; depois \`setval\` nas sequências.
- Guarde o **conteúdo** do arquivo, não link que expira.

## Segurança e dados
- **NUNCA** commitar secret/\`.env\`/API key — só Secret Manager. Vazou → B.Ops na hora.
- Dado sensível (venda, cliente, financeiro, pessoal) só em infra Moon, **nunca em serviço não aprovado**. Endpoint com dado exige auth; menor privilégio.
- BigQuery: via B.Ops, SA do sistema, read-only; sem \`SELECT *\`, filtrar partição; job cobrado no projeto do app.
- Google: **ADC**, sem chave em arquivo. Secret com **prefixo do sistema**.

## Verificar
**Deploy verde não é sistema funcionando:** 200 na página não prova banco — teste **leitura real**. Leia o código de saída real, não o do \`tail\`. Redirect do OAuth, consentimento e compartilhar Drive/planilha: só no console.

## Não reinvente a roda
**Antes de construir, veja se o dado já está no lake** — pedido, venda, cliente e mídia já estão lá; não monte ingestão própria. Veja o **mapa de sistemas** do B.Ops e cheque: ClickUp · HubSpot · Looker · Gemini Pro. Cobre ~80%? Use. Paga nova → **Pitch de IA**. Registre o seu ao publicar.

## Nunca
Contratar pago por conta própria · ação destrutiva sem confirmação humana.
`;

function claudeMd(answers: NewProjectAnswers): string {
  const brand = brandInfo(answers.brand);
  return `# ${singleLine(answers.name)}

${answers.purpose.trim()}

Dono: ${singleLine(answers.owner)}. Marca: ${brand.label}.

Regras pra sistema feito com IA na Moon. Dúvida → **B.Ops** (Guilherme, Tcharlles, Juan, Bernardo). Doutrina no Solar System.

## Contexto
**Moon Ventures** (Grupo Minimal): holding DTC das marcas **Minimal Club** e **Hoomy**. Sistema é da empresa, não do autor.

## Identidade visual
Este projeto usa a identidade ${brand.label}. **Nunca invente logo, cor ou fonte.**
- ${brand.identity}

${MOON_RULES}`;
}

/** The three starter files, keyed by their path inside the new project. */
export function newProjectFiles(
  answers: NewProjectAnswers,
): ReadonlyArray<{ readonly relativePath: string; readonly contents: string }> {
  return [
    { relativePath: "README.md", contents: readme(answers) },
    { relativePath: ".gitignore", contents: GITIGNORE },
    { relativePath: "CLAUDE.md", contents: claudeMd(answers) },
  ];
}
