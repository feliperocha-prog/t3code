const dictionary: Readonly<Record<string, string>> = {
  // Sidebar search: "Did we talk about this?" (old Claude Code conversations)
  "Did we talk about this? (Claude Code)": "Já falamos disso? (Claude Code)",
  "Old Claude Code conversations from the terminal. Click to copy the command that reopens the conversation.":
    "Conversas antigas do Claude Code no terminal. Clique pra copiar o comando que reabre a conversa.",
  "Could not search old conversations": "Não consegui buscar conversas antigas",
  "Command copied — paste it in the terminal inside the project folder":
    "Comando copiado — cole no terminal dentro da pasta do projeto",
  "Could not copy the command": "Não consegui copiar o comando",

  // Setting
  "Command for 'Did we talk about this?'": "Comando do 'Já falamos disso?'",
  "command for 'Did we talk about this?'": "comando do 'Já falamos disso?'",
  "Program that searches old Claude Code conversations. Empty turns it off.":
    "Programa que busca conversas antigas do Claude Code. Vazio desliga.",

  // Glossary on hover: plain word and one-line explanation of each technical term
  "git term|Text unit": "Pedaço de texto",
  "git term help|A small piece of text the AI counts to bill you and to measure the context.":
    "Pedacinho de texto que a IA conta pra cobrar e pra medir o contexto.",
  "git term|Conversation memory": "Memória da conversa",
  "git term help|Everything the AI remembers in this conversation; when it fills up, it forgets or gets expensive.":
    "Tudo que a IA está lembrando nesta conversa; quando enche, ela esquece ou fica cara.",
  "git term|Summarize": "Resumir",
  "git term help|Summarizes the conversation to free up space in the context.":
    "Resumir a conversa pra liberar espaço no contexto.",
  "git term|Helper": "Ajudante",
  "git term help|A helper the AI launches to do one part of the work.":
    "Ajudante que a IA lança pra fazer uma parte do trabalho.",
  "git term|Save point": "Ponto salvo",
  "git term help|A saved point to go back to later.": "Ponto salvo pra voltar depois.",
  "git term|Quick check": "Checagem rápida",
  "git term help|Automatic check for silly mistakes in the code.":
    "Verificação automática de erro bobo no código.",
  "git term|Assemble": "Montar o programa",
  "git term help|Puts the program together to see whether it compiles.":
    "Montar o programa pra ver se compila.",
  "git term|Put online": "Publicar no ar",
  "git term help|Publishes it for everyone to use.": "Publicar pra todo mundo usar.",
  "git term|Password or key": "Senha ou chave",
  "git term help|A password or key that must never go into the code.":
    "Senha ou chave que nunca pode ir pro código.",
};

export default dictionary;
