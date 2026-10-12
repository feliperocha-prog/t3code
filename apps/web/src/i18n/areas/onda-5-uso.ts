const dictionary: Readonly<Record<string, string>> = {
  // Sidebar corner: Claude's session and weekly limits
  "usage corner|Session": "Sessão",
  "usage corner|Week": "Semana",
  "Claude's 5-hour limit": "Limite de 5 horas do Claude",
  "Claude's weekly limit": "Limite semanal do Claude",
  "{percent}% used": "{percent}% usado",
  "resets in {time}": "zera em {time}",
  "resets now": "zera agora",
  "{label}: {percent}% used. See usage and limits": "{label}: {percent}% usado. Ver uso e limites",

  // Composer notice: the conversation has grown past the context threshold
  "This conversation is getting heavy ({percent}% of context).":
    "Esta conversa está pesada ({percent}% do contexto).",
  "Each message now costs more; it is best to start another conversation.":
    "Cada mensagem agora custa mais; o melhor é começar outra conversa.",
  "Start another conversation": "Começar outra conversa",
  "Compact this one": "Compactar esta",
  "Dismiss heavy conversation notice": "Fechar aviso de conversa pesada",

  // Settings: heavy conversation threshold
  "Heavy conversation warning (% of context)": "Aviso de conversa pesada (% do contexto)",
  "Warns when the conversation passes this share of the context. 0 turns it off.":
    "Avisa quando a conversa passa desse tanto do contexto. 0 desliga.",
  "Lower the heavy conversation warning": "Baixar o aviso de conversa pesada",
  "Raise the heavy conversation warning": "Subir o aviso de conversa pesada",
};

export default dictionary;
