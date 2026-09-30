# Plano T3 v3

30/09/2026 · Felipe + Claude · fork `feliperocha-prog/t3code`, branch `pt-br`

## Objetivo

O T3 original é feito por devs pra devs: cada tela assume que você sabe git, diff e terminal.
A v3 é o **painel de controle do Felipe** pra mandar a IA construir sem precisar dessa teoria:
esconde o que assusta, mostra o que hoje fica invisível (em que pé está cada conversa, o que
precisa de você, quanto está custando, se está no ar) e ensina o jargão de passagem.

Metade do "melhor" não é tela, é comportamento — e isso já mora nas regras do Claude Code
(bloco STATUS, revisor antes de entregar, hubs, "faz tudo"). O app **lê** essas convenções e
transforma em cartão, botão e lista.

## Decisões fechadas (30/09)

| Decisão                      | Escolha do Felipe                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acompanhar o original?       | **Não.** Sincronizar uma vez com a 0.0.44 e congelar. No máximo 1× por mês olhar o que eles lançaram e puxar item específico, à mão.                                           |
| Ritmo                        | Ondas: várias funcionalidades = uma instalação. ~30 min do Felipe por onda.                                                                                                    |
| Vocabulário git              | **Bilíngue sempre**: palavra simples + técnica pequena e cinza (`Publicar` · push).                                                                                            |
| Diff (código vermelho/verde) | Fica. Resumo em português entra **em cima**, não no lugar.                                                                                                                     |
| Terminal                     | Nunca é obrigação do Felipe. Permissão aparece na conversa com botão.                                                                                                          |
| Uso e limites                | Cantinho fixo com o limite semanal do Fable **e** o limite da sessão do Claude Code; tela de uso inteira bonita e minimalista.                                                 |
| Autonomia                    | Felipe aprova tudo de antemão. Claude decide o técnico e só chama o Felipe pra: instalar/testar cada onda, gosto pessoal (cor, texto, posição) e dúvida real sobre o objetivo. |
| Voz                          | Fora — Wispr Flow já resolve.                                                                                                                                                  |

## Base: sincronizar e congelar

1. Trazer a `v0.0.44` do original pro `pt-br` **uma vez** (tag já está no PC). Vale porque traz: conserto do terminal no Windows após a troca do `node-pty`, conserto de travamento do PTY no Windows, digitação 195× mais rápida, Sonnet 5.5, vários consertos na tela de uso.
2. Regra de conflito: código = versão do original; por cima, reaplicar o nosso (`t()`/`tc()` nas strings, abas, rótulo Terminal, folha de atalhos, Ctrl+I, toasts do git em pt-BR, workflow do instalador).
3. Depois disso, `upstream` vira só consulta mensal.

## Os 3 piores momentos do Felipe (entrevista de 30/09) → o que mata cada um

| Dor                                                                      | Mata                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| "Esqueci o objetivo da conversa, por rodar muitas de mais de um projeto" | Onda 1                                                            |
| "Errou algo que se repensasse não tinha errado"                          | Onda 4                                                            |
| "Não entendi o que me falou"                                             | Ondas 3 (bilíngue) e 5 (glossário) + regra "explicar pra não-dev" |

## Onda 1 — Nunca mais perder o fio

**O que você vê**

- **Objetivo da conversa** fixo no topo (1 linha). Ao criar a conversa, campo "Objetivo"; se ficar vazio, a IA propõe a partir da primeira mensagem e você edita. Aparece também ao passar o mouse na aba.
- **Cartão de estado** logo abaixo, sempre visível sem rolar: `STATUS · VOCÊ · EU`, lido do último bloco STATUS da resposta da IA. Clicar leva à mensagem de origem. Resposta sem bloco → cartão mostra "sem estado" (e a regra cobra a IA).
- **Caixa de entrada** na barra lateral: filtros **Esperando você** (STATUS aguardando/bloqueado) · **Trabalhando** (agente rodando) · **Acabou** (pronto). Ordem: o que precisa de você primeiro. "Concluídas" sai da visão padrão.
- **Página inicial do projeto** (ao abrir um projeto sem conversa selecionada): Estado / Próximo passo / Armadilhas lidos do hub do vault (`Projetos/<nome>/HUB.md`), "como rodar / como publicar" do README ou AGENTS.md em passos, e as 3 últimas conversas com o estado de cada uma.

**Confirmado (30/09)**: o estado "trabalhando / esperando aprovação / esperando input / pronto / falhou" já existe no modelo leve da barra lateral, com prioridade definida; o que falta é o filtro (hoje não há filtro por estado) e um campo novo nesse modelo pro texto do STATUS (o texto da última resposta só existe ao abrir a conversa). Notificação de "terminou / precisa de você" já existe, só vem **desligada de fábrica** e sem o texto do STATUS — a Onda 1 liga por padrão e põe o STATUS no aviso (antecipa parte da Onda 5).

**Como testar**: criar conversa → ver objetivo; mandar tarefa → cartão muda pra "trabalhando"; IA responde com STATUS → cartão atualiza; filtro "Esperando você" só mostra o que pede ação; abrir o projeto MATRIX → página inicial com o hub.

