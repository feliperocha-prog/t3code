const dictionary: Readonly<Record<string, string>> = {
  // Onda 1 — Nunca mais perder o fio: cartão de estado
  "status card|Status": "Status",
  "status card|You": "Você",
  "status card|Me": "Eu",
  "status card|Working…": "Trabalhando…",
  "status card|Waiting on you: approve": "Esperando você: aprovar",
  "status card|Waiting on you: answer": "Esperando você: responder",
  "status card|Failed": "Falhou",
  "status card|No status": "sem estado",

  // Objetivo editável da conversa
  "thread objective|Objective": "Objetivo",
  "thread objective|Edit objective": "Editar objetivo",
  "thread objective|Conversation objective": "Objetivo da conversa",
  "thread objective|Failed to save the objective": "Falha ao salvar o objetivo",

  // Caixa de entrada da sidebar (chips de filtro)
  "sidebar inbox|Filter threads by status": "Filtrar threads por estado",
  "sidebar inbox|No threads match this filter": "Nenhum thread neste filtro",
  "Vault folder": "Pasta do vault",
  "vault folder": "pasta do vault",
  "Folder of your notes vault on this computer. The project home reads each project's state note from it.":
    "Pasta do seu vault de notas neste computador. A página inicial do projeto lê dela a nota de estado de cada projeto.",
  "State note": "Nota de estado",
  "Note in your vault that the project home reads for where we are, the next step and pitfalls. Relative to the vault folder.":
    "Nota do vault que a página inicial do projeto lê para mostrar onde estamos, o próximo passo e as armadilhas. Caminho relativo à pasta do vault.",
  // Página inicial do projeto (rascunho sem conversa)
  "project home|Project summary": "Resumo do projeto",
  "project home|Automatic summary · {time}": "Resumo automático · {time}",
  "project home|Redo summary": "Refazer resumo",
  "project home|Summarizing…": "Resumindo…",
  "project home|Automatic summary unavailable": "Resumo automático indisponível",
  "project home|Where we are": "Onde estamos",
  "project home|What is left": "O que falta",
  "project home|What could go wrong": "O que pode dar errado",
  "project home|Nothing pending in the hub.": "Nada pendente no hub.",
  "project home|Reading the hub…": "Lendo o hub…",
  "project home|Couldn't read the hub at {path}. If it doesn't exist yet, create it there.":
    "Não consegui ler o hub em {path}. Se ele ainda não existe, crie nesse lugar.",
  "project home|The hub has no Estado, Pendente or Armadilhas sections.":
    "O hub não tem as seções Estado, Pendente ou Armadilhas.",
  "project home|How to run and publish": "Como rodar e publicar",
  "project home|from {file}": "do {file}",
  "project home|Latest conversations": "Últimas conversas",
  "project home|Set the vault folder in Settings → General":
    "Configure a pasta do vault em Configurações → Geral",
  "project home|Open settings": "Abrir configurações",
  "project home|Reading the project files…": "Lendo os arquivos do projeto…",
  "project home|No README.md or AGENTS.md in this project.":
    "Este projeto não tem README.md nem AGENTS.md.",
  "project home|{file} has no section about running or publishing.":
    "O {file} não tem seção sobre rodar ou publicar.",
  "project home|No conversations in this project yet.": "Nenhuma conversa neste projeto ainda.",
};

export default dictionary;
