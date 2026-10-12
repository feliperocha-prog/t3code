const dictionary: Readonly<Record<string, string>> = {
  // Git vocabulary: plain word shown beside the technical term
  "git term|Save a version": "Salvar versão",
  "git term|Publish": "Publicar",
  "git term|Update from GitHub": "Atualizar do GitHub",
  "git term|Join": "Juntar",
  "git term|Review request": "Pedido de revisão",
  "git term|Line of work": "Linha de trabalho",
  "git term|Separate copy": "Cópia separada",
  "git term|What changed": "O que mudou",
  "git term|Set aside": "Guardar de lado",
  "git term|Replay on top": "Reaplicar por cima",
  "git term|Switch to": "Trocar para",
  "git term|Review requests": "Pedidos de revisão",

  // Git vocabulary: one-line explanation on hover
  "git term help|Records a named snapshot of your files on this computer. Nothing leaves your PC.":
    "Grava uma foto nomeada dos seus arquivos neste computador. Nada sai do seu PC.",
  "git term help|Sends the saved versions to GitHub so others (and the deploy) can see them.":
    "Manda as versões salvas para o GitHub, para que os outros (e o deploy) vejam.",
  "git term help|Brings versions others published into your copy.":
    "Traz para a sua cópia as versões que outras pessoas publicaram.",
  "git term help|Brings one line of work into another, usually into the main one.":
    "Junta uma linha de trabalho em outra, normalmente na principal.",
  "git term help|A request for someone to review and approve your changes before they join the main line.":
    "Um pedido para alguém revisar e aprovar suas mudanças antes de entrarem na linha principal.",
  "git term help|A separate line of versions so you can work without touching the main one.":
    "Uma sequência separada de versões, para trabalhar sem mexer na principal.",
  "git term help|A separate folder with its own line of work, so two conversations never overwrite each other.":
    "Uma pasta separada com a própria linha de trabalho, para duas conversas nunca sobrescreverem uma à outra.",
  "git term help|Line-by-line comparison: red was removed, green was added.":
    "Comparação linha a linha: vermelho saiu, verde entrou.",
  "git term help|Puts unsaved changes aside to recover later.":
    "Põe de lado as alterações não salvas, para recuperar depois.",
  "git term help|Re-applies your versions on top of the newest main line.":
    "Reaplica as suas versões por cima da linha principal mais nova.",
  "git term help|Opens another line of work in this folder.":
    "Abre outra linha de trabalho nesta pasta.",

  // Review requests: where each one stands
  "pull request status|Already live (joined)": "Já no ar (juntado)",
  "pull request status|Closed without joining": "Fechado sem juntar",
  "pull request status|Draft": "Rascunho",
  "pull request status|Checks failing": "Checagem falhando",
  "pull request status|Changes requested": "Pediram mudanças",
  "pull request status|Approved, not joined yet": "Aprovado, falta juntar",
  "pull request status|Has a conflict": "Com conflito",
  "pull request status|Awaiting review": "Esperando revisão",

  // Rewind dialog: what each option does to the files
  "Files go back to how they were at this message.":
    "Os arquivos ficam como estavam nesta mensagem.",
  "Files stay as they are now.": "Os arquivos ficam como estão agora.",
  "PR #{number}: {state}": "PR #{number}: {state}",

  // Project home: review requests and "Is it live?" blocks
  "project home|See all": "Ver todos",
  "project home|Is it live?": "Está no ar?",
  "deploy state|{count} file changed and not saved as a version yet":
    "{count} arquivo alterado e ainda não salvo como versão",
  "deploy state|{count} files changed and not saved as a version yet":
    "{count} arquivos alterados e ainda não salvos como versão",
  "deploy state|No unsaved changes": "Nenhuma alteração sem salvar",
  "deploy state|This line of work has never been published":
    "Esta linha de trabalho ainda não foi publicada nenhuma vez",
  "deploy state|{count} saved version not published yet":
    "{count} versão salva e ainda não publicada",
  "deploy state|{count} saved versions not published yet":
    "{count} versões salvas e ainda não publicadas",
  "deploy state|{count} version published by others that you haven't brought in yet":
    "{count} versão publicada por outros que você ainda não trouxe",
  "deploy state|{count} versions published by others that you haven't brought in yet":
    "{count} versões publicadas por outros que você ainda não trouxe",
  "deploy state|Everything published": "Tudo publicado",

  // Diff panel: "Explain changes" by the text model
  "Explain changes": "Explicar mudanças",
  "Diff too large to explain here": "Mudanças grandes demais pra explicar aqui",
  "What changed": "O que mudou",
  "Reading the changes…": "Lendo as mudanças…",
  "Worth testing by hand": "Vale testar na mão",
  "The patch was large; the explanation covers only the beginning.":
    "As mudanças eram muitas; a explicação cobre só o começo.",
  "The changes on screen are newer than this explanation.":
    "As mudanças na tela são mais novas que esta explicação.",
  Redo: "Refazer",
  "Low risk": "Risco baixo",
  "Medium risk": "Risco médio",
  "High risk": "Risco alto",
};

export default dictionary;