**Desenho técnico (fechado 30/09, worktree `t3code-wt/onda-1`, branch `t3top/onda-1`)**

- **Cartão de estado** nasce no servidor: ao gravar uma resposta completa da IA (`thread.message-sent`, role assistant, não streaming), o projetor extrai o **último** bloco `STATUS: / VOCÊ: / EU:` do texto e guarda no modelo leve da thread (`statusCard`: tipo `pronto | bloqueado | aguardando | outro`, os 3 textos cortados em 200 caracteres, id da mensagem). Parser compartilhado em `packages/shared` (servidor e web usam o mesmo). Campo opcional no contrato (cliente novo × servidor velho). Cliente não precisa de nada: o shell inteiro já é reenviado.
- **Objetivo** é campo novo da thread (`objective`), editável pelo mesmo comando de renomear (`thread.meta.update`), gravado no shell. Sem campo na criação: a linha aparece no cabeçalho assim que a conversa existe; se ficar vazia, a **mesma** chamada que gera o título no 1º turno devolve também `objective` (JSON `{title, objective, needsRefinement}`), sem custo extra. Editar à mão trava (`objectiveState.source = "manual"`).
- **Caixa de entrada**: filtro ao lado do escopo de projeto, 4 valores: Tudo (padrão) · Esperando você · Trabalhando · Acabou. Classificação a partir do shell: Esperando você = aprovação pendente, input pendente, falha, ou `statusCard` bloqueado/aguardando; Trabalhando = sessão rodando/iniciando; Acabou = `statusCard` pronto sem sessão rodando, ou concluída. Dentro da seção ativa, "Esperando você" sobe primeiro. Seção "Concluídas" começa recolhida.
- **Página inicial do projeto**: configuração global "Pasta do vault" + por projeto "Nota de estado (relativa ao vault)", padrão `Projetos/<nome da pasta>/HUB.md`. Leitura pelo RPC de arquivo que já existe, com `cwd` = pasta do vault (ele só valida que o caminho não escapa da pasta). Renderiza as seções `## Estado`, `## Próximo passo`, `## Armadilhas` do hub; do README/AGENTS.md só as seções cujo título casa com rodar/run/deploy/publicar; e as 3 últimas conversas do projeto com o cartão de estado de cada uma. Fica na tela de rascunho (sem conversa), abaixo do compositor, no lugar dos cartões "primeiros passos".
- **Notificação**: padrão passa de `off` pra `notifications`; o aviso de "terminou / precisa de você" leva o texto do `statusCard`.
- Bloco STATUS na própria resposta vira cartão compacto (só quando o bloco de código fechou; só na resposta da IA, não em raciocínio/review).
- Mobile não muda (campos opcionais; ele ignora).

## Onda 2 — Sem terminal

**O que você vê**

- Quando o Claude Code pede permissão (comando, arquivo, rede), aparece **na conversa** um cartão com **Liberar** · **Negar** · **Liberar tudo que eu pedi nesta conversa**. Nada de abrir terminal.
- Botão **"Faz tudo neste bloco"** por conversa, mostrando o que ele cobre e o que continua pedindo (publicar, juntar/merge, escrita em sistema vivo, apagar, gasto de API).
- **Botões de resposta**: quando o STATUS é "aguardando sua aprovação" e o VOCÊ é binário, aparecem **Sim** · **Não** · **Ajustar** que enviam o texto por você.

**Confirmado (mapeamento de 30/09)**: o T3 já recebe e responde os pedidos de permissão do Claude Code e do Codex de ponta a ponta, com 4 modos por conversa e padrão por projeto — e o padrão de fábrica já é **acesso total** (`full-access` → o Claude Code roda sem perguntar). Ou seja: dentro do T3 o "libera tudo que eu pedi" já é o comportamento; o que falta é (a) o cartão dentro da conversa (hoje é só uma faixa acima da caixa de mensagem que some depois da resposta), (b) histórico das decisões, (c) o botão "Faz tudo" ser a tradução visível desses modos. Se o Felipe está abrindo terminal por bloqueio, o bloqueio vem das sessões do Claude Code no terminal (classificador), não do T3 — a Onda 2 fica menor que o previsto.

**Como testar**: pedir algo que exige permissão → cartão aparece na conversa e "Liberar" destrava; ligar "Faz tudo" → não pergunta mais dentro da lista coberta.

## Onda 3 — Git humano

**O que você vê**

