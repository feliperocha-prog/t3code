// Onda 1, visual pass: status strip, objective line, inbox filter and
// conversation text size.
const dictionary: Readonly<Record<string, string>> = {
  "status card|Go to the reply this came from": "Ir para a resposta de onde isso saiu",

  "thread objective|No objective yet — click to write one":
    "Sem objetivo ainda — clique para escrever",
  "thread objective|automatic": "automático",
  "thread objective|written by you": "escrito por você",
  "thread objective|Back to automatic": "Voltar ao automático",
  "thread objective|Claude goes back to writing and updating the objective":
    "O Claude volta a escrever e atualizar o objetivo",

  "sidebar inbox short|All": "Tudo",
  "sidebar inbox short|For you": "Pra você",
  "sidebar inbox short|Running": "Rodando",
  "sidebar inbox short|Ready": "Prontas",
  "sidebar inbox|All — every conversation": "Tudo — todas as conversas",
  "sidebar inbox|Waiting for you — conversations that need something from you":
    "Esperando você — conversas que pedem algo seu",
  "sidebar inbox|Working — conversations running right now":
    "Trabalhando — conversas rodando agora",
  "sidebar inbox|Done — finished conversations": "Acabou — conversas prontas",

  "Conversation text size": "Tamanho do texto da conversa",
  "conversation text size": "tamanho do texto da conversa",
  "Size of the conversation text only. Ctrl + mouse wheel over the conversation changes it too.":
    "Só o tamanho do texto da conversa. Ctrl + roda do mouse sobre a conversa também muda.",
  "chat text scale|Conversation text: {percent}": "Texto da conversa: {percent}",
};

export default dictionary;
