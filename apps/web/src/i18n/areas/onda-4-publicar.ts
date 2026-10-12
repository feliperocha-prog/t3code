const dictionary: Readonly<Record<string, string>> = {
  // Publish checklist card
  "Secret in code": "Segredo no código",
  Tests: "Testes",
  Reviewer: "Revisor",
  "Before publishing": "Antes de publicar",
  "Checks the changes before they leave this machine.":
    "Confere as mudanças antes de saírem desta máquina.",
  "Could not read the changes: {error}": "Não deu pra ler as mudanças: {error}",
  "(large change, only part was checked)": "(mudança grande, conferi só parte)",
  "Nothing found": "Nada encontrado",
  "{count} possible secret(s): {places}": "{count} possível(is) segredo(s): {places}",
  "Reviewer did not respond: {error}": "Revisor não respondeu: {error}",
  "No new change to review": "Sem mudança nova pra revisar",
  "{count} high-risk file(s): {paths}": "{count} arquivo(s) de risco alto: {paths}",
  "{count} medium-risk file(s)": "{count} arquivo(s) de risco médio",
  "No risky file": "Nenhum arquivo de risco",
  "No build script in this project": "Projeto sem script de build",
  "Looking for the script…": "Procurando o script…",
  "No test script in this project": "Projeto sem script de testes",
  "Waiting for the build…": "Esperando o build…",
  "Running {name}…": "Rodando {name}…",
  "Could not run: {error}": "Não deu pra rodar: {error}",
  "Passed in {seconds}s": "Passou em {seconds}s",
  "Failed (timed out)": "Falhou (passou do tempo)",
  "Failed (code {code})": "Falhou (código {code})",
  "Show output": "Ver saída",
  "Hide output": "Esconder saída",
  "Blocked by: {reasons}. Publishing anyway is on you.":
    "Bloqueado por: {reasons}. Publicar assim mesmo é por sua conta.",
  "Publish anyway": "Publicar mesmo assim",
  "Published without passing the checklist": "Publicado sem passar na checklist",

  // Setting
  "Publish checklist": "Checklist antes de publicar",
  "publish checklist": "checklist antes de publicar",
  "Runs the secret scan, build, tests and reviewer before every publish (push).":
    "Roda segredo, build, testes e revisor antes de cada publicação (push).",
  "Run the checklist before publishing": "Rodar a checklist antes de publicar",
};

export default dictionary;