- **Rótulos bilíngues** em todo botão de git: `Salvar versão` · commit · `Publicar` · push · `Juntar` · merge · `Pedido de revisão` · PR · `Cópia separada` · worktree. Técnica pequena e cinza; passar o mouse explica em 1 linha (base do glossário da Onda 5).
- **Quadro de PRs** por projeto: título, estado em português (_Esperando o André_ · _Aprovado_ · _Checagem falhando_ · _Já no ar_), botão abrir. Refaz a tela de PRs que já existe no rodapé. **Confirmado**: o T3 já guarda por PR estado, rascunho, revisão, checagens e mergeabilidade, atualizando a cada 1 min — é só desenho + aviso quando o PR muda (checagem falhou, juntado), que hoje não existe.
- **"Está no ar?"** por projeto: última publicação e quando; o que está no PC e ainda não subiu (arquivos alterados e versões não publicadas) em português.
- **"Explicar mudanças"** em cima do diff: por arquivo, o que mudou, o que isso muda pro negócio, risco verde/amarelo/vermelho. O código continua embaixo.
- **Linha do tempo**: cada rodada da IA vira um ponto; **"Voltar pra aqui"** desfaz tudo depois dele. **Confirmado**: o T3 já grava um ponto próprio (ref git escondida) a cada rodada e tem botão de voltar em cada mensagem sua, com "voltar arquivos também" ou "só a conversa". Falta: refazer depois de voltar, ponto com nome, e — importante — voltar arquivos exige que a conversa tenha **cópia separada (worktree) própria**, então a "pasta separada automática" (Onda 6) sobe pra cá como pré-requisito.

**Como testar**: mexer num arquivo → "Está no ar?" acusa; abrir PR do matrix → estado certo no quadro; clicar "Explicar mudanças" → resumo em português; "Voltar pra aqui" → arquivos voltam.

## Onda 4 — Confiança

**O que você vê**

- **Time visível**: o painel de subagentes ganha nomes simples (_Pensando · Construindo · Lendo · Revisando_); o que o revisor achou vira **lista de defeitos** com botão "Corrigir".
- **Checklist antes de publicar**: ao clicar Publicar, roda build, revisor, busca de segredo no código e teste de leitura real; cada item verde/vermelho; o botão só libera com tudo verde (ou com "publicar mesmo assim", explicando o risco).
- **Regras (sem app)**: a IA testa o que fez abrindo o site e mandando print como prova; antes de tarefa abstrata, a IA entrevista primeiro (3-5 perguntas) e monta o pedido pra você aprovar.

**Como testar**: pedir uma tarefa com defeito proposital → revisor lista; tentar publicar com build quebrado → checklist barra.

## Onda 5 — Custo e memória

**O que você vê**

- **Cantinho de uso** fixo: limite semanal do Fable + limite da sessão do Claude Code, minimalista. Clique abre a tela de uso inteira, redesenhada.
- **Aviso de conversa pesada**: "esta conversa está cara, começa outra" quando o contexto passa do limite que a gente definir (95% do custo é releitura).
- **"Já falamos disso?"**: busca nas conversas antigas dentro do app (usa o `buscar-conversa.js` que já existe).
- **Glossário no mouse**: qualquer termo técnico na tela explica em 1 linha.
- **Aviso fora do app**: notificação do Windows quando uma conversa entra em "Esperando você". WhatsApp fica pra depois.

## Onda 6 — Extras

Rotinas agendadas com último resultado e "rodar agora" · resultado de BigQuery vira tabela no app (só leitura) · galeria de imagens e HTML gerados · regras de comportamento como lista com liga/desliga e botão "isso foi ruim" · cópia separada automática por conversa · assistente de projeto novo no padrão Moon · preview embutido do site com antes × depois · tela dividida (Etapa 3 do plano antigo).

## Regras de comportamento que não dependem do app

Entram no `CLAUDE.md` global antes de qualquer instalação:

1. Testar o que construiu abrindo no navegador e entregando print como prova (deploy verde não é sistema funcionando).
2. Tarefa abstrata → entrevistar primeiro, com palpites pra ele só confirmar, e montar o pedido.
3. Toda resposta sai com o bloco STATUS (já vale) — a Onda 1 depende disso.

## Como cada onda chega até você

1. Eu construo numa cópia separada (worktree), passo pelo revisor, gero o instalador no GitHub (~10 min).
2. Te mando: link do .exe + tabela "o que testar / o que tem que acontecer" (como a de 30/09).
3. Você instala (2 min; se o Windows barrar, uso o outro arquivo do mesmo commit), testa 5 min, responde com número + print do que falhou.
4. Antes de construir tela grande, te mando mockup pra gosto (cor, texto, posição). Só isso te chama no meio.

## Riscos e o que fica de fora

- **Smart App Control** barra instalador sem assinatura de forma imprevisível → sempre 2 arquivos (CI e local) do mesmo commit.
- **Congelar** = o que o T3 lançar depois não vem sozinho. Revisita mensal, à mão.
- Itens marcados "a confirmar" dependem de como o T3 funciona por dentro (permissões, checkpoints); se não der do jeito desenhado, eu decido a alternativa e aviso.
- Limite semanal do Fable → o pensamento pesado (plano de cada onda) vai no Fable, a construção no Opus.
- Fora: ditado por voz.

## Progresso

- [x] Base sincronizada com a 0.0.44 e congelada (30/09: `pt-br` em `5b73e70700`; CI Linux em `85ffc074bd`: typecheck e todos os testes verdes, instalador verde; a formatação que faltava foi corrigida em `5b73e70700`)
- [x] Regras sem app no CLAUDE.md (30/09)
- [ ] Onda 1 (em construção desde 30/09) · [ ] Onda 2 · [ ] Onda 3 · [ ] Onda 4 · [ ] Onda 5 · [ ] Onda 6
