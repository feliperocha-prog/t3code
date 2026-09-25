/**
 * Portuguese (Brazil) dictionary. Keys are the exact English source strings
 * passed to `t()`; keep `{placeholders}` identical on both sides. Grouped by
 * screen so a translated screen can be reviewed in one block.
 */
export const ptBR: Readonly<Record<string, string>> = {
  // Settings shell: sidebar sections, breadcrumb, scope notices
  Settings: "Configurações",
  Project: "Projeto",
  General: "Geral",
  Appearance: "Aparência",
  Keybindings: "Atalhos de teclado",
  SnapShots: "SnapShots",
  Providers: "Provedores",
  Integrations: "Integrações",
  "Source Control": "Controle de versão",
  Storage: "Armazenamento",
  Connections: "Conexões",
  Archive: "Arquivadas",
  Diagnostics: "Diagnóstico",
  "Open source licenses": "Licenças de código aberto",
  "Settings breadcrumb": "Navegação das configurações",
  "Restore device defaults": "Restaurar padrões do dispositivo",
  "Reconnect {label} to change its settings.":
    "Reconecte {label} para alterar as configurações dele.",
  "{title} requires a supporting environment. Choose one to continue.":
    "{title} exige um ambiente compatível. Escolha um para continuar.",
  "{title} requires a supporting environment. Connect or update an environment to continue.":
    "{title} exige um ambiente compatível. Conecte ou atualize um ambiente para continuar.",
  "{title} is not available for the selected target. Choose its owning scope to continue.":
    "{title} não está disponível para o alvo selecionado. Escolha o escopo dono dele para continuar.",

  // Settings → General
  // Sidebar search
  Search: "Buscar",
  "Search settings": "Buscar configurações",
  "Clear settings search": "Limpar busca nas configurações",
  "Settings search results": "Resultados da busca nas configurações",
  "No settings found": "Nenhuma configuração encontrada",
  // New threads (project defaults)
  "New threads": "Novas threads",
  "Project defaults and overrides": "Padrões e substituições do projeto",
  "Default model": "Modelo padrão",
  Model: "Modelo",
  "Model for new threads in this project.": "Modelo das novas threads deste projeto.",
  "Default model for new threads. Projects can override it.":
    "Modelo padrão das novas threads. Os projetos podem substituí-lo.",
  "This model is unavailable on {environment}. Select that environment to choose its model separately.":
    "Este modelo não está disponível em {environment}. Selecione esse ambiente para escolher o modelo dele separadamente.",
  "a selected environment": "um ambiente selecionado",
  "Default model not saved": "Modelo padrão não salvo",
  Automatic: "Automático",
  Mixed: "Misto",
  "No providers available": "Nenhum provedor disponível",
  Unavailable: "Indisponível",
  Workspace: "Espaço de trabalho",
  "Where new threads in this project start.": "Onde as novas threads deste projeto começam.",
  "Where new threads start. Projects and their t3.json can override it.":
    "Onde as novas threads começam. Os projetos e o t3.json deles podem substituir isso.",
  "Default workspace": "Espaço de trabalho padrão",
  Permissions: "Permissões",
  "Permissions for new threads in this project.": "Permissões das novas threads deste projeto.",
  "Default permissions for new threads. Projects can override them.":
    "Permissões padrão das novas threads. Os projetos podem substituí-las.",
  "Default permissions": "Permissões padrão",
  Submodules: "Submódulos",
  "How new worktrees in this project populate git submodules.":
    "Como as novas worktrees deste projeto preenchem os submódulos do git.",
  "How new worktrees populate git submodules. Projects and their t3.json can override it.":
    "Como as novas worktrees preenchem os submódulos do git. Os projetos e o t3.json deles podem substituir isso.",
  "Worktree submodules": "Submódulos da worktree",
  // Organization
  Organization: "Organização",
  "Project grouping": "Agrupamento de projetos",
  "Combine matching repositories across environments.":
    "Junta repositórios iguais de ambientes diferentes.",
  "Auto-settle inactive threads": "Concluir threads inativas automaticamente",
  "Auto-settle merged threads": "Concluir threads com merge automaticamente",
  "Settle a thread when its pull request merges. Closed pull requests still settle automatically.":
    "Conclui uma thread quando o pull request dela recebe merge. Pull requests fechados continuam sendo concluídos automaticamente.",
  "Days of inactivity before auto-settle": "Dias de inatividade antes de concluir",
  "Sidebar threads with no activity for this long settle automatically.":
    "Threads da barra lateral sem atividade por esse período são concluídas automaticamente.",
  "Any new activity un-settles a thread automatically.":
    "Qualquer nova atividade reabre a thread automaticamente.",
  // Behavior
  Behavior: "Comportamento",
  "Thread notifications": "Notificações de threads",
  "In-app notifications": "Notificações no app",
  "Show a toast when another thread finishes, fails, or needs input or approval while this app has focus.":
    "Mostra um aviso quando outra thread termina, falha ou precisa de resposta ou aprovação enquanto o app está em foco.",
  "Time format": "Formato de hora",
  "System default follows your browser or OS clock preference.":
    "O padrão do sistema segue a preferência de relógio do seu navegador ou sistema operacional.",
  "Timestamp format": "Formato de horário",
  "System default": "Padrão do sistema",
  "12-hour": "12 horas",
  "24-hour": "24 horas",
  "Response streaming": "Streaming de respostas",
  "The selected targets use different streaming modes.":
    "Os alvos selecionados usam modos de streaming diferentes.",
  "Wait for the full response": "Esperar a resposta completa",
  "Show finished paragraphs": "Mostrar parágrafos prontos",
  "Token by token (legacy)": "Token a token (legado)",
  "Text appears once the agent finishes its turn.":
    "O texto aparece quando o agente termina o turno.",
  "Each paragraph or code block appears as soon as it is complete.":
    "Cada parágrafo ou bloco de código aparece assim que fica pronto.",
  "Every token repaints the answer as it arrives. Slower and harder to read. Thinking traces still arrive a paragraph at a time.":
    "Cada token redesenha a resposta quando chega. Mais lento e mais difícil de ler. O raciocínio continua chegando um parágrafo por vez.",
  "Token by token is a worse experience": "Token a token é uma experiência pior",
  "Token streaming repaints the message on every delta. It is slower, harder to read, and costs more CPU on every connected device. This mode stays only for backwards compatibility. Use paragraph streaming instead.":
    "O streaming por token redesenha a mensagem a cada trecho. É mais lento, mais difícil de ler e gasta mais CPU em todo dispositivo conectado. Esse modo só existe por compatibilidade. Use o streaming por parágrafo.",
  "Use token by token": "Usar token a token",
  Cancel: "Cancelar",
  "Use paragraphs": "Usar parágrafos",
  "Hide whitespace changes": "Ocultar mudanças de espaço em branco",
  "Set whether the diff panel ignores whitespace-only edits by default.":
    "Define se o painel de diff ignora por padrão edições só de espaço em branco.",
  "Hide whitespace changes by default": "Ocultar mudanças de espaço em branco por padrão",
  "Default diff file state": "Estado padrão dos arquivos no diff",
  "Start with files expanded or collapsed when opening diffs or a pull request's Code tab.":
    "Abre os arquivos expandidos ou recolhidos ao abrir diffs ou a aba Code de um pull request.",
  Collapsed: "Recolhidos",
  Expanded: "Expandidos",
  "Diff layout": "Layout do diff",
  "Show diffs stacked or side by side. The toggle in the diff toolbar changes this too.":
    "Mostra os diffs empilhados ou lado a lado. O botão na barra do diff também muda isso.",
  Stacked: "Empilhado",
  Split: "Lado a lado",
  "Proactive panels": "Painéis proativos",
  "Open linked pull requests first. Otherwise, open the working tree diff for changes to at least 3 files or 50 lines.":
    "Abre primeiro os pull requests vinculados. Se não houver, abre o diff da working tree quando a mudança tiver pelo menos 3 arquivos ou 50 linhas.",
  "Show skills in slash menu": "Mostrar skills no menu /",
  "Also include skills in the / command menu. Skills always appear when you type $.":
    "Inclui também as skills no menu de comandos /. As skills sempre aparecem quando você digita $.",
  "Rich text composer": "Composer com texto formatado",
  "Show formatted Markdown as you type.": "Mostra o Markdown formatado enquanto você digita.",
  "Collapse composer on scroll": "Recolher composer ao rolar",
  "Rest the composer of an existing thread into a single line when you scroll the conversation. Focus the composer or start typing to expand it again.":
    "Reduz o composer de uma thread existente a uma linha quando você rola a conversa. Clique no composer ou comece a digitar para expandir de novo.",
  "Send shortcut": "Atalho de envio",
  "Choose when Enter sends a prompt or inserts a new line":
    "Escolha quando o Enter envia o prompt ou insere uma nova linha",
  "{mod} + Enter for multiline prompts": "{mod} + Enter para prompts de várias linhas",
  "{mod} + Enter always": "{mod} + Enter sempre",
  "Follow-up behavior": "Comportamento de follow-ups",
  "Queue follow-ups while the agent runs or steer the current run.":
    "Coloca os follow-ups na fila enquanto o agente trabalha ou redireciona a execução atual.",
  "Press {mod} + Enter for single-line prompts or {mod} + Shift + Enter for multiline prompts to do the opposite for one message.":
    "Pressione {mod} + Enter em prompts de uma linha ou {mod} + Shift + Enter em prompts de várias linhas para fazer o contrário em uma mensagem.",
  "Press {keys} + Enter to do the opposite for one message.":
    "Pressione {keys} + Enter para fazer o contrário em uma mensagem.",
  Queue: "Fila",
  Steer: "Redirecionar",
  "Provider update checks": "Verificação de atualizações dos provedores",
  "Check installed provider CLIs for newer available versions.":
    "Verifica se há versões mais novas das CLIs de provedores instaladas.",
  "Check provider versions": "Verificar versões dos provedores",
  "Continue threads after restarts": "Continuar threads após reinícios",
  "Automatically resume interrupted threads after an update, crash, or machine restart on the selected environments. Update older servers first.":
    "Retoma automaticamente threads interrompidas após atualização, falha ou reinício da máquina nos ambientes selecionados. Atualize antes os servidores mais antigos.",
  "All selected connected environments must support restart continuation.":
    "Todos os ambientes conectados selecionados precisam suportar a continuação após reinício.",
  "Background activity": "Atividade em segundo plano",
  "This shared policy gates background work such as Git refreshes and provider health probes after their individual intervals elapse.":
    "Esta política compartilhada controla o trabalho em segundo plano, como atualizações do Git e verificações de saúde dos provedores, depois que os intervalos de cada um vencem.",
  "Shared policy: {profile}.": "Política compartilhada: {profile}.",
  "Background activity profile": "Perfil de atividade em segundo plano",
  "(one environment)": "(um ambiente)",
  "Configure advanced background activity": "Configurar atividade em segundo plano avançada",
  "Configure background activity": "Configurar atividade em segundo plano",
  Balanced: "Equilibrado",
  Performance: "Desempenho",
  "Battery saver": "Economia de bateria",
  Advanced: "Avançado",
  "Pauses probes for idle clients, locked hosts, or low power mode.":
    "Pausa as verificações com clientes ociosos, host bloqueado ou modo de baixo consumo.",
  "Allows scoped background probes while any subscribed client remains connected.":
    "Permite verificações em segundo plano limitadas enquanto algum cliente inscrito continuar conectado.",
  "Also pauses background probes when the host or client is on battery.":
    "Também pausa as verificações em segundo plano quando o host ou o cliente está na bateria.",
  "Uses custom intervals.": "Usa intervalos personalizados.",
  "Background Activity": "Atividade em segundo plano",
  "Tune the shared power policy and the background intervals that feed it.":
    "Ajuste a política de energia compartilhada e os intervalos em segundo plano que a alimentam.",
  "Shared policy": "Política compartilhada",
  "Controls whether background work may run after a subscribed interval fires.":
    "Controla se o trabalho em segundo plano pode rodar depois que um intervalo inscrito dispara.",
  "Shared background policy": "Política compartilhada de segundo plano",
  "Pause when host is locked": "Pausar com o host bloqueado",
  "Pause on host low power": "Pausar com o host em baixo consumo",
  "Pause on client low power": "Pausar com o cliente em baixo consumo",
  "Pause on battery": "Pausar na bateria",
  "Refresh remote branch status in the background.":
    "Atualiza o status das branches remotas em segundo plano.",
  "Decrease Git fetch interval": "Diminuir intervalo do Git fetch",
  "Git fetch interval in seconds": "Intervalo do Git fetch em segundos",
  "Increase Git fetch interval": "Aumentar intervalo do Git fetch",
  seconds: "segundos",
  "Provider health interval": "Intervalo de saúde dos provedores",
  "Refresh provider availability, versions, auth state, and model metadata.":
    "Atualiza disponibilidade, versões, estado de autenticação e metadados de modelos dos provedores.",
  "Decrease provider health interval": "Diminuir intervalo de saúde dos provedores",
  "Provider health interval in seconds": "Intervalo de saúde dos provedores em segundos",
  "Increase provider health interval": "Aumentar intervalo de saúde dos provedores",
  "Host power monitor": "Monitor de energia do host",
  "Poll host power state while clients are active.":
    "Consulta o estado de energia do host enquanto há clientes ativos.",
  "Decrease active host power interval": "Diminuir intervalo de energia do host ativo",
  "Active host power interval in seconds": "Intervalo de energia do host ativo em segundos",
  "Increase active host power interval": "Aumentar intervalo de energia do host ativo",
  "Idle host monitor": "Monitor do host ocioso",
  "Poll host power state when no foreground client is active.":
    "Consulta o estado de energia do host quando nenhum cliente está ativo em primeiro plano.",
  "Decrease idle host power interval": "Diminuir intervalo de energia do host ocioso",
  "Idle host power interval in seconds": "Intervalo de energia do host ocioso em segundos",
  "Increase idle host power interval": "Aumentar intervalo de energia do host ocioso",
  "Reset all": "Redefinir tudo",
  Done: "Concluído",
  // Projects & threads
  "Projects & threads": "Projetos e threads",
  "Start from origin": "Começar a partir do origin",
  "Creates the worktree from the latest matching branch on origin instead of your local branch.":
    "Cria a worktree a partir da branch correspondente mais recente no origin, em vez da sua branch local.",
  "Start new worktrees from origin by default":
    "Começar novas worktrees a partir do origin por padrão",
  "Add project starts in": "Pasta inicial ao adicionar projeto",
  'Leave empty to use "~/" when the Add Project browser opens.':
    'Deixe vazio para usar "~/" quando o navegador de Adicionar projeto abrir.',
  "Add project base directory": "Pasta base para adicionar projeto",
  // Confirmations
  Confirmations: "Confirmações",
  "Unpin confirmation": "Confirmação ao desafixar",
  "Ask before unpinning a thread from the pinned section.":
    "Pergunta antes de desafixar uma thread da seção de fixadas.",
  "Confirm thread unpinning": "Confirmar ao desafixar thread",
  "Archive confirmation": "Confirmação ao arquivar",
  "Require a second click on the inline archive action before a thread is archived.":
    "Exige um segundo clique no botão de arquivar antes de arquivar a thread.",
  "Confirm thread archiving": "Confirmar ao arquivar thread",
  "Delete confirmation": "Confirmação ao excluir",
  "Ask before deleting a thread and its chat history.":
    "Pergunta antes de excluir uma thread e o histórico da conversa.",
  "Confirm thread deletion": "Confirmar ao excluir thread",
  "Quit shortcut": "Atalho para sair",
  "Hold mode also quits on two quick presses.":
    "O modo Segurar também sai com dois toques rápidos.",
  "Quit shortcut behavior": "Comportamento do atalho para sair",
  Direct: "Direto",
  Hold: "Segurar",
  "Double press": "Pressionar duas vezes",
  // Text generation
  "Text generation": "Geração de texto",
  "Text generation model": "Modelo de geração de texto",
  "Used for thread titles and other generated text on connected devices with this provider. Source control can override it.":
    "Usado nos títulos das threads e em outros textos gerados nos dispositivos conectados com este provedor. O controle de versão pode substituí-lo.",
  "Connect an environment to choose its text generation model.":
    "Conecte um ambiente para escolher o modelo de geração de texto dele.",
  "No text generation providers available.": "Nenhum provedor de geração de texto disponível.",
  "Text generation model not saved": "Modelo de geração de texto não salvo",
  // About
  About: "Sobre",
  Version: "Versão",
  "Current version of the application.": "Versão atual do aplicativo.",
  "Update available.": "Atualização disponível.",
  Download: "Baixar",
  Install: "Instalar",
  "Checking…": "Verificando…",
  "Downloading…": "Baixando…",
  "Up to Date": "Atualizado",
  "Check for Updates": "Verificar atualizações",
  "Could not check for updates": "Não foi possível verificar atualizações",
  "Automatic updates are not available in this build.":
    "Atualizações automáticas não estão disponíveis nesta versão.",
  "Update check failed.": "A verificação de atualizações falhou.",
  "Could not download update": "Não foi possível baixar a atualização",
  "Download failed.": "O download falhou.",
  "Could not confirm update": "Não foi possível confirmar a atualização",
  "Update confirmation failed.": "A confirmação da atualização falhou.",
  "Could not install update": "Não foi possível instalar a atualização",
  "Install failed.": "A instalação falhou.",
  "Update track": "Canal de atualização",
  "Use stable releases or nightly builds. Switch back anytime.":
    "Use versões estáveis ou builds nightly. Você pode voltar quando quiser.",
  "Switches the hosted app release channel.": "Troca o canal de versão do app hospedado.",
  Stable: "Estável",
  Nightly: "Nightly",
  Latest: "Mais recente",
  "Could not change update track": "Não foi possível trocar o canal de atualização",
  "Update track change failed.": "A troca do canal de atualização falhou.",
  // Diagnostics and licenses
  "Inspect processes, resource use, and logs on this environment.":
    "Inspecione processos, uso de recursos e logs deste ambiente.",
  "Inspect processes, resource use, and logs on one environment at a time.":
    "Inspecione processos, uso de recursos e logs de um ambiente por vez.",
  "View diagnostics": "Ver diagnóstico",
  "Notices for dependencies, assets, and optional tools used by T3 Code.":
    "Avisos de dependências, recursos e ferramentas opcionais usadas pelo T3 Code.",
  "View licenses": "Ver licenças",
  // Legacy features
  "Legacy features": "Recursos legados",
  "Plan mode (legacy)": "Modo Plan (legado)",
  "Restore Build/Plan, /plan, /default, and Shift+Tab. Off uses build mode.":
    "Restaura Build/Plan, /plan, /default e Shift+Tab. Desativado usa o modo build.",
  "Context window indicator (legacy)": "Indicador da janela de contexto (legado)",
  "Shows context window usage as a circular indicator in the composer.":
    "Mostra o uso da janela de contexto como um indicador circular no composer.",
  "Sidebar (legacy)": "Barra lateral (legada)",
  "Restore per-project thread trees instead of the default flat sidebar.":
    "Restaura as árvores de threads por projeto em vez da barra lateral plana padrão.",
};
