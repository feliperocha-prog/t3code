const dictionary: Readonly<Record<string, string>> = {
  // Timeline: subagent spawn summary
  "{count} subagent": "{count} subagente",
  "{count} subagents": "{count} subagentes",
  "{count} batch": "{count} lote",
  "{count} batches": "{count} lotes",
  "{count} subagent batch": "{count} lote de subagentes",
  "{count} subagent batches": "{count} lotes de subagentes",
  " and ": " e ",
  subagents: "subagentes",
  "Launched {subjects}": "Iniciou {subjects}",
  "Kicked off {subjects}": "Disparou {subjects}",
  "Ran {subjects}": "Executou {subjects}",
  "✓ completed": "✓ concluído",
  "{count} working": "{count} trabalhando",
  working: "trabalhando",
  "Workflow failed": "O workflow falhou",
  "Workflow stopped": "O workflow parou",
  "{count} failed": "{count} com falha",
  "{count} stopped": "{count} parados",
  "{count} idle": "{count} ociosos",
  "Status unavailable": "Status indisponível",

  // Timeline: assistant citations and selection toolbar
  "View cited assistant text: {label}": "Ver o texto citado do assistente: {label}",
  "View source": "Ver origem",
  "Edit citation comment": "Editar comentário da citação",
  "Add comment to citation": "Adicionar comentário à citação",
  "Comment on selected text": "Comentar o texto selecionado",
  "Enter to save the citation comment; Command/Ctrl+Enter to save and send; Shift+Enter for a new line.":
    "Enter salva o comentário da citação; Command/Ctrl+Enter salva e envia; Shift+Enter insere uma nova linha.",
  "Add an optional comment...": "Adicione um comentário opcional...",
  "Comments can contain up to {count} characters.":
    "Os comentários podem ter até {count} caracteres.",
  "Shorten comment": "Encurte o comentário",
  Save: "Salvar",
  "Could not open the cited response": "Não foi possível abrir a resposta citada",
  "Click the citation to try again.": "Clique na citação para tentar de novo.",
  "The quoted text has changed": "O texto citado mudou",
  "Showing the source response. The saved quote is unchanged.":
    "Mostrando a resposta de origem. A citação salva não mudou.",
  "Selection is too long to cite": "A seleção é longa demais para citar",
  "Cite selection in composer": "Citar a seleção no composer",
  "Shorten selection": "Encurte a seleção",
  Cite: "Citar",

  // Timeline: changed files tree
  "{count} changed file": "{count} arquivo alterado",
  "{count} changed files": "{count} arquivos alterados",
  "Collapse all folders": "Recolher todas as pastas",
  "Expand all folders": "Expandir todas as pastas",
  "Open diff": "Abrir diff",
  "Open the full diff": "Abrir o diff completo",

  // Chat header
  "Thread title cannot be empty": "O título da thread não pode ficar vazio",
  "Failed to rename thread": "Não foi possível renomear a thread",
  "An error occurred.": "Ocorreu um erro.",
  "Project settings": "Configurações do projeto",
  "Thread breadcrumb": "Navegação da thread",
  "New thread in {project}": "Nova thread em {project}",
  "Thread title": "Título da thread",
  "Thread actions for {title}": "Ações da thread {title}",
  "More header actions": "Mais ações do cabeçalho",
  "Header actions": "Ações do cabeçalho",

  // Composer: mode and access controls
  "More composer controls": "Mais controles do composer",
  Mode: "Modo",
  Chat: "Chat",
  Plan: "Plan",
  Access: "Acesso",
  Supervised: "Supervisionado",
  "Auto-accept edits": "Aceitar edições automaticamente",
  Auto: "Automático",
  "Full access": "Acesso total",

  // Composer: attachments and notices
  "Waiting for the server before file attachments can send":
    "Aguardando o servidor para poder enviar arquivos anexados",
  "This server does not accept file attachments right now. Remove the files to send.":
    "Este servidor não aceita arquivos anexados agora. Remova os arquivos para enviar.",
  "Show other notices": "Mostrar outros avisos",
  "Other notices": "Outros avisos",
  "Show notice details": "Mostrar detalhes do aviso",
  "Notice details": "Detalhes do aviso",
  "Dismiss warning": "Dispensar aviso",
  "Could not copy thread ID": "Não foi possível copiar o ID da thread",
  "Copy ID": "Copiar ID",
  "Dismiss feedback notice": "Dispensar aviso de feedback",

  // Composer: command menu
  "Searching workspace skills...": "Buscando skills do workspace...",
  "Finding pull request...": "Procurando pull request...",
  "Searching workspace files...": "Buscando arquivos do workspace...",
  "No skills found. Try / to browse provider commands.":
    "Nenhuma skill encontrada. Use / para ver os comandos do provedor.",
  "No matching files or folders.": "Nenhum arquivo ou pasta encontrado.",
  "No matching command.": "Nenhum comando encontrado.",
  App: "App",
  Repo: "Repositório",
  Personal: "Pessoal",
  Provider: "Provedor",
  "{source} skill": "Skill ({source})",

  // Composer: approvals
  Decline: "Recusar",
  "Always allow this session": "Sempre permitir nesta sessão",
  Approve: "Aprovar",
  "More approval options": "Mais opções de aprovação",
  "App access approval": "Aprovação de acesso do app",
  "Command approval": "Aprovação de comando",
  "File read approval": "Aprovação de leitura de arquivo",
  "App permission approval": "Aprovação de permissão do app",
  "File change approval": "Aprovação de alteração de arquivo",
  "App access request": "Pedido de acesso do app",
  Command: "Comando",
  "File to read": "Arquivo a ler",
  "Permission request": "Pedido de permissão",
  "File change": "Alteração de arquivo",

  // Composer: agent questions and primary actions
  "Show the question and its options": "Mostrar a pergunta e as opções",
  "Hide the question and its options": "Ocultar a pergunta e as opções",
  "Dismiss question without answering": "Dispensar a pergunta sem responder",
  "Select one or more options.": "Selecione uma ou mais opções.",
  "Plan ready": "Plano pronto",
  "Submitting...": "Enviando...",
  Submit: "Enviar",
  "next question|Next": "Próxima",
  "Next question": "Próxima pergunta",
  "Submit answers": "Enviar respostas",
  "Submit answer": "Enviar resposta",
  "Stop generation": "Parar a geração",
  "Previous question": "Pergunta anterior",
  Previous: "Anterior",
  "Sending...": "Enviando...",
  Refine: "Refinar",
  Implement: "Implementar",
  "Implementation actions": "Ações de implementação",
  "Implement in a new thread": "Implementar em uma nova thread",
  "Environment disconnected": "Ambiente desconectado",
  Connecting: "Conectando",
  "Preparing worktree": "Preparando o worktree",
  Sending: "Enviando",
  "Queue message": "Colocar mensagem na fila",
  "Send message": "Enviar mensagem",

  // Composer: server update and stash
  server: "servidor",
  "Could not update the {server}": "Não foi possível atualizar o {server}",
  "Updating the {server}": "Atualizando o {server}",
  "Stashed prompts: {count}. Open stash.": "Prompts no stash: {count}. Abrir o stash.",
  Stash: "Stash",
  "Close stash": "Fechar o stash",
  "Stashed prompts": "Prompts no stash",
  "Nothing stashed yet.": "Nada no stash ainda.",
  " Press {shortcut} with a prompt in the composer to stash it.":
    " Pressione {shortcut} com um prompt no composer para guardá-lo no stash.",
  "Restore stashed prompt: {snippet}": "Restaurar prompt do stash: {snippet}",
  "saving {count} image…": "salvando {count} imagem…",
  "saving {count} images…": "salvando {count} imagens…",
  "{count} image dropped": "{count} imagem descartada",
  "{count} images dropped": "{count} imagens descartadas",
  "Delete stashed prompt": "Excluir prompt do stash",

  // Composer: prompt length, tasks and usage limits
  "Prompt is {count} character over the {limit}-character limit. Shorten or split it before sending.":
    "O prompt passa {count} caractere do limite de {limit} caracteres. Encurte ou divida antes de enviar.",
  "Prompt is {count} characters over the {limit}-character limit. Shorten or split it before sending.":
    "O prompt passa {count} caracteres do limite de {limit} caracteres. Encurte ou divida antes de enviar.",
  Pending: "Pendente",
  Running: "Em execução",
  Completed: "Concluído",
  Tasks: "Tarefas",
  "Collapse tasks": "Recolher tarefas",
  "{label}: {completed} of {total} complete. Current task: {step}":
    "{label}: {completed} de {total} concluídas. Tarefa atual: {step}",
  "Task list. {completed} of {total} complete.":
    "Lista de tarefas. {completed} de {total} concluídas.",
  "Toggle account label visibility": "Mostrar ou ocultar a conta",
  "Click to reveal account": "Clique para mostrar a conta",
  "Click to hide account": "Clique para ocultar a conta",
  "{count} accounts": "{count} contas",
  "Usage limits": "Limites de uso",
  "Dismiss usage limits": "Dispensar limites de uso",

  // Composer: context window meter
  "Compacts automatically at {count} tokens.": "Compacta automaticamente em {count} tokens.",
  "Context for {model} compacts automatically when needed.":
    "O contexto do {model} é compactado automaticamente quando necessário.",
  "Context compacts automatically when needed.":
    "O contexto é compactado automaticamente quando necessário.",
  "Context window {percentage} used": "Janela de contexto {percentage} usada",
  "Context window {count} tokens used": "Janela de contexto com {count} tokens usados",
  "Context Window": "Janela de contexto",
  "Context window usage": "Uso da janela de contexto",
  "Total processed": "Total processado",
  "Compact context": "Compactar contexto",

  // Chat: draft hero headline
  "Choose a project": "Escolha um projeto",
  "New project": "Novo projeto",
  "Add a project": "Adicione um projeto",
  "What should we build in {project}?": "O que vamos construir em {project}?",
  "{project} to start": "{project} para começar",
  "Add a project to start": "Adicione um projeto para começar",
  "What should we build in": "O que vamos construir em",
  "to start": "para começar",

  // Chat: expanded media preview
  "Show screenshot": "Mostrar captura de tela",
  "Show accessibility JSON": "Mostrar JSON de acessibilidade",
  "Show extracted text": "Mostrar texto extraído",
  "Expanded video preview": "Visualização ampliada do vídeo",
  "Expanded image preview": "Visualização ampliada da imagem",
  "Previous media": "Mídia anterior",
  "Close video preview": "Fechar a visualização do vídeo",
  "Close image preview": "Fechar a visualização da imagem",
  "This image could not be loaded.": "Não foi possível carregar esta imagem.",
  "Image unavailable. The file may have been moved or deleted.":
    "Imagem indisponível. O arquivo pode ter sido movido ou excluído.",
  "Next media": "Próxima mídia",

  // Chat: media, links and copy
  "Reconnect to this environment and open the media again.":
    "Reconecte a este ambiente e abra a mídia de novo.",
  "The environment returned an invalid media URL.":
    "O ambiente retornou uma URL de mídia inválida.",
  "Open in integrated browser": "Abrir no navegador integrado",
  "Open in system browser": "Abrir no navegador do sistema",
  "Copy Link": "Copiar link",
  "Unlink from thread": "Desvincular da thread",
  "Copy message": "Copiar mensagem",

  // Timeline: work log labels
  "{path} +{count} more": "{path} e mais {count}",
  command: "comando",
  "Running {program}": "Executando {program}",
  "Failed {program}": "Falhou: {program}",
  "Declined {program}": "Recusado: {program}",
  "Stopped {program}": "Parado: {program}",
  "Ran {program}": "Executou {program}",
  "You stopped after {duration}": "Você parou após {duration}",
  "You stopped this response": "Você parou esta resposta",
  "Worked for {duration}": "Trabalhou por {duration}",
  Worked: "Trabalhou",

  // Composer: model picker
  "New model": "Modelo novo",
  New: "Novo",
  "Remove from favorites": "Remover dos favoritos",
  "Add to favorites": "Adicionar aos favoritos",
  "{provider} is unavailable in this thread. Start a new thread to switch providers.":
    "{provider} não está disponível nesta thread. Inicie uma nova thread para trocar de provedor.",
  "Search models...": "Buscar modelos...",
  "Legacy models": "Modelos antigos",
  "{count} models": "{count} modelos",
  "Set up {provider}": "Configurar {provider}",
  "Open provider setup": "Abrir a configuração do provedor",
  "No models found": "Nenhum modelo encontrado",
  "{label} — Disabled in settings.": "{label} — Desativado nas configurações.",
  Limited: "Limitado",
  "Not ready": "Não está pronto",
  Favorites: "Favoritos",
  "{provider} — New": "{provider} — Novo",

  // Chat header: open in editor
  "this machine": "esta máquina",
  "No SSH route to {environment}": "Sem rota SSH para {environment}",
  "No installed editors found": "Nenhum editor instalado encontrado",
  "Opens over SSH. Needs your key on {environment}":
    "Abre via SSH. Precisa da sua chave em {environment}",
  "Open in…": "Abrir em…",
  "Open in editor": "Abrir no editor",
  "Open file in preferred editor": "Abrir o arquivo no editor preferido",
  Open: "Abrir",
  "Choose editor": "Escolher editor",

  // Chat header: panel layout controls
  "Right panel is unavailable": "O painel direito não está disponível",
  "Toggle terminal drawer": "Mostrar ou ocultar o terminal",
  "Terminal drawer is unavailable": "O terminal não está disponível",
  "Toggle right panel, {count} agent working":
    "Mostrar ou ocultar o painel direito, {count} agente trabalhando",
  "Toggle right panel, {count} agents working":
    "Mostrar ou ocultar o painel direito, {count} agentes trabalhando",
  "Toggle right panel": "Mostrar ou ocultar o painel direito",
  "{count} agent working": "{count} agente trabalhando",
  "{count} agents working": "{count} agentes trabalhando",
  "Restore panel size": "Restaurar o tamanho do painel",
  "Maximize panel": "Maximizar o painel",

  // Timeline: proposed plan card
  "Could not copy plan": "Não foi possível copiar o plano",
  "An error occurred while copying.": "Ocorreu um erro ao copiar.",
  "Proposed plan": "Plano proposto",
  "Workspace path is unavailable": "O caminho do workspace não está disponível",
  "This thread does not have a workspace path to save into.":
    "Esta thread não tem um caminho de workspace para salvar.",
  "Enter a workspace path": "Informe um caminho no workspace",
  "Plan saved to workspace": "Plano salvo no workspace",
  "Could not save plan": "Não foi possível salvar o plano",
  "An error occurred while saving.": "Ocorreu um erro ao salvar.",
  "Plan actions": "Ações do plano",
  "Copied!": "Copiado!",
  "Copy to clipboard": "Copiar para a área de transferência",
  "Download as markdown": "Baixar como markdown",
  "Save to workspace": "Salvar no workspace",
  "Collapse plan": "Recolher o plano",
  "Expand plan": "Expandir o plano",
  "Save plan to workspace": "Salvar o plano no workspace",
  "Enter a path relative to": "Informe um caminho relativo a",
  "the workspace": "este workspace",
  "Workspace path": "Caminho no workspace",
  "Saving...": "Salvando...",

  // Composer: model picker trigger and provider status
  "Choose model": "Escolher modelo",
  "Choose models": "Escolher modelos",
  ", {count} more": ", mais {count}",
  "Open provider setup to install {provider} on this environment.":
    "Abra a configuração do provedor para instalar o {provider} neste ambiente.",
  "Open provider setup to sign in with Google.":
    "Abra a configuração do provedor para entrar com o Google.",
  "Open provider setup to sign in.": "Abra a configuração do provedor para entrar.",
  "Sign in via the CLI to authenticate again.": "Entre pela CLI para se autenticar de novo.",
  "No models are available for this provider.": "Nenhum modelo disponível para este provedor.",
  "{provider} provider is unavailable.": "O provedor {provider} não está disponível.",
  "{provider} provider has limited availability.":
    "O provedor {provider} está com disponibilidade limitada.",
  "{provider} is unauthenticated": "{provider} não está autenticado",
  "{provider} {version} is known to be broken": "{provider} {version} tem defeito conhecido",
  "{provider} {version} is unsupported": "{provider} {version} não é compatível",
  "{provider} provider status": "Status do provedor {provider}",
  "Dismiss {provider} provider error": "Dispensar o erro do provedor {provider}",
  "Dismiss {provider} provider warning": "Dispensar o aviso do provedor {provider}",
  "Dismiss {provider} provider {status}": "Dispensar o status {status} do provedor {provider}",

  // Composer: runtime mode descriptions
  "Ask before commands and file changes.": "Pergunta antes de comandos e alterações em arquivos.",
  "Auto-approve edits, ask before other actions.":
    "Aprova edições automaticamente e pergunta antes de outras ações.",
  "Supported providers approve routine actions; others still ask.":
    "Provedores compatíveis aprovam ações de rotina; os outros continuam perguntando.",
  "Allow commands and edits without prompts.": "Permite comandos e edições sem pedir confirmação.",

  // Composer: snapshot attachment details
  "Accessibility data": "Dados de acessibilidade",
  "No accessibility data": "Sem dados de acessibilidade",
  "View accessibility data": "Ver dados de acessibilidade",
  "Structured accessibility elements were included, but they have no readable names or values.":
    "Elementos de acessibilidade estruturados foram incluídos, mas não têm nomes nem valores legíveis.",
  "The app or capture backend did not provide verified accessibility data.":
    "O app ou o backend de captura não forneceu dados de acessibilidade verificados.",
  "Captured window": "Janela capturada",

  // Composer: terminal context chip and errors
  "Terminal excerpt, {label}": "Trecho do terminal, {label}",
  "Terminal excerpt, {label}, expired": "Trecho do terminal, {label}, expirado",
  "Line {line}": "Linha {line}",
  "Lines {start}–{end}": "Linhas {start}–{end}",
  "Captured terminal output": "Saída do terminal capturada",
  "Terminal context expired. Remove and re-add {label} to include it in your message.":
    "O contexto do terminal expirou. Remova e adicione {label} de novo para incluí-lo na mensagem.",
  "Dismiss error": "Dispensar erro",

  // Composer: traits picker
  Agent: "Agente",
  Effort: "Esforço",
  "Reasoning effort": "Esforço de raciocínio",
  Reasoning: "Raciocínio",
  Default: "Padrão",
  "Your prompt contains {keyword} in the text. Remove it to change this option.":
    "Seu prompt contém {keyword} no texto. Remova para alterar esta opção.",
  On: "Ligado",
  Off: "Desligado",
  Fast: "Rápido",
  Normal: "Normal",
  "Fast mode on": "Modo rápido ativado",

  // Timeline: citation navigation
  "Could not load the cited response": "Não foi possível carregar a resposta citada",
  "Load earlier turns, then click the citation to try again. Your saved quote is unchanged.":
    "Carregue os turnos anteriores e clique na citação para tentar de novo. A citação salva não mudou.",
  "The cited response is unavailable": "A resposta citada não está disponível",
  "It may have been removed. The selected text is still saved in your citation.":
    "Ela pode ter sido removida. O texto selecionado continua salvo na citação.",
  "The citation does not refer to an assistant response":
    "A citação não se refere a uma resposta do assistente",
  "The selected text is still saved in your citation.":
    "O texto selecionado continua salvo na citação.",

  // Composer: server update banner
  "Updating {count} machine": "Atualizando {count} máquina",
  "Updating {count} machines": "Atualizando {count} máquinas",
  "Could not update {count} machine": "Não foi possível atualizar {count} máquina",
  "Could not update {count} machines": "Não foi possível atualizar {count} máquinas",
  "Update available for {count} machine": "Atualização disponível para {count} máquina",
  "Update available for {count} machines": "Atualização disponível para {count} máquinas",
  "{title}. View machines": "{title}. Ver as máquinas",
  "Manual update required": "Atualização manual necessária",
  "Ready to update to {version}": "Pronto para atualizar para a {version}",
  "Reconnect this machine to update": "Reconecte esta máquina para atualizar",
  "{count} needs a manual update": "{count} precisa de atualização manual",
  "{count} need a manual update": "{count} precisam de atualização manual",
  Retry: "Tentar de novo",
  "Update {count} machine": "Atualizar {count} máquina",
  "Update {count} machines": "Atualizar {count} máquinas",
  "Dismiss update notice": "Dispensar aviso de atualização",

  // Timeline: worktree setup card
  "Setting up worktree…": "Preparando o worktree…",
  "Worktree ready, setup script failed": "Worktree pronto, mas o script de configuração falhou",
  "Worktree ready": "Worktree pronto",
  "Worktree setup failed": "Falha ao preparar o worktree",
  "Worktree setup cancelled": "Preparação do worktree cancelada",
  "Fetch base branch": "Buscar a branch base",
  "Check out files": "Fazer checkout dos arquivos",
  "Init submodules": "Iniciar submódulos",
  "Run setup script": "Rodar script de configuração",
  "Start agent": "Iniciar agente",
  skipped: "ignorado",
  Branch: "Branch",
  Base: "Base",
  Path: "Caminho",
  Setup: "Configuração",
  "Worktree setup": "Preparação do worktree",
  Details: "Detalhes",
  "Open terminal": "Abrir terminal",
  "Work locally": "Trabalhar localmente",

  // Chat: zoomable image
  "{name}, zoomable image": "{name}, imagem com zoom",
  "Click to zoom in or return to fit. Scroll to zoom, drag to pan. Use Enter to toggle zoom, plus or minus to zoom, and 0 to fit.":
    "Clique para ampliar ou voltar ao ajuste. Role para dar zoom e arraste para mover. Use Enter para alternar o zoom, mais ou menos para dar zoom e 0 para ajustar.",
  "{percent}% zoom": "Zoom de {percent}%",

  // Search: project contents
  "Search project contents": "Buscar no conteúdo do projeto",
  "Open file": "Abrir arquivo",
  "Search project contents…": "Buscar no conteúdo do projeto…",
  "Open a project to search its files.": "Abra um projeto para buscar nos arquivos dele.",
  "Search file contents in {project}": "Buscar no conteúdo dos arquivos de {project}",
  "Match case": "Diferenciar maiúsculas e minúsculas",
  "Match whole word": "Palavra inteira",
  "Use regular expression": "Usar expressão regular",
  "Search in {project}": "Buscar em {project}",
  "Searching…": "Buscando…",
  "Invalid regular expression": "Expressão regular inválida",
  "{count} results in {files} files": "{count} resultados em {files} arquivos",
  "No results found.": "Nenhum resultado encontrado.",
  "Type to search across your project.": "Digite para buscar em todo o projeto.",

  // Command palette: shell and results
  Close: "Fechar",
  Navigate: "Navegar",
  "No matching actions.": "Nenhuma ação encontrada.",
  "No matching commands, projects, or threads.": "Nenhum comando, projeto ou thread encontrado.",
  "You:": "Você:",
  "Agent:": "Agente:",
  "Current thread": "Thread atual",

  // App: quit overlay
  "Hold {shortcut} or press twice to quit": "Segure {shortcut} ou pressione duas vezes para sair",
  "Press {shortcut} again to quit": "Pressione {shortcut} de novo para sair",

  // Composer: pull request context
  "Pull request #{number}": "Pull request #{number}",

  // Composer: context chips
  "upload failed": "falha no envio",
  "attach again": "anexe de novo",
  "Preview video attachment, {name}, {size}": "Vídeo anexado, {name}, {size}",
  "File attachment, {name}, {size}": "Arquivo anexado, {name}, {size}",
  "{name} was not saved with this draft. Attach it again to send it.":
    "{name} não foi salvo com este rascunho. Anexe de novo para enviar.",
  "{count} element": "{count} elemento",
  "{count} elements": "{count} elementos",
  "{count} region": "{count} região",
  "{count} regions": "{count} regiões",
  "{count} drawing": "{count} desenho",
  "{count} drawings": "{count} desenhos",
  "{count} style change": "{count} mudança de estilo",
  "{count} style changes": "{count} mudanças de estilo",
  "Annotated preview crop": "Recorte anotado da visualização",
  "Screenshot unavailable": "Captura de tela indisponível",
  "This context is no longer available. Remove it or attach it again.":
    "Este contexto não está mais disponível. Remova ou anexe de novo.",
  "Review comment": "Comentário de revisão",
  "Preview annotation": "Anotação da visualização",
  "{label}. Show details": "{label}. Mostrar detalhes",
  "Open {kind} {label}: {title}": "Abrir {kind} {label}: {title}",
  "Image attachment, {name}, {size}": "Imagem anexada, {name}, {size}",
  "Unavailable context, {label}": "Contexto indisponível, {label}",

  // Thread status indicators
  "Terminal process running": "Processo do terminal em execução",
  "Stack of {count} pull requests, {state}": "Pilha de {count} pull requests, {state}",
  "PR #{number}, status pending": "PR #{number}, status pendente",
  "{tooltip}, and {count} more linked; overall {state}":
    "{tooltip} e mais {count} vinculados; no geral, {state}",
  "Worktree: {path} ({branch})": "Worktree: {path} ({branch})",
  "Worktree: {path}": "Worktree: {path}",
  Remote: "Remoto",

  // Composer: placeholder, plan preview and stash restore
  "Ask for changes, send follow-ups, or attach images":
    "Peça mudanças, envie novas mensagens ou anexe imagens",
  "Plan preview unavailable.": "Visualização do plano indisponível.",
  "image {index} (not saved before reload)": "imagem {index} (não salva antes de recarregar)",

  // Chat view: browser close, send blockers and rewind
  "Close browser while the agent is using it?": "Fechar o navegador enquanto o agente o usa?",
  "The agent is actively controlling this browser. Closing it may interrupt the current browser action.":
    "O agente está controlando este navegador agora. Fechar pode interromper a ação atual no navegador.",
  "Close {count} browsers while the agent is using them?":
    "Fechar {count} navegadores enquanto o agente os usa?",
  "The agent is actively controlling these browsers. Closing them may interrupt the current browser actions.":
    "O agente está controlando estes navegadores agora. Fechar pode interromper as ações atuais nos navegadores.",
  "New thread": "Nova thread",
  "Install Antigravity in provider settings before sending.":
    "Instale o Antigravity nas configurações do provedor antes de enviar.",
  "Sign in to Antigravity in provider settings before sending.":
    "Entre no Antigravity nas configurações do provedor antes de enviar.",
  "Choose an Antigravity model before sending.":
    "Escolha um modelo do Antigravity antes de enviar.",
  "Refresh Antigravity models in provider settings before sending.":
    "Atualize os modelos do Antigravity nas configurações do provedor antes de enviar.",
  "That Antigravity model is no longer available. Choose another model.":
    "Esse modelo do Antigravity não está mais disponível. Escolha outro modelo.",
  "The environment returned an invalid attachment URL.":
    "O ambiente retornou uma URL de anexo inválida.",
  "This message has an attachment that cannot be restored.":
    "Esta mensagem tem um anexo que não pode ser restaurado.",
  "Could not restore attachment: {name}": "Não foi possível restaurar o anexo: {name}",
  "Could not read image data.": "Não foi possível ler os dados da imagem.",
  "Failed to read image.": "Falha ao ler a imagem.",
  "Expired terminal context won't be sent": "O contexto expirado do terminal não será enviado",
  "Expired terminal contexts won't be sent":
    "Os contextos expirados do terminal não serão enviados",
  "Remove it or re-add it to include terminal output.":
    "Remova ou adicione de novo para incluir a saída do terminal.",
  "Expired terminal context omitted from message":
    "Contexto expirado do terminal omitido da mensagem",
  "Expired terminal contexts omitted from message":
    "Contextos expirados do terminal omitidos da mensagem",
  "Re-add it if you want that terminal output included.":
    "Adicione de novo se quiser incluir essa saída do terminal.",
  "Start a new chat to change models": "Comece um novo chat para trocar de modelo",
  "This provider does not allow switching models after a conversation has started.":
    "Este provedor não permite trocar de modelo depois que a conversa começou.",
  "The message to rewind is no longer available.":
    "A mensagem para voltar não está mais disponível.",
  "Timed out waiting for the thread to rewind.": "Tempo esgotado esperando a thread voltar.",

  // Agents panel
  Working: "Trabalhando",
  "Idle · resumable": "Ocioso · retomável",
  Failed: "Falhou",
  Stopped: "Parado",
  Idle: "Ocioso",
  "{count} tools": "{count} ferramentas",
  "run {count}": "execução {count}",
  "Close script": "Fechar script",
  "… (truncated)": "… (truncado)",
  "Could not load the script.": "Não foi possível carregar o script.",
  "Loading…": "Carregando…",
  pending: "pendente",
  "{count} done": "{count} concluídos",
  "{active} active · {done} done": "{active} ativos · {done} concluídos",
  "{settled}/{total} settled": "{settled}/{total} concluídos",
  "Collapse workflow": "Recolher workflow",
  "{count} agents": "{count} agentes",
  "No agents yet": "Nenhum agente ainda",
  "When this thread spawns subagents or runs a workflow, they show up here with live status, activity, and token usage.":
    "Quando esta thread criar subagentes ou rodar um workflow, eles aparecem aqui com status ao vivo, atividade e uso de tokens.",
  "Direct spawns": "Iniciados diretamente",
  "{count} settled": "{count} concluídos",

  // Composer: mention and skill chips
  "Preview {path}": "Visualizar {path}",
  "Skill {label}": "Skill {label}",
  "No description is available for this skill.": "Não há descrição disponível para esta skill.",
  "View instructions": "Ver instruções",

  // Command palette: groups and placeholders
  "Untitled thread": "Thread sem título",
  "Linked thread": "Thread vinculada",
  "Archived thread": "Thread arquivada",
  Projects: "Projetos",
  Threads: "Threads",
  Directories: "Pastas",
  Actions: "Ações",
  "Recent Threads": "Threads recentes",
  "Search commands, projects, and threads...": "Buscar comandos, projetos e threads...",
  "Enter project path (e.g. ~/projects/my-app)":
    "Digite o caminho do projeto (ex.: ~/projects/my-app)",
  "Search...": "Buscar...",
  "Enter path (e.g. ~/projects/my-app)": "Digite o caminho (ex.: ~/projects/my-app)",

  // Composer: modes, send blockers, menus, attachments and stash
  "Plan mode — click to return to normal build mode":
    "Modo Plan — clique para voltar ao modo build normal",
  "Default mode — click to enter plan mode": "Modo padrão — clique para entrar no modo Plan",
  Build: "Build",
  "Runtime mode": "Modo de execução",
  "Update this server to send files with question answers":
    "Atualize este servidor para enviar arquivos junto com as respostas",
  "Attach the interrupted file again or remove it":
    "Anexe de novo o arquivo interrompido ou remova-o",
  "Attach the interrupted files again or remove them":
    "Anexe de novo os arquivos interrompidos ou remova-os",
  "Compacting is unavailable right now": "Não é possível compactar agora",
  "Select at least one model.": "Selecione pelo menos um modelo.",
  "Switch response model for this thread": "Trocar o modelo de resposta desta thread",
  "Switch this thread into plan mode": "Colocar esta thread no modo Plan",
  "Switch this thread back to normal build mode": "Voltar esta thread para o modo build normal",
  "Run provider command": "Executar comando do provedor",
  "{scope} skill": "Skill {scope}",
  "Run provider skill": "Executar skill do provedor",
  "Pull requests are not available for this project.":
    "Pull requests não estão disponíveis para este projeto.",
  "Pull requests could not be read for this project.":
    "Não foi possível ler os pull requests deste projeto.",
  "No pull request matches {query}.": "Nenhum pull request corresponde a {query}.",
  "No pull requests found in this repository.": "Nenhum pull request encontrado neste repositório.",
  "Couldn't bring {name} into this message": "Não foi possível trazer {name} para esta mensagem",
  "{reason} Remove the chip or attach the file again.":
    "{reason} Remova o item ou anexe o arquivo de novo.",
  "The environment it came from is not connected.": "O ambiente de origem não está conectado.",
  "The original attachment is no longer available.": "O anexo original não está mais disponível.",
  "Downloading it from the source failed.": "Falha ao baixar da origem.",
  "The draft rejected this attachment (duplicate or attachment limit reached).":
    "O rascunho recusou este anexo (duplicado ou limite de anexos atingido).",
  "Still compressing a pasted image.": "Ainda comprimindo uma imagem colada.",
  "Send again once its thumbnail appears.": "Envie de novo quando a miniatura aparecer.",
  "Still bringing a pasted attachment into this message.":
    "Ainda trazendo um anexo colado para esta mensagem.",
  "Send again once its chip resolves.": "Envie de novo quando o item terminar de carregar.",
  "Stashed files belong to another environment": "Os arquivos do stash pertencem a outro ambiente",
  "Restore this prompt in the environment that received its files.":
    "Restaure este prompt no ambiente que recebeu os arquivos.",
  "Restored prompt may reappear in the stash": "O prompt restaurado pode reaparecer no stash",
  "Browser storage rejected the update, so this entry could still be there after a reload.":
    "O armazenamento do navegador recusou a atualização, então este item ainda pode aparecer depois de recarregar.",
  "{names} exceeded the stash size limit when this prompt was saved.":
    "{names}: acima do limite de tamanho do stash quando este prompt foi salvo.",
  "{names} could not be read when this prompt was saved.":
    "Não foi possível ler {names} quando este prompt foi salvo.",
  "{names} could not be restored: the composer is at its {limit}-attachment limit.":
    "Não foi possível restaurar {names}: o composer atingiu o limite de {limit} anexos.",
  "{names}: stashed files are kept for 24 hours and this upload expired. Attach the file again.":
    "{names}: arquivos do stash ficam guardados por 24 horas e este envio expirou. Anexe o arquivo de novo.",
  "Some attachments were not restored": "Alguns anexos não foram restaurados",
  "Stash entry may come back": "O item do stash pode voltar",
  "Browser storage rejected the delete, so this prompt could reappear after a reload.":
    "O armazenamento do navegador recusou a exclusão, então este prompt pode reaparecer depois de recarregar.",
  "Stash again once its chip resolves.":
    "Guarde no stash de novo quando o item terminar de carregar.",
  "Attach dropped files again or remove them before stashing":
    "Anexe de novo os arquivos interrompidos ou remova-os antes de guardar no stash",
  "Wait for file uploads before stashing this prompt":
    "Aguarde o envio dos arquivos antes de guardar este prompt no stash",
  "Could not stash this prompt": "Não foi possível guardar este prompt no stash",
  "Browser storage rejected the write, so the composer was left as-is. Free up site data and try again.":
    "O armazenamento do navegador recusou a gravação, então o composer ficou como estava. Libere dados do site e tente de novo.",
  "Stashed prompt will not survive a reload": "O prompt do stash não vai sobreviver a uma recarga",
  "Browser storage is unavailable, so this stash is kept in memory only for this session.":
    "O armazenamento do navegador está indisponível, então este stash fica só na memória durante esta sessão.",
  "Oldest stashed prompt discarded": "Prompt mais antigo do stash descartado",
  "The stash holds {count} prompts; the oldest was removed to make room.":
    "O stash guarda {count} prompts; o mais antigo foi removido para abrir espaço.",
  "Stashed images were not saved": "As imagens do stash não foram salvas",
  "The prompt was stashed, but browser storage rejected its images. They will be missing if you reload.":
    "O prompt foi guardado no stash, mas o armazenamento do navegador recusou as imagens. Elas vão faltar se você recarregar.",
  "Stashed images did not attach": "As imagens do stash não foram anexadas",
  "That prompt was restored or deleted before {count} image finished saving. Re-attach it if you still need it.":
    "Esse prompt foi restaurado ou excluído antes de {count} imagem terminar de salvar. Anexe-a de novo se ainda precisar.",
  "That prompt was restored or deleted before {count} images finished saving. Re-attach them if you still need them.":
    "Esse prompt foi restaurado ou excluído antes de {count} imagens terminarem de salvar. Anexe-as de novo se ainda precisar.",
  "Preview {name}": "Visualizar {name}",
  "Show {count} more image attachments": "Mostrar mais {count} imagens anexadas",
  "Open provider settings": "Abrir configurações do provedor",
  "No provider available": "Nenhum provedor disponível",
  "This question cannot accept attachments.": "Esta pergunta não aceita anexos.",
  "You can attach up to {count} files per message.":
    "Você pode anexar até {count} arquivos por mensagem.",
  "'{name}' is not a supported image type. Attach GIF, HEIC, HEIF, JPEG, PNG, or WebP images.":
    "'{name}' não é um tipo de imagem compatível. Anexe imagens GIF, HEIC, HEIF, JPEG, PNG ou WebP.",
  "This server does not support file attachments.": "Este servidor não aceita arquivos anexados.",
  "'{name}' is empty or could not be read.": "'{name}' está vazio ou não pôde ser lido.",
  "Large paste attached as {name}": "Texto colado grande anexado como {name}",
  "Use {shortcut} to keep a large paste inline.":
    "Use {shortcut} para manter um texto colado grande dentro da mensagem.",
  "'{name}' could not be read as an image.": "'{name}' não pôde ser lido como imagem.",
  "'{name}' is too large to attach, even after compression.":
    "'{name}' é grande demais para anexar, mesmo depois de comprimido.",
  "Remove {name} from the message?": "Remover {name} da mensagem?",
  "this image": "esta imagem",
  "It is referenced in your text; removing it also removes every reference.":
    "A imagem é citada no seu texto; removê-la também remove todas as referências.",
  "Pasted text is too large for this message": "O texto colado é grande demais para esta mensagem",
  "Remove some text or an attachment, then paste again.":
    "Remova um pouco de texto ou um anexo e cole de novo.",
  "Pasted text is too large to attach": "O texto colado é grande demais para anexar",
  "Reduce the clipboard contents or save a smaller excerpt as a file.":
    "Reduza o conteúdo da área de transferência ou salve um trecho menor como arquivo.",
  "Unable to add to chat": "Não foi possível adicionar ao chat",
  "The composer is busy; try again once it is ready.":
    "O composer está ocupado; tente de novo quando estiver pronto.",
  "Folders can't be dropped into remote environments":
    "Não é possível soltar pastas em ambientes remotos",
  "Couldn't get the path of {name}": "Não foi possível obter o caminho de {name}",
  "Type the folder path with @ instead.": "Digite o caminho da pasta com @.",
  "Write custom answer": "Escrever resposta personalizada",
  "Expand composer": "Expandir o composer",
  "Choose an option above": "Escolha uma opção acima",
  "Type your own answer, or leave this blank to use the selected option":
    "Digite sua resposta ou deixe em branco para usar a opção selecionada",
  "Enable a provider in Settings": "Ative um provedor nas Configurações",
  "Ask anything...": "Pergunte qualquer coisa...",
  "Draft attachment may not persist": "O anexo do rascunho pode não ser mantido",
  "Draft attachment could not be saved locally and may be lost on navigation.":
    "Não foi possível salvar o anexo do rascunho localmente; ele pode se perder ao navegar.",
  "Retry upload for {name}": "Tentar enviar {name} de novo",
  "Remove {name}": "Remover {name}",
  "Play {name}": "Reproduzir {name}",
  "Attach again": "Anexar de novo",
  "Remove to send": "Remova para enviar",
  Draft: "Rascunho",
  "Resolve this approval request to continue": "Resolva este pedido de aprovação para continuar",
  "Add feedback to refine the plan, or leave this blank to implement it":
    "Adicione feedback para refinar o plano ou deixe em branco para implementá-lo",
  "Choose a project above to start a thread": "Escolha um projeto acima para começar uma thread",
  "Enable a provider in Settings to send a message":
    "Ative um provedor nas Configurações para enviar uma mensagem",
  "Ask anything, @tag files/folders, $use skills, or / for commands":
    "Pergunte qualquer coisa, use @ para arquivos/pastas, $ para skills ou / para comandos",
  "Attach files": "Anexar arquivos",

  // Chat: messages timeline
  "Loading earlier turns…": "Carregando turnos anteriores…",
  "Load earlier turns": "Carregar turnos anteriores",
  "Send a message to start the conversation.": "Envie uma mensagem para começar a conversa.",
  "Jump to message: {text}": "Ir para a mensagem: {text}",
  "User message": "Mensagem do usuário",
  "Previous turn": "Turno anterior",
  "Next turn": "Próximo turno",
  "Waits for Send now": "Aguarda o Enviar agora",
  "Sends after the next tool call or when the turn ends":
    "Envia após a próxima chamada de ferramenta ou quando o turno terminar",
  "Sends after the messages above it": "Envia depois das mensagens acima",
  "{count} attachment": "{count} anexo",
  "{count} attachments": "{count} anexos",
  "{count} context item": "{count} item de contexto",
  "{count} context items": "{count} itens de contexto",
  "Queued. {status}.": "Na fila. {status}.",
  Queued: "Na fila",
  "Send now": "Enviar agora",
  "Cancel and return to the composer": "Cancelar e voltar para o composer",
  You: "Você",
  "Download {name}": "Baixar {name}",
  "Edit from here": "Editar a partir daqui",
  "(empty response)": "(resposta vazia)",
  "Working for": "Trabalhando há",
  "Working...": "Trabalhando...",
  "Setup script": "Script de configuração",
  "{name} is still running. Show setup progress.":
    "{name} ainda está em execução. Mostrar o progresso da configuração.",
  Thinking: "Pensando",
  Thought: "Pensou",
  "Thought (×{count})": "Pensou (×{count})",
  "{label}, tool call failed": "{label}, a chamada de ferramenta falhou",
  "Compacting…": "Compactando…",
  Activity: "Atividade",
  "Tool calls": "Chamadas de ferramenta",
  "Tool call failed": "A chamada de ferramenta falhou",
  "{count} more selected elements": "Outros elementos selecionados: {count}",
  "This context is no longer available.": "Este contexto não está mais disponível.",
  Skill: "Skill",
  "Video attachment, {name}, {size}": "Vídeo anexado, {name}, {size}",
  "Browser element, {label}": "Elemento do navegador, {label}",
  "Preview annotation, {label}": "Anotação da visualização, {label}",
  "Show less": "Mostrar menos",
  "Show full message": "Mostrar mensagem completa",
  "MCP call": "Chamada MCP",
  "Open Agents panel ›": "Abrir o painel de agentes ›",

  // Chat: main view (banners, toasts, dialogs)
  "The composer is not ready": "O composer não está pronto",
  "Try citing the selection after the connection or pending input is resolved.":
    "Tente citar a seleção depois que a conexão ou a entrada pendente for resolvida.",
  "Cloning repository": "Clonando o repositório",
  "Repository not cloned": "Repositório não clonado",
  "Retry to bring in the repository.": "Tente de novo para trazer o repositório.",
  "Could not reconnect environment": "Não foi possível reconectar o ambiente",
  "Failed to reconnect.": "Falha ao reconectar.",
  "Could not disconnect server": "Não foi possível desconectar o servidor",
  "Failed to disconnect.": "Falha ao desconectar.",
  "No active project is available for this pull request.":
    "Nenhum projeto ativo disponível para este pull request.",
  "Finishing an update": "Finalizando uma atualização",
  "Server update available": "Atualização do servidor disponível",
  "Usage limits are unavailable for this provider":
    "Os limites de uso não estão disponíveis para este provedor",
  "The environment is not connected.": "O ambiente não está conectado.",
  "Keep attachments on this machine": "Mantenha os anexos nesta máquina",
  "Remove attachments before choosing automatic routing, then attach them on the selected machine.":
    "Remova os anexos antes de escolher o roteamento automático e anexe-os de novo na máquina selecionada.",
  "Auto balance": "Balanceamento automático",
  "Checking machines…": "Verificando máquinas…",
  "Auto balance unavailable": "Balanceamento automático indisponível",
  "Failed to interrupt the current turn.": "Falha ao interromper o turno atual.",
  "Chat code block": "Bloco de código do chat",
  "Script not found.": "Script não encontrado.",
  "Could not delete action": "Não foi possível excluir a ação",
  "An unexpected error occurred.": "Ocorreu um erro inesperado.",
  "Unable to open browser": "Não foi possível abrir o navegador",
  "Clipboard API unavailable.": "API da área de transferência indisponível.",
  "Path copied": "Caminho copiado",
  "PR link copied": "Link do PR copiado",
  "Failed to copy PR link": "Falha ao copiar o link do PR",
  "Thread ID copied": "ID da thread copiado",
  "Failed to switch checkout": "Falha ao trocar o checkout",
  "Checkout switched, but the thread could not be updated":
    "O checkout foi trocado, mas não foi possível atualizar a thread",
  "Failed to stop background work.": "Falha ao parar o trabalho em segundo plano.",
  "Background work": "Trabalho em segundo plano",
  Monitoring: "Monitorando",
  "Stopping...": "Parando...",
  Stop: "Parar",
  "Thread woke from snooze": "A thread foi retomada após o adiamento",
  "Send a message to continue": "Envie uma mensagem para continuar",
  "Dismiss Woke notification": "Dispensar aviso de retomada",
  "Waking...": "Retomando...",
  "Wake now": "Retomar agora",
  "Un-settling...": "Reabrindo...",
  "Un-settle": "Reabrir",
  "Choose a project before compacting": "Escolha um projeto antes de compactar",
  "Compaction is unavailable for this provider":
    "A compactação não está disponível para este provedor",
  "Resume with less context": "Retome com menos contexto",
  "Keep full history": "Manter o histórico completo",
  "Restoring...": "Restaurando...",
  "Restore branch": "Restaurar branch",
  "Dismiss branch change notice": "Dispensar aviso de troca de branch",
  "This provider does not support reverting conversation history. Start a new thread instead.":
    "Este provedor não permite reverter o histórico da conversa. Comece uma nova thread.",
  "Interrupt the current turn before reverting checkpoints.":
    "Interrompa o turno atual antes de reverter checkpoints.",
  "Wait for attachments to finish preparing before rewinding.":
    "Aguarde os anexos terminarem de ser preparados antes de voltar.",
  "Make room for this message's attachments in the composer before rewinding.":
    "Libere espaço no composer para os anexos desta mensagem antes de voltar.",
  "Failed to revert thread state.": "Falha ao reverter o estado da thread.",
  "Failed to compact context.": "Falha ao compactar o contexto.",
  "Some attachments stayed queued": "Alguns anexos ficaram na fila",
  "Annotation attached to draft": "Anotação anexada ao rascunho",
  "Sending is unavailable right now. Finish the current action, then send.":
    "Não é possível enviar agora. Termine a ação atual e depois envie.",
  "Checking machine resources": "Verificando os recursos das máquinas",
  "Choose a machine to continue": "Escolha uma máquina para continuar",
  "Resource checks are still running. You can choose a machine in the composer.":
    "A verificação de recursos ainda está em andamento. Você pode escolher uma máquina no composer.",
  "No eligible machine has available resources. Choose a machine in the composer to override.":
    "Nenhuma máquina elegível tem recursos disponíveis. Escolha uma máquina no composer para forçar.",
  "Not connected: message not sent": "Sem conexão: mensagem não enviada",
  "Reconnecting to the environment. Try again once it is connected.":
    "Reconectando ao ambiente. Tente de novo quando estiver conectado.",
  "Update this server before starting multiple models.":
    "Atualize este servidor antes de iniciar vários modelos.",
  "Choose models and a base branch": "Escolha os modelos e uma branch base",
  "Multiple models need a new thread in a Git project. Each gets its own worktree.":
    "Vários modelos exigem uma nova thread em um projeto Git. Cada um ganha o próprio worktree.",
  "Start a Codex thread first": "Comece uma thread do Codex primeiro",
  "Send a message before you submit feedback.": "Envie uma mensagem antes de mandar feedback.",
  "Choose a project first": "Escolha um projeto primeiro",
  "This draft no longer points to an available project.":
    "Este rascunho não aponta mais para um projeto disponível.",
  "Select a base branch before sending in New worktree mode.":
    "Selecione uma branch base antes de enviar no modo Novo worktree.",
  "Retry or remove failed uploads before sending.":
    "Tente de novo ou remova os envios que falharam antes de enviar.",
  "The previous request may have started. Open its thread to check before sending again.":
    "A solicitação anterior pode ter começado. Abra a thread dela para conferir antes de enviar de novo.",
  "Failed to send message.": "Falha ao enviar a mensagem.",
  "Allow retry": "Permitir nova tentativa",
  "The previous request may already be running. Check its thread first. Allow another send that could create a duplicate thread?":
    "A solicitação anterior pode já estar em execução. Confira a thread dela primeiro. Permitir outro envio que pode criar uma thread duplicada?",
  "Open thread": "Abrir thread",
  "Failed to send messages.": "Falha ao enviar as mensagens.",
  "A background prompt could not be sent": "Não foi possível enviar um prompt em segundo plano",
  "Your newer draft is unchanged. Restore the failed prompt when this composer is empty.":
    "Seu rascunho mais recente não foi alterado. Restaure o prompt que falhou quando este composer estiver vazio.",
  "Restore prompt": "Restaurar prompt",
  "Return to the original draft and send or clear its current prompt before restoring.":
    "Volte ao rascunho original e envie ou limpe o prompt atual dele antes de restaurar.",
  "Could not open a fresh composer": "Não foi possível abrir um composer novo",
  "Started in background": "Iniciado em segundo plano",
  "Background task failed": "A tarefa em segundo plano falhou",
  "Open draft": "Abrir rascunho",
  "Failed to submit approval decision.": "Falha ao enviar a decisão de aprovação.",
  "Wait for attachments to finish uploading, or remove failed uploads.":
    "Aguarde os anexos terminarem de ser enviados ou remova os envios que falharam.",
  "Failed to submit user input.": "Falha ao enviar a resposta.",
  "Failed to dismiss the question.": "Falha ao dispensar a pergunta.",
  "Failed to send plan follow-up.": "Falha ao enviar o follow-up do plano.",
  "Could not start implementation thread": "Não foi possível iniciar a thread de implementação",
  "An error occurred while creating the new thread.": "Ocorreu um erro ao criar a nova thread.",
  "Rewinding conversation": "Voltando a conversa",
  "Sending feedback": "Enviando feedback",
  "Messages loading": "Carregando mensagens",
  "{label} server": "servidor {label}",
  "Cloning {name}": "Clonando {name}",
  "Cancelled cloning {name}": "Clonagem de {name} cancelada",
  "Remove project": "Remover projeto",
  "Hide this server's threads. Switch it on again in Connections.":
    "Oculta as threads deste servidor. Ative de novo em Conexões.",
  "Disconnect server": "Desconectar servidor",
  "Connecting to {label}": "Conectando a {label}",
  "Reconnecting to {label}": "Reconectando a {label}",
  "{label} is reconnecting": "{label} está reconectando",
  "{label} is offline": "{label} está offline",
  Reconnect: "Reconectar",
  "Could not download {name}": "Não foi possível baixar {name}",
  "Failed to run script {name}.": "Falha ao executar o script {name}.",
  "Deleted action {name}": "Ação {name} excluída",
  Unknown: "Desconhecido",
  "View agents": "Ver agentes",
  View: "Ver",
  "This thread is snoozed": "Esta thread está adiada",
  "This thread is settled": "Esta thread está concluída",
  "Send a message to wake": "Envie uma mensagem para retomar",
  "Send a message to unsettle": "Envie uma mensagem para reabrir",
  Compact: "Compactar",
  "{tokens} tokens from earlier": "{tokens} tokens de antes",
  "Branch changed — was": "A branch mudou — antes era",
  "This thread last ran on {threadBranch}. Sending will continue on {currentBranch}.":
    "Esta thread rodou por último em {threadBranch}. O envio vai continuar em {currentBranch}.",
  "Reconnect {label} before reverting checkpoints.":
    "Reconecte {label} antes de reverter checkpoints.",
  "A message holds at most {count} attachments. Use Send now on the queued row when you want the rest to go.":
    "Uma mensagem aceita no máximo {count} anexos. Use Enviar agora na linha da fila quando quiser mandar o resto.",
  "Provider for {model} is unavailable.": "O provedor de {model} não está disponível.",
  "Attachment '{name}' did not finish uploading.": "O anexo '{name}' não terminou de ser enviado.",
  "Could not start {model}": "Não foi possível iniciar {model}",
  "Started {count} thread in background": "{count} thread iniciada em segundo plano",
  "Started {count} threads in background": "{count} threads iniciadas em segundo plano",
  "{reason} Start a new thread to use this model.":
    "{reason} Comece uma nova thread para usar este modelo.",
  "Pull requests unavailable": "Pull requests indisponíveis",
  "Update this environment's T3 Code server to browse pull requests.":
    "Atualize o servidor T3 Code deste ambiente para navegar pelos pull requests.",
  "Drop files to attach": "Solte os arquivos para anexar",
  "Scroll to end": "Rolar até o fim",
  "Switch to": "Mudar para",
  "You have uncommitted changes. They'll carry over to the other branch, or block the switch if they conflict.":
    "Você tem alterações sem commit. Elas vão junto para a outra branch ou bloqueiam a troca se houver conflito.",
  "Switch branch": "Trocar de branch",
  "Edit from here?": "Editar a partir daqui?",
  "Rewind chat to before this message. Your prompt and attachments return to the composer.":
    "Volta o chat para antes desta mensagem. Seu prompt e os anexos voltam para o composer.",
  "Files stay as they are because this thread shares the project directory.":
    "Os arquivos ficam como estão porque esta thread compartilha o diretório do projeto.",
  "Revert files too": "Reverter os arquivos também",
  "Revert and keep changes": "Reverter e manter as alterações",

  // Chat: markdown rendering
  "Use template": "Usar modelo",
  Note: "Observação",
  Tip: "Dica",
  Important: "Importante",
  Caution: "Cuidado",
  "Collapse table cells": "Recolher células da tabela",
  "Expand table cells": "Expandir células da tabela",
  Copied: "Copiado",
  "Copy table": "Copiar tabela",
  "Copy as Markdown": "Copiar como Markdown",
  "Copy as CSV": "Copiar como CSV",
  "Language: {language}": "Linguagem: {language}",
  "Disable line wrap": "Desativar quebra de linha",
  "Wrap lines": "Quebrar linhas",
  "Copy code": "Copiar código",
  "Code block actions": "Ações do bloco de código",
  "Run in terminal": "Executar no terminal",
  "Video unavailable": "Vídeo indisponível",
  "Image unavailable": "Imagem indisponível",
  "Loading image": "Carregando imagem",
  "Unable to open file": "Não foi possível abrir o arquivo",
  "Unable to open file in browser": "Não foi possível abrir o arquivo no navegador",
  "Unable to reveal file": "Não foi possível mostrar o arquivo",
  "Failed to copy {target}": "Falha ao copiar {target}",
  "{target} copied": "{target} copiado",
  "Relative path": "Caminho relativo",
  "Full path": "Caminho completo",
  "Preview media": "Visualizar mídia",
  "Copy relative path": "Copiar caminho relativo",
  "Copy full path": "Copiar caminho completo",
  "File options for {label}": "Opções do arquivo {label}",
  "Media unavailable": "Mídia indisponível",
  "The file could not be loaded. It may have been moved or deleted.":
    "Não foi possível carregar o arquivo. Ele pode ter sido movido ou excluído.",
  "Thread context is unavailable.": "O contexto da thread não está disponível.",
  "Unable to open link in browser": "Não foi possível abrir o link no navegador",
  "Environment is not connected.": "O ambiente não está conectado.",
  "Toggle task": "Alternar tarefa",
  "Unable to link pull request": "Não foi possível vincular o pull request",
  "Unable to unlink pull request": "Não foi possível desvincular o pull request",
  "The request failed.": "A solicitação falhou.",

  // Chat: command palette
  "Couldn't save theme selection": "Não foi possível salvar a escolha de tema",
  "Enter Git clone URL": "Informe a URL de clone do Git",
  "Enter {source} repository ({hint})": "Informe o repositório do {source} ({hint})",
  "Provider status unavailable. Open Settings -> Source Control and rescan.":
    "Status do provedor indisponível. Abra Configurações -> Controle de versão e verifique de novo.",
  "{provider} is not authenticated. Open Settings -> Source Control for setup guidance.":
    "{provider} não está autenticado. Abra Configurações -> Controle de versão para ver como configurar.",
  "Appearance: {mode}": "Aparência: {mode}",
  "File picker": "Seletor de arquivos",
  "Command palette": "Paleta de comandos",
  "Local folder": "Pasta local",
  "Browse a folder on disk": "Procurar uma pasta no disco",
  "Git URL": "URL do Git",
  "{source} repository": "Repositório do {source}",
  "Clone from a remote URL": "Clonar de uma URL remota",
  "Clone {source} {hint}": "Clonar {source} {hint}",
  "Setup Required": "Configuração necessária",
  "Open Settings -> Source Control to configure this provider.":
    "Abra Configurações -> Controle de versão para configurar este provedor.",
  Sources: "Origens",
  "Environment unavailable": "Ambiente indisponível",
  "{environment} is not connected.": "{environment} não está conectado.",
  "The selected environment": "O ambiente selecionado",
  "This device": "Este dispositivo",
  Environments: "Ambientes",
  "New thread in": "Nova thread em",
  "New thread in...": "Nova thread em...",
  "Copy PR link": "Copiar link do PR",
  "Copy thread ID": "Copiar ID da thread",
  "Link pull request to thread": "Vincular pull request à thread",
  "Show linked pull requests": "Mostrar pull requests vinculados",
  "Go to file": "Ir para arquivo",
  "Add project": "Adicionar projeto",
  "Open WSL folder": "Abrir pasta do WSL",
  "Change theme": "Alterar tema",
  "For light mode": "Para o modo claro",
  "For dark mode": "Para o modo escuro",
  Current: "Atual",
  "Change appearance": "Alterar aparência",
  "Toggle theme editor": "Alternar editor de tema",
  "Open pull requests": "Abrir pull requests",
  "Open usage": "Abrir uso",
  "Open settings": "Abrir configurações",
  "Settings · {section}": "Configurações · {section}",
  "Failed to add project": "Falha ao adicionar o projeto",
  "Windows-style paths are only supported on Windows.":
    "Caminhos no formato do Windows só funcionam no Windows.",
  "Relative paths require an active project.": "Caminhos relativos exigem um projeto ativo.",
  "Failed to open project": "Falha ao abrir o projeto",
  "Repository lookup failed": "Falha ao buscar o repositório",
  "Clone failed": "Falha ao clonar",
  "Select where to clone": "Escolha onde clonar",
  "Create & Clone": "Criar e clonar",
  Clone: "Clonar",
  "Create & Add": "Criar e adicionar",
  Add: "Adicionar",
  Continue: "Continuar",
  Lookup: "Buscar",
  "Unable to run command": "Não foi possível executar o comando",
  "Could not add WSL project": "Não foi possível adicionar o projeto do WSL",
  "Start the matching WSL backend, then choose the folder again.":
    "Inicie o backend do WSL correspondente e escolha a pasta de novo.",
  Cloning: "Clonando",
  Select: "Selecionar",
  Repository: "Repositório",
  "Enter a Git clone URL and press Enter to continue.":
    "Informe uma URL de clone do Git e pressione Enter para continuar.",
  "Enter a repository path and press Enter to look it up.":
    "Informe o caminho de um repositório e pressione Enter para buscá-lo.",
  "Choose a destination path and press Enter to clone.":
    "Escolha um caminho de destino e pressione Enter para clonar.",
  "Press Enter to create this folder and add it as a project.":
    "Pressione Enter para criar esta pasta e adicioná-la como projeto.",
  "Searching thread messages…": "Buscando nas mensagens das threads…",

  // Chat: terminal drawer
  "Add to chat": "Adicionar ao chat",
  Copy: "Copiar",
  Paste: "Colar",
  "Terminal closed": "Terminal fechado",
  "Process exited": "O processo terminou",
  "Unable to copy terminal selection": "Não foi possível copiar a seleção do terminal",
  "Unable to read the clipboard": "Não foi possível ler a área de transferência",
  "Unable to open the terminal context menu":
    "Não foi possível abrir o menu de contexto do terminal",
  "Failed to move cursor": "Falha ao mover o cursor",
  "Failed to delete terminal input": "Falha ao apagar a entrada do terminal",
  "Opening links is unavailable in this browser.":
    "Abrir links não está disponível neste navegador.",
  "Unable to open link": "Não foi possível abrir o link",
  "Unable to open path": "Não foi possível abrir o caminho",
  "Terminal write failed": "Falha ao escrever no terminal",
  "Unable to initialize libghostty-vt": "Não foi possível inicializar o libghostty-vt",
  "{message} — close and reopen the terminal to retry.":
    "{message} — feche e abra o terminal de novo para tentar outra vez.",
  "Split Terminal Horizontally (max {count} per group)":
    "Dividir terminal na horizontal (máx. {count} por grupo)",
  "Split Terminal Horizontally": "Dividir terminal na horizontal",
  "Split Terminal Vertically (max {count} per group)":
    "Dividir terminal na vertical (máx. {count} por grupo)",
  "Split Terminal Vertically": "Dividir terminal na vertical",
  "New Terminal": "Novo terminal",
  "Close Terminal": "Fechar terminal",
  "No terminal sessions for this thread yet.": "Esta thread ainda não tem sessões de terminal.",
  Single: "Único",
  "Side by side": "Lado a lado",
  "Close {label}": "Fechar {label}",

  // Chat: terminal surface
  "Terminal input": "Entrada do terminal",
  "Terminal scrollback": "Histórico de rolagem do terminal",

  // Chat: second pass
  "Failed to clear terminal": "Falha ao limpar o terminal",
  "{additions} additions, {deletions} deletions": "{additions} adições, {deletions} remoções",
};
export default dictionary;
