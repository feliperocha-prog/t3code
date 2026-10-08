const dictionary: Readonly<Record<string, string>> = {
  // STATUS strip: quick replies when the last answer waits on the user
  "quick reply|Yes": "Sim",
  "quick reply|No": "Não",
  "quick reply|Adjust": "Ajustar",
  "quick reply|Write what to change in the message box": "Escreva na caixa de mensagem o que mudar",
  "quick reply|Adjust: ": "Ajuste: ",

  // Mode pickers: what the agent may do on its own
  "runtime mode|Asks first": "Pergunta tudo",
  "runtime mode|Asks before commands and file changes.":
    "Pede sua liberação antes de rodar comandos e de mudar arquivos.",
  "runtime mode|Edits on its own": "Edita sozinho",
  "runtime mode|Changes files without asking; asks before commands.":
    "Muda arquivos sem perguntar; pede liberação para rodar comandos.",
  "runtime mode|Decides on its own": "Decide sozinho",
  "runtime mode|Approves routine actions itself and asks about the rest, on providers that support it.":
    "Libera sozinho o que é rotina e pergunta o resto (só nos provedores que suportam).",
  "runtime mode|Does everything": "Faz tudo",
  "runtime mode|Runs commands and changes files without asking.":
    "Roda comandos e muda arquivos sem perguntar.",
  "runtime mode|In any mode the agent's own rules can still make it ask first — for example before publishing, merging, deleting what it did not create, writing to live systems or spending on paid APIs.":
    "Em qualquer modo, as regras da própria IA ainda a fazem perguntar antes de publicar, fazer merge, apagar o que ela não criou, gravar em sistema vivo (HubSpot, Meta, Planilhas) ou gastar com API paga.",

  // Approval card in the composer
  "approval|Allow": "Liberar",
  "approval|Deny": "Negar",
  "approval|Allow for this conversation": "Liberar nesta conversa",
  "approval|Allows this kind of request until the conversation ends. Other requests still ask.":
    "Libera este tipo de pedido até o fim da conversa. Os outros pedidos continuam perguntando.",
  "approval|The agent wants to run a command": "A IA quer rodar um comando",
  "approval|The agent wants to read a file": "A IA quer ler um arquivo",
  "approval|The agent wants to change a file": "A IA quer mudar um arquivo",
  "approval|The agent asks for a permission": "A IA pede uma permissão",
  "approval|An app wants access": "Um app quer acesso",
};

export default dictionary;
