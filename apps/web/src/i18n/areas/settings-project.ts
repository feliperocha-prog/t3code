const dictionary: Readonly<Record<string, string>> = {
  // Settings → Integrations: browser
  Browser: "Navegador",
  "Only available in the desktop app.": "Disponível só no app desktop.",
  "Fill panel": "Preencher painel",
  Responsive: "Responsivo",
  "Tab size for you and agents. Fill fits the panel; other sizes show the device toolbar.":
    "Tamanho da aba para você e para os agentes. Preencher ocupa o painel; os outros tamanhos mostram a barra de dispositivo.",
  "default browser viewport": "viewport padrão do navegador",
  "Default browser viewport": "Viewport padrão do navegador",
  "Default viewport width": "Largura padrão do viewport",
  "Default viewport height": "Altura padrão do viewport",
  "Rotate to landscape": "Girar para paisagem",
  "Rotate to portrait": "Girar para retrato",
  Rotate: "Girar",
  "Page zoom applied to new browser tabs.": "Zoom de página aplicado às novas abas do navegador.",
  "default browser zoom": "zoom padrão do navegador",
  "Default browser zoom": "Zoom padrão do navegador",
  "The color scheme pages are told to prefer. System follows your OS setting.":
    "O esquema de cores que as páginas devem preferir. Sistema segue a configuração do seu sistema operacional.",
  "default browser appearance": "aparência padrão do navegador",
  "Default browser appearance": "Aparência padrão do navegador",
  "Show pressed keys and shortcuts in new recordings. Password fields are excluded.":
    "Mostra as teclas e atalhos pressionados nas novas gravações. Campos de senha ficam de fora.",
  "Show key presses in recordings": "Mostrar teclas pressionadas nas gravações",
  "Highlight mouse presses and held buttons in new recordings.":
    "Destaca os cliques e os botões segurados do mouse nas novas gravações.",
  "Show mouse presses in recordings": "Mostrar cliques do mouse nas gravações",
  "Maximum recording rate. 30 fps saves CPU and storage; 60 fps is smoother.":
    "Taxa máxima de gravação. 30 fps economiza CPU e armazenamento; 60 fps fica mais fluido.",
  "browser recording frame rate": "taxa de quadros da gravação do navegador",
  "Browser recording frame rate": "Taxa de quadros da gravação do navegador",
  "Your default browser": "Seu navegador padrão",
  "Where links in the chat and terminal open. Hold ⌘ or Ctrl while clicking a link to open it in your default browser either way.":
    "Onde os links do chat e do terminal abrem. Segure ⌘ ou Ctrl ao clicar em um link para abri-lo no seu navegador padrão de qualquer forma.",
  "link target": "destino dos links",
  "Open links in": "Abrir links em",
  "Show the floating preview when an agent opens a browser or device unless the agent says otherwise.":
    "Mostra a visualização flutuante quando um agente abre um navegador ou dispositivo, a menos que o agente diga o contrário.",
  "auto-show floating preview": "mostrar visualização flutuante automaticamente",
  "Auto-show floating preview": "Mostrar visualização flutuante automaticamente",
  // Settings → Integrations: browser profiles
  "Profiles separate cookies and logins. Incognito data is cleared when the app closes.":
    "Os perfis separam cookies e logins. Os dados do modo anônimo são apagados quando o app fecha.",
  "Add profile": "Adicionar perfil",
  "New profile": "Novo perfil",
  "Blank profile": "Perfil em branco",
  "You’ve reached the profile limit": "Você atingiu o limite de perfis",
  "Import from": "Importar de",
  "Looking for browsers…": "Procurando navegadores…",
  "No supported browsers found": "Nenhum navegador compatível encontrado",
  "Connect to an environment to import cookies": "Conecte-se a um ambiente para importar cookies",
  "Rename {name}": "Renomear {name}",
  Default: "Padrão",
  "{name} options": "Opções de {name}",
  "Set as default": "Definir como padrão",
  "Clear cookies and cache": "Limpar cookies e cache",
  "Remove profile and data": "Remover perfil e dados",
  "Connect to an environment to clear profile data":
    "Conecte-se a um ambiente para limpar os dados do perfil",
  "Checking environments…": "Verificando ambientes…",
  "Remove “{name}”?": "Remover “{name}”?",
  "Its cookies and logins are deleted. Tabs already open in this profile stay open until you close them.":
    "Os cookies e logins dele são excluídos. As abas já abertas neste perfil continuam abertas até você fechá-las.",
  "Connect to an environment to remove this profile and its data.":
    "Conecte-se a um ambiente para remover este perfil e os dados dele.",
  "Removing…": "Removendo…",
  "Remove profile": "Remover perfil",
  "Could not clear {name}'s data": "Não foi possível limpar os dados de {name}",
  "You're not connected to a server yet.": "Você ainda não está conectado a um servidor.",
  "Cleared {name}'s cookies and cache": "Cookies e cache de {name} limpos",
  "Connect to an environment before removing this profile.":
    "Conecte-se a um ambiente antes de remover este perfil.",
  "Profile data could not be deleted. Try again.":
    "Não foi possível excluir os dados do perfil. Tente novamente.",
  "Could not open System Settings": "Não foi possível abrir os Ajustes do Sistema",
  "Open Privacy & Security → Full Disk Access manually.":
    "Abra Privacidade e Segurança → Acesso Total ao Disco manualmente.",
  // Settings → Integrations: devices
  Devices: "Dispositivos",
  "Device settings not saved on all environments":
    "Configurações de dispositivo não salvas em todos os ambientes",
  "Could not update {environments}.": "Não foi possível atualizar {environments}.",
  "Update failed. Check this host's network connection and try again.":
    "A atualização falhou. Verifique a conexão de rede deste host e tente novamente.",
  "Updating…": "Atualizando…",
  "Update to v{version}": "Atualizar para v{version}",
  "Check versions": "Verificar versões",
  "Device hub": "Hub de dispositivos",
  "Status for {environment}. Select an environment to inspect its simulator support.":
    "Status de {environment}. Selecione um ambiente para inspecionar o suporte a simuladores dele.",
  Refresh: "Atualizar",
  "Agent device access": "Acesso do agente aos dispositivos",
  // Settings → GitHub sharing
  Off: "Desligado",
  "Read PRs": "Ler PRs",
  "Read and act": "Ler e agir",
  "{machines} read and act": "{machines}: ler e agir",
  "{machines} read PRs": "{machines}: ler PRs",
  "Machines you trust here can read PR data through each other's GitHub access. Enable both machines. Read and act may use broader permissions than the machine that owns them. This applies only to this device.":
    "As máquinas em que você confia aqui podem ler dados de PRs pelo acesso ao GitHub umas das outras. Ative as duas máquinas. Ler e agir pode usar permissões mais amplas que as da máquina dona delas. Isso vale só para este dispositivo.",
  "Could not save GitHub routing permission":
    "Não foi possível salvar a permissão de compartilhamento do GitHub",
  "{machine} GitHub routing": "Compartilhamento do GitHub de {machine}",
  // Settings → Source Control: providers
  Authenticated: "Autenticado",
  "Not authenticated": "Não autenticado",
  "Status unknown": "Status desconhecido",
  "Toggle source control account visibility": "Mostrar/ocultar a conta do controle de versão",
  "Click to reveal account": "Clique para mostrar a conta",
  "Click to hide account": "Clique para ocultar a conta",
  "Support for {name} is coming soon.": "O suporte a {name} chega em breve.",
  "Not available on this server: {hint}": "Indisponível neste servidor: {hint}",
  as: "como",
  "Available. {hint}": "Disponível. {hint}",
  "{provider} is not authenticated on this server. Sign in or configure credentials using the":
    "{provider} não está autenticado neste servidor. Entre ou configure as credenciais usando a ferramenta",
  "tool on the server host to enable change request features.":
    "no host do servidor para ativar os recursos de change request.",
  "Could not verify {provider}. {detail}": "Não foi possível verificar {provider}. {detail}",
  Available: "Disponível",
  "Coming Soon": "Em breve",
  "Toggle {name} details": "Mostrar/ocultar detalhes de {name}",
  "{name} availability": "Disponibilidade de {name}",
  "Server environment": "Ambiente do servidor",
  "Could not scan the server environment": "Não foi possível escanear o ambiente do servidor",
  "Nothing detected yet": "Nada detectado ainda",
  "Install Git on the server, add optional hosting integrations or credentials your workspace needs, then rescan.":
    "Instale o Git no servidor, adicione as integrações de hospedagem ou credenciais opcionais de que seu workspace precisa e escaneie de novo.",
  Scan: "Escanear",
  "Rescan server environment": "Escanear o ambiente do servidor de novo",
  "Rescan Git and hosting integrations": "Escanear o Git e as integrações de hospedagem de novo",
  "Connect an environment to inspect its version control tools and hosting integrations.":
    "Conecte um ambiente para inspecionar as ferramentas de controle de versão e as integrações de hospedagem dele.",
  "Version Control": "Sistemas de controle de versão",
  "Source Control Providers": "Provedores de controle de versão",
  // Settings → Source Control: Git fetch interval
  "This interval is configured for Git only. The shared Background activity policy still decides whether Git refreshes may run when the timer fires. Custom intervals appear as Advanced in General settings.":
    "Este intervalo vale só para o Git. A política compartilhada de Atividade em segundo plano ainda decide se as atualizações do Git podem rodar quando o timer dispara. Intervalos personalizados aparecem como Avançado nas configurações Gerais.",
  "fetch interval": "intervalo do fetch",
  "Refresh remote branches in the background. Set to 0 to avoid automatic Git prompts.":
    "Atualiza as branches remotas em segundo plano. Use 0 para evitar prompts automáticos do Git.",
  "Decrease fetch interval": "Diminuir intervalo do fetch",
  "Automatic Git fetch interval in seconds": "Intervalo automático do Git fetch em segundos",
  "Increase fetch interval": "Aumentar intervalo do fetch",
  // Settings → Source Control: writing
  "Repository conventions": "Convenções do repositório",
  "In each project, matches recent change descriptions and change request titles.":
    "Em cada projeto, segue as descrições de mudança e os títulos de change request recentes.",
  "Use Conventional Commit prefixes and keep change request text concise.":
    "Usa os prefixos do Conventional Commits e mantém o texto do change request conciso.",
  "Custom instructions": "Instruções personalizadas",
  "Use your instructions for change descriptions and change requests in every project.":
    "Usa as suas instruções para descrições de mudança e change requests em todos os projetos.",
  "source control writing style": "estilo de escrita do controle de versão",
  "Source control writing style": "Estilo de escrita do controle de versão",
  "Custom source control instructions for all selected environments":
    "Instruções personalizadas do controle de versão para todos os ambientes selecionados",
  "Write the instructions each selected environment should use.":
    "Escreva as instruções que cada ambiente selecionado deve usar.",
  "Apply instructions to all": "Aplicar instruções a todos",
  "Write custom instructions for all": "Escrever instruções personalizadas para todos",
  "Keep titles concise. Use short bullet points in descriptions.":
    "Mantenha os títulos concisos. Use tópicos curtos nas descrições.",
  "Custom source control writing instructions":
    "Instruções personalizadas de escrita do controle de versão",
  "Use the repository's template for change request descriptions when available.":
    "Usa o modelo do repositório para descrições de change request, quando houver.",
  "change request templates": "modelos de change request",
  "Follow change request templates": "Seguir os modelos de change request",
  "Model for source control text and branch or bookmark names. Off uses the environment's text generation model.":
    "Modelo para os textos do controle de versão e os nomes de branch ou bookmark. Desligado usa o modelo de geração de texto do ambiente.",
  "Connect an environment to choose its source control writer model.":
    "Conecte um ambiente para escolher o modelo de escrita do controle de versão dele.",
  "Source control writer model": "Modelo de escrita do controle de versão",
  "Source control writer model not saved": "Modelo de escrita do controle de versão não salvo",
  "Use a separate source control writer model":
    "Usar um modelo separado para a escrita do controle de versão",
  // Settings → Project
  "Add a project from the sidebar to configure it here.":
    "Adicione um projeto pela barra lateral para configurá-lo aqui.",
  "This project is no longer available.": "Este projeto não está mais disponível.",
  "This checkout is no longer available in the selected project and environment.":
    "Este checkout não está mais disponível no projeto e no ambiente selecionados.",
  "An error occurred.": "Ocorreu um erro.",
  "Connect {environment} and try again.": "Conecte {environment} e tente novamente.",
  "the selected environment": "o ambiente selecionado",
  "{title} on {environment}": "{title} em {environment}",
  "the current environment": "o ambiente atual",
  "Project title cannot be empty": "O nome do projeto não pode ficar vazio",
  "Failed to rename project": "Não foi possível renomear o projeto",
  "Failed to update project icon": "Não foi possível atualizar o ícone do projeto",
  checkout: "checkout",
  project: "projeto",
  'Remove {kind} "{name}" and delete its {count} thread?':
    'Remover o {kind} "{name}" e excluir {count} thread dele?',
  'Remove {kind} "{name}" and delete its {count} threads?':
    'Remover o {kind} "{name}" e excluir as {count} threads dele?',
  'Remove {kind} "{name}"?': 'Remover o {kind} "{name}"?',
  "Path: {path}": "Caminho: {path}",
  "Environment: {name}": "Ambiente: {name}",
  "This removes {count} grouped project entries.":
    "Isso remove {count} entradas do projeto agrupado.",
  "This permanently clears conversation history for those threads and any archived threads.":
    "Isso apaga de vez o histórico de conversa dessas threads e de todas as threads arquivadas.",
  "This permanently clears any archived conversation history.":
    "Isso apaga de vez todo o histórico de conversa arquivado.",
  "This removes only the project entries, not the files on disk.":
    "Isso remove só as entradas do projeto, não os arquivos no disco.",
  "Other entries in this grouped project are unaffected.":
    "As outras entradas deste projeto agrupado não são afetadas.",
  "This action cannot be undone.": "Esta ação não pode ser desfeita.",
  'Failed to remove "{name}"': 'Não foi possível remover "{name}"',
  Checkouts: "Checkouts",
  Environment: "Ambiente",
  "Remove checkout {path}": "Remover o checkout {path}",
  Remove: "Remover",
  "Can't find a setting? Keep this project picked above and hop to any other settings page.":
    "Não achou uma configuração? Mantenha este projeto selecionado acima e vá para qualquer outra página de configurações.",
  Name: "Nome",
  "The shared name for this project group in the sidebar and thread lists.":
    "O nome compartilhado deste grupo de projetos na barra lateral e nas listas de threads.",
  "Project name": "Nome do projeto",
  "Project icon": "Ícone do projeto",
  "project icon": "ícone do projeto",
  "Choose a project icon": "Escolher um ícone para o projeto",
  "Choose icon": "Escolher ícone",
  "Choose a project icon file": "Escolher um arquivo de ícone para o projeto",
  "Choose file": "Escolher arquivo",
  Danger: "Zona de perigo",
  "Remove checkout": "Remover checkout",
  "Remove this project everywhere": "Remover este projeto de todos os lugares",
  "Remove project": "Remover projeto",
  "Deletes the selected machine's checkout entries and their threads. Other machines and files on disk are not touched.":
    "Exclui as entradas de checkout da máquina selecionada e as threads delas. As outras máquinas e os arquivos no disco não são mexidos.",
  "Deletes all {count} checkout entries and their threads on every machine. Files on disk are not touched.":
    "Exclui as {count} entradas de checkout e as threads delas em todas as máquinas. Os arquivos no disco não são mexidos.",
  "Deletes the project entry and its threads. Files on disk are not touched.":
    "Exclui a entrada do projeto e as threads dela. Os arquivos no disco não são mexidos.",
  "Remove all entries": "Remover todas as entradas",
  "Choose a project to manage its name, icon, checkouts and actions.":
    "Escolha um projeto para gerenciar o nome, o ícone, os checkouts e as ações dele.",
  // Settings → Project: actions
  "No actions configured.": "Nenhuma ação configurada.",
  "preview · desktop only": "visualização · só no desktop",
  "Edit {name}": "Editar {name}",
  "Failed to import action.": "Não foi possível importar a ação.",
  Actions: "Ações",
  "Commands that run in this project's checkout or its worktree, with optional shortcuts.":
    "Comandos que rodam no checkout deste projeto ou no worktree dele, com atalhos opcionais.",
  "Import scripts": "Importar scripts",
  "Import from t3.json": "Importar do t3.json",
  "Add actions declared by this checkout without editing them first.":
    "Adicione as ações declaradas por este checkout sem editá-las antes.",
  "Add action": "Adicionar ação",
  "Different actions across environments": "Ações diferentes entre os ambientes",
  "Choose one environment to edit its list. Adding an action here adds it on every selected environment.":
    "Escolha um ambiente para editar a lista dele. Adicionar uma ação aqui adiciona em todos os ambientes selecionados.",
  "t3.json is invalid": "O t3.json é inválido",
  "A t3.json exists in this checkout but fails to parse, so every action and icon it declares is ignored. Check the JSON syntax and icon values.":
    "Existe um t3.json neste checkout, mas ele não pôde ser lido, então todas as ações e ícones que ele declara são ignorados. Confira a sintaxe do JSON e os valores dos ícones.",
  "Failed to save project actions": "Não foi possível salvar as ações do projeto",
  "No available machine, or another action change is saving.":
    "Nenhuma máquina disponível, ou outra mudança de ação está sendo salva.",
  "Actions not saved": "Ações não salvas",
  // Settings → Project: icon pickers
  "Choose project icon": "Escolher ícone do projeto",
  "Choose an icon, emoji, or monogram.": "Escolha um ícone, emoji ou monograma.",
  "Icon type": "Tipo de ícone",
  Icons: "Ícones",
  Emoji: "Emoji",
  Monogram: "Monograma",
  Color: "Cor",
  "Icon color": "Cor do ícone",
  "Search Lucide icons": "Buscar ícones do Lucide",
  "Search all Lucide icons": "Buscar em todos os ícones do Lucide",
  "No icons found.": "Nenhum ícone encontrado.",
  Letters: "Letras",
  "One or two letters or numbers.": "Uma ou duas letras ou números.",
  "Or paste any emoji": "Ou cole qualquer emoji",
  "Custom emoji": "Emoji personalizado",
  "Paste an emoji": "Cole um emoji",
  "Save icon": "Salvar ícone",
  "Searching project files…": "Buscando arquivos do projeto…",
  "Indexing project files…": "Indexando arquivos do projeto…",
  "No matching image files.": "Nenhum arquivo de imagem correspondente.",
  "No image files found.": "Nenhum arquivo de imagem encontrado.",
  Close: "Fechar",
  "Select icon": "Selecionar ícone",
  "Could not open image picker": "Não foi possível abrir o seletor de imagem",
  "Open in {name}": "Abrir no {name}",
  "Search image files…": "Buscar arquivos de imagem…",
  // Settings → Integrations: browser cookie import
  "That profile is no longer available. Choose where to import these cookies.":
    "Esse perfil não está mais disponível. Escolha para onde importar estes cookies.",
  "Quit {name} to import": "Feche o {name} para importar",
  "{name} is open, so its cookies can’t be read yet. Quit it, then continue.":
    "O {name} está aberto, então os cookies dele ainda não podem ser lidos. Feche-o e continue.",
  "I’ve quit it": "Já fechei",
  "no cookies": "nenhum cookie",
  "{count} cookie": "{count} cookie",
  "{count} cookies": "{count} cookies",
  "Could not open System Settings. Try Allow again.":
    "Não foi possível abrir os Ajustes do Sistema. Tente Permitir de novo.",
  "Let T3 Code read {name}’s cookies": "Deixe o T3 Code ler os cookies do {name}",
  "To import cookies from {name}, T3 Code needs Full Disk Access. Turn it on in System Settings, then come back to finish the import — you can revoke it again once the import is done.":
    "Para importar cookies do {name}, o T3 Code precisa de Acesso Total ao Disco. Ative nos Ajustes do Sistema e volte para concluir a importação — você pode revogar o acesso depois que a importação terminar.",
  "Full Disk Access": "Acesso Total ao Disco",
  "Read {name}'s cookies for this import.": "Ler os cookies do {name} para esta importação.",
  "Access is still required. Quit and reopen T3 Code if you just allowed it, then retry the import.":
    "O acesso ainda é necessário. Se você acabou de permitir, feche e abra o T3 Code de novo e tente a importação outra vez.",
  "If access doesn't update after you allow it, quit and reopen T3 Code, then retry the import.":
    "Se o acesso não atualizar depois que você permitir, feche e abra o T3 Code de novo e tente a importação outra vez.",
  Continue: "Continuar",
  "You've reached the profile limit. Choose an existing profile to import into.":
    "Você atingiu o limite de perfis. Escolha um perfil existente para importar.",
  "Import from {name}": "Importar do {name}",
  "Choose which cookies to import for {environment}.":
    "Escolha quais cookies importar para {environment}.",
  From: "De",
  Into: "Para",
  "Created for these cookies": "Criado para estes cookies",
  "Existing profile": "Perfil existente",
  Import: "Importar",
  "Importing…": "Importando…",
  "Importing cookies": "Importando cookies",
  "This may take a moment.": "Isso pode levar um momento.",
  "Checking {name}": "Verificando {name}",
  "Checking Full Disk Access.": "Verificando o Acesso Total ao Disco.",
  "Checking whether the browser has closed.": "Verificando se o navegador foi fechado.",
  "Checking access…": "Verificando acesso…",
  "Imported {count} cookie": "{count} cookie importado",
  "Imported {count} cookies": "{count} cookies importados",
  "Skipped {count} cookie": "{count} cookie ignorado",
  "Skipped {count} cookies": "{count} cookies ignorados",
  "No cookies found": "Nenhum cookie encontrado",
  "Added to {target} for {environment}.": "Adicionados a {target} para {environment}.",
  "{count} cookie skipped.": "{count} cookie ignorado.",
  "{count} cookies skipped.": "{count} cookies ignorados.",
  "No cookies were imported for {environment}.": "Nenhum cookie foi importado para {environment}.",
  "There were no cookies to import for {environment}.":
    "Não havia cookies para importar para {environment}.",
  Skipped: "Ignorados",
  "Couldn’t import from {name}": "Não foi possível importar do {name}",
  "{items} and {last}": "{items} e {last}",
  "{items} and {count} more": "{items} e mais {count}",
  // Settings → Integrations: browser import failures (text from BROWSER_IMPORT_FAILURE_COPY)
  "Not installed on this machine.": "Não instalado nesta máquina.",
  "Needs Keychain access to read its cookies.":
    "Precisa de acesso às Chaves para ler os cookies dele.",
  "No encryption key in your Keychain — sign in to that browser once, then retry.":
    "Nenhuma chave de criptografia nas suas Chaves — entre nesse navegador uma vez e tente de novo.",
  "Give T3 Code Full Disk Access in System Settings → Privacy & Security, then retry.":
    "Dê ao T3 Code Acesso Total ao Disco em Ajustes do Sistema → Privacidade e Segurança e tente de novo.",
  "Quit the browser first so its cookie database can be read.":
    "Feche o navegador antes para que o banco de cookies dele possa ser lido.",
  "Importing from this browser isn't possible on this platform.":
    "Não é possível importar deste navegador nesta plataforma.",
  "The system keyring could not be accessed. Make sure your desktop keyring is running and unlocked, then retry.":
    "Não foi possível acessar o chaveiro do sistema. Confira se o chaveiro do desktop está rodando e desbloqueado e tente de novo.",
  "That browser is no longer available to import from.":
    "Esse navegador não está mais disponível para importação.",
  "That browser profile no longer exists.": "Esse perfil do navegador não existe mais.",
  "The target profile could not be opened.": "Não foi possível abrir o perfil de destino.",
  "The cookies were imported, but the new profile couldn't be saved. Try again.":
    "Os cookies foram importados, mas não foi possível salvar o novo perfil. Tente novamente.",
  "You've reached the profile limit. Delete a profile or import into an existing one.":
    "Você atingiu o limite de perfis. Exclua um perfil ou importe para um existente.",
  "The browser's cookie database could not be read.":
    "Não foi possível ler o banco de cookies do navegador.",
  // Settings → search results
  "Worktree cleanup": "Limpeza de worktrees",
  "Artifacts and logs": "Artefatos e logs",
  "Project overview": "Visão geral do projeto",
  "Include app text": "Incluir texto do app",
  "Capture shortcut": "Atalho de captura",
  "Capture sound": "Som da captura",
  "Capture flash": "Flash da captura",
  "Capture animations": "Animações da captura",
  "Usage providers": "Provedores de uso",
  "Cursor account usage": "Uso da conta do Cursor",
  "Health check interval": "Intervalo da verificação de saúde",
  "Simulator support": "Suporte a simuladores",
  "Browser profiles": "Perfis do navegador",
  "Default browser profile": "Perfil padrão do navegador",
  "Automatically pull": "Fazer pull automaticamente",
  "Default merge method": "Método de merge padrão",
  "Source control": "Controle de versão",
  "Git fetch interval": "Intervalo do Git fetch",
  "Environment icon": "Ícone do ambiente",
  "Local environment": "Ambiente local",
  "Network access": "Acesso pela rede",
  "Tailscale HTTPS": "Tailscale HTTPS",
  "T3 Connect": "T3 Connect",
  "Publish agent activity": "Publicar atividade do agente",
  "This machine": "Esta máquina",
  Environments: "Ambientes",
  "Load balancing": "Balanceamento de carga",
  "GitHub sharing": "Compartilhamento do GitHub",
  "Archived threads": "Threads arquivadas",
  // Settings → Archive
  Unarchive: "Desarquivar",
  Delete: "Excluir",
  "Failed to unarchive thread": "Não foi possível desarquivar a thread",
  "Failed to delete thread": "Não foi possível excluir a thread",
  "Archived thread action failed": "A ação na thread arquivada falhou",
  "Loading archived threads": "Carregando threads arquivadas",
  "Could not load archived threads": "Não foi possível carregar as threads arquivadas",
  "No archived threads": "Nenhuma thread arquivada",
  "Checking connected environments.": "Verificando os ambientes conectados.",
  "Archived threads will appear here.": "As threads arquivadas vão aparecer aqui.",
  "Archived {archived} · Created {created}": "Arquivada {archived} · Criada {created}",
  // Settings → project defaults (new threads, repositories, browser)
  "default model": "modelo padrão",
  "default workspace": "espaço de trabalho padrão",
  Repositories: "Repositórios",
  "default permissions": "permissões padrão",
  "worktree submodules": "submódulos do worktree",
  "Keeps this project's default branch current when the checkout has no local changes or commits.":
    "Mantém a branch padrão deste projeto atualizada quando o checkout não tem mudanças nem commits locais.",
  "Keeps the default branch current when the checkout has no local changes or commits. Projects can override it.":
    "Mantém a branch padrão atualizada quando o checkout não tem mudanças nem commits locais. Os projetos podem substituir isso.",
  "default automatic pull": "pull automático padrão",
  "Reset automatic pull to off": "Redefinir o pull automático para desligado",
  "Default automatic pull": "Pull automático padrão",
  "Pull requests in this project start with this method.":
    "Os pull requests deste projeto começam com este método.",
  "Pull requests start with this method. Last selected reuses whatever you chose most recently on this device.":
    "Os pull requests começam com este método. Último selecionado reutiliza o que você escolheu por último neste dispositivo.",
  "default merge method": "método de merge padrão",
  "Reset to last selected": "Redefinir para o último selecionado",
  "Default pull request merge method": "Método de merge padrão dos pull requests",
  "Last selected": "Último selecionado",
  "Allow agents in this project to use the shared browser. Applies when the agent session next starts.":
    "Permite que os agentes deste projeto usem o navegador compartilhado. Vale a partir da próxima sessão do agente.",
  "Allow agents to use the shared browser. Projects can override it.":
    "Permite que os agentes usem o navegador compartilhado. Os projetos podem substituir isso.",
  "default browser access": "acesso padrão ao navegador",
  // Settings → row inheritance and reset
  override: "substituição",
  "Reset to inherited value": "Redefinir para o valor herdado",
  "Reconnect the selected environment to change this setting.":
    "Reconecte o ambiente selecionado para mudar esta configuração.",
  "This setting is saved on a server, and the hosted app is not anchored to one. Change it from the desktop app or from the server's own address.":
    "Esta configuração fica salva num servidor, e o app hospedado não está ligado a nenhum. Mude pelo app desktop ou pelo endereço do próprio servidor.",
  "Environment-wide setting. Select an environment to change it.":
    "Configuração do ambiente inteiro. Selecione um ambiente para mudá-la.",
  "Mixed across selected environments": "Diferente entre os ambientes selecionados",
  "Overridden for this project": "Substituído neste projeto",
  "Inherited from the repository's t3.json": "Herdado do t3.json do repositório",
  "Set on the environment": "Definido no ambiente",
  "Built-in default": "Padrão do app",
};
export default dictionary;
