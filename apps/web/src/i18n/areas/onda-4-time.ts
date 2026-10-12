const dictionary: Readonly<Record<string, string>> = {
  // Subagents named by what they are doing; the technical role shows beside it
  "subagent role|Thinking": "Pensando",
  "subagent role|Building": "Construindo",
  "subagent role|Reading": "Lendo",
  "subagent role|Reviewing": "Revisando",
  "subagent role|Agent": "Agente",

  // Reviewer findings with a Fix button that sends the defect back to the AI
  "Reviewer approved": "Revisor aprovou",
  "Reviewer found 1 defect": "Revisor achou 1 defeito",
  "Reviewer found {count} defects": "Revisor achou {count} defeitos",
  "review fix|Fix": "Corrigir",
  "review fix|Fix all": "Corrigir todos",
  "review fix|Sent": "Enviado",
  "review fix|Fix the defect the reviewer pointed out and tell me what changed:":
    "Corrija o defeito apontado pelo revisor e me diga o que mudou:",
  "review fix|Fix the defects the reviewer pointed out and tell me what changed:":
    "Corrija os defeitos apontados pelo revisor e me diga o que mudou:",
};

export default dictionary;
