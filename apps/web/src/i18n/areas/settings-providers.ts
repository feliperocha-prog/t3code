const dictionary: Readonly<Record<string, string>> = {
  // Settings → Providers: add provider instance wizard
  Driver: "Driver",
  Identity: "Identidade",
  Config: "Configuração",
  "Early Access": "Acesso antecipado",
  "Instance ID is required.": "O ID da instância é obrigatório.",
  "Instance ID must be 64 characters or fewer.":
    "O ID da instância deve ter no máximo 64 caracteres.",
  "Instance ID must start with a letter and use only letters, digits, '-', or '_'.":
    "O ID da instância deve começar com uma letra e usar só letras, dígitos, '-' ou '_'.",
  "An instance named '{id}' already exists.": "Já existe uma instância chamada '{id}'.",
  "{provider} Workspace": "Workspace do {provider}",
  "Provider instance added": "Instância de provedor adicionada",
  "{provider} instance '{id}' was added.": "A instância '{id}' do {provider} foi adicionada.",
  "Could not add provider instance": "Não foi possível adicionar a instância de provedor",
  "Update failed.": "A atualização falhou.",
  "Add provider instance": "Adicionar instância de provedor",
  "Configure an additional provider instance on {environment} — for example, a second Codex install pointed at a different workspace.":
    "Configure uma instância de provedor adicional em {environment} — por exemplo, uma segunda instalação do Codex apontando para outro workspace.",
  "Coming Soon": "Em breve",
  Label: "Nome",
  "e.g. Work": "ex.: Trabalho",
  "Shown in the provider list. Optional.": "Aparece na lista de provedores. Opcional.",
  "Instance ID": "ID da instância",
  "Routing key used by threads and sessions. Letters, digits, '-', or '_'.":
    "Chave de roteamento usada por threads e sessões. Letras, dígitos, '-' ou '_'.",
  "Accent color": "Cor de destaque",
  "Use {color} accent": "Usar o destaque {color}",
  Clear: "Limpar",
  "Optional marker shown in the picker.": "Marcador opcional exibido no seletor.",
  "This driver has no required configuration. You can add the instance now.":
    "Este driver não exige configuração. Você já pode adicionar a instância.",
  Cancel: "Cancelar",
  Back: "Voltar",
  Next: "Próximo",
  "Add instance": "Adicionar instância",

  // Settings → Providers: CLIProxyAPI hub dialog
  "Add a CLIProxyAPI hub": "Adicionar um hub CLIProxyAPI",
  "Show the quota of every account the hub pools, next to the providers on {environment}. The key stays on that server.":
    "Mostra a cota de cada conta reunida pelo hub, ao lado dos provedores em {environment}. A chave fica nesse servidor.",
  "Hub URL": "URL do hub",
  "Management key": "Chave de gerenciamento",
  "Label (optional)": "Nome (opcional)",
  "Defaults to the hub's host name": "Usa o nome do host do hub por padrão",
  "Add hub": "Adicionar hub",

  // Settings → Providers: custom model editor
  "Option {position} needs an id.": "A opção {position} precisa de um id.",
  'Option {position}: id "{id}" is used twice.':
    'Opção {position}: o id "{id}" é usado duas vezes.',
  "Option {position} needs a label.": "A opção {position} precisa de um nome.",
  "Option {position} needs at least one choice.":
    "A opção {position} precisa de pelo menos uma escolha.",
  "Option {position} has a choice without a value.":
    "A opção {position} tem uma escolha sem valor.",
  'Option {position}: choice "{choice}" is used twice.':
    'Opção {position}: a escolha "{choice}" é usada duas vezes.',
  value: "valor",
  "Choice value": "Valor da escolha",
  "Choice label": "Nome da escolha",
  "Default choice": "Escolha padrão",
  Default: "Padrão",
  "Remove choice": "Remover escolha",
  "Option {position}": "Opção {position}",
  "Option id": "Id da opção",
  "Custom…": "Personalizado…",
  "Option label": "Nome da opção",
  "Option type": "Tipo da opção",
  Toggle: "Chave",
  Choices: "Escolhas",
  "Remove option {position}": "Remover opção {position}",
  "Add choice": "Adicionar escolha",
  "Display name": "Nome de exibição",
  "Options shown in the composer": "Opções exibidas no composer",
  "Copy options from a built-in model": "Copiar opções de um modelo nativo",
  "Copy from…": "Copiar de…",
  "No custom options. The composer uses the provider's default options.":
    "Nenhuma opção personalizada. O composer usa as opções padrão do provedor.",
  "Custom option": "Opção personalizada",
  Save: "Salvar",
  // Custom model option presets (rendered via t(preset.label))
  Reasoning: "Raciocínio",
  Speed: "Velocidade",
  "Fast Mode": "Modo rápido",
  Thinking: "Pensamento",
  Agent: "Agente",

  // Settings → Providers: provider status
  "Checking provider status": "Verificando o status do provedor",
  "Waiting for the server to report installation and authentication details.":
    "Aguardando o servidor informar os detalhes de instalação e autenticação.",
  Disabled: "Desativado",
  "This provider is installed but disabled for new sessions in T3 Code.":
    "Este provedor está instalado, mas desativado para novas sessões no T3 Code.",
  "Not found": "Não encontrado",
  "CLI not detected on PATH.": "CLI não detectada no PATH.",
  "Not authenticated": "Não autenticado",
  "Needs attention": "Precisa de atenção",
  "The provider is installed, but the server could not fully verify it.":
    "O provedor está instalado, mas o servidor não conseguiu verificá-lo por completo.",
  "The provider failed its startup checks.": "O provedor falhou nas verificações de inicialização.",
  "Authenticated · {account}": "Autenticado · {account}",
  Authenticated: "Autenticado",
  Available: "Disponível",
  "Limited support": "Suporte limitado",
  "Unsupported version": "Versão sem suporte",
  "Known broken version": "Versão com defeito conhecido",
  "Use {version} for full support.": "Use {version} para ter suporte completo.",
  "Update for full support.": "Atualize para ter suporte completo.",
  "Update available": "Atualização disponível",
  "Update available: install {version}.": "Atualização disponível: instale a {version}.",
  "Update available: install the latest provider version.":
    "Atualização disponível: instale a versão mais recente do provedor.",

  // Settings → Providers: instance config fields (copy defined in packages/contracts settings schema)
  "Binary path": "Caminho do binário",
  "Path to the Codex binary used by this instance.":
    "Caminho do binário do Codex usado por esta instância.",
  "CODEX_HOME path": "Caminho do CODEX_HOME",
  "Custom Codex home and config directory.": "Pasta home e de configuração personalizada do Codex.",
  "Shadow home path": "Caminho da home sombra",
  "Account-specific Codex home. Keeps auth.json separate while sharing state from CODEX_HOME.":
    "Home do Codex específica da conta. Mantém o auth.json separado enquanto compartilha o estado do CODEX_HOME.",
  "Launch arguments": "Argumentos de inicialização",
  "Additional CLI arguments passed to codex app-server on session start.":
    "Argumentos de CLI extras passados ao codex app-server ao iniciar a sessão.",
  "Path to the Claude binary used by this instance.":
    "Caminho do binário do Claude usado por esta instância.",
  "CLAUDE_CONFIG_DIR path": "Caminho do CLAUDE_CONFIG_DIR",
  "Custom Claude home and config directory. Keeps .claude.json and .claude separate.":
    "Pasta home e de configuração personalizada do Claude. Mantém o .claude.json e o .claude separados.",
  "Additional CLI arguments passed on session start.":
    "Argumentos de CLI extras passados ao iniciar a sessão.",
  "e.g. --chrome": "ex.: --chrome",
  "Auto-compact after": "Compactar automaticamente após",
  "Compact after 100,000 to 1,000,000 tokens. Leave empty to use Claude's default.":
    "Compacta depois de 100.000 a 1.000.000 tokens. Deixe vazio para usar o padrão do Claude.",
  "e.g. 300000": "ex.: 300000",
  "Path to the Cursor agent binary.": "Caminho do binário do agente do Cursor.",
  "API endpoint": "Endpoint da API",
  "Override the Cursor API endpoint for this instance.":
    "Substitui o endpoint da API do Cursor nesta instância.",
  "Path to the Grok CLI binary.": "Caminho do binário da CLI do Grok.",
  "Google account": "Conta Google",
  "Gemini API key": "Chave de API do Gemini",
  "Agent Platform (Vertex AI)": "Agent Platform (Vertex AI)",
  "Sign-in method": "Método de login",
  "Google accounts use your subscription; API keys and Agent Platform bill usage.":
    "Contas Google usam a sua assinatura; chaves de API e o Agent Platform cobram pelo uso.",
  "API key": "Chave de API",
  "Gemini or Vertex AI express key. Stored in plain text.":
    "Chave express do Gemini ou do Vertex AI. Guardada em texto puro.",
  Optional: "Opcional",
  "GCP project": "Projeto do GCP",
  "Required for Gemini Enterprise. Agent Platform uses it when no API key is set.":
    "Obrigatório para o Gemini Enterprise. O Agent Platform usa quando não há chave de API.",
  "GCP location": "Região do GCP",
  "Region for Gemini Enterprise or Agent Platform.":
    "Região do Gemini Enterprise ou do Agent Platform.",
  "Custom ACP executable. Leave empty to select automatically.":
    "Executável ACP personalizado. Deixe vazio para escolher automaticamente.",
  "Path to the OpenCode binary.": "Caminho do binário do OpenCode.",
  "Server URL": "URL do servidor",
  "Leave blank to let T3 Code spawn the server when needed.":
    "Deixe em branco para o T3 Code iniciar o servidor quando precisar.",
  "Server password": "Senha do servidor",
  "Stored in plain text on disk.": "Guardada em texto puro no disco.",

  // Settings → Providers: instance card
  "Toggle account email visibility": "Alternar a visibilidade do e-mail da conta",
  "Click to reveal email": "Clique para mostrar o e-mail",
  "Click to hide email": "Clique para ocultar o e-mail",
  Variables: "Variáveis",
  "API keys, base URLs, and other per-instance CLI settings.":
    "Chaves de API, URLs base e outras configurações de CLI por instância.",
  "Add variable": "Adicionar variável",
  "Environment variable name {index}": "Nome da variável de ambiente {index}",
  "Stored secret, enter a new value to replace":
    "Segredo guardado; digite um novo valor para substituir",
  "Environment variable value {index}": "Valor da variável de ambiente {index}",
  "Mark environment variable {name} as sensitive":
    "Marcar a variável de ambiente {name} como sensível",
  "Sensitive, stored separately": "Sensível, guardada à parte",
  "Plain text": "Texto puro",
  "Remove environment variable {name}": "Remover a variável de ambiente {name}",
  "Sensitive values are stored separately and never returned to the app.":
    "Valores sensíveis são guardados à parte e nunca voltam para o app.",
  "{provider} update command copied": "Comando de atualização do {provider} copiado",
  "Run it in a terminal when you are ready to update.": "Rode no terminal quando quiser atualizar.",
  "Could not copy {provider} update command":
    "Não foi possível copiar o comando de atualização do {provider}",
  Incompatible: "Incompatível",
  Unsupported: "Sem suporte",
  "Authenticated as": "Autenticado como",
  "Select {name}": "Selecionar {name}",
  "Copy {name} update command": "Copiar o comando de atualização do {name}",
  "Copy update command": "Copiar comando de atualização",
  "Enable {name}": "Ativar {name}",
  "{title} — view details": "{title} — ver detalhes",
  "Install {version}": "Instalar {version}",
  "Update now": "Atualizar agora",
  "or, update manually using": "ou atualize manualmente com",
  "Copy command": "Copiar comando",
  "Delete instance {id}": "Excluir instância {id}",
  "Instance label": "Nome da instância",
  Setup: "Configuração inicial",
  Runtime: "Execução",
  "This instance uses": "Esta instância usa",
  ", which is not available in this build. Its configuration is preserved.":
    ", que não está disponível nesta build. A configuração dela foi preservada.",
  Environment: "Ambiente",
  Models: "Modelos",
  "Favorites, visibility, and ordering are saved on this device. Custom models are saved on the selected environment.":
    "Favoritos, visibilidade e ordem ficam salvos neste dispositivo. Modelos personalizados ficam salvos no ambiente selecionado.",

  // Settings → Providers: models list
  "Fast mode": "Modo rápido",
  "Enter a model slug.": "Digite o slug de um modelo.",
  "That model is already built in.": "Esse modelo já é nativo.",
  "Model slugs must be {max} characters or less.":
    "O slug do modelo deve ter no máximo {max} caracteres.",
  "That custom model is already saved.": "Esse modelo personalizado já está salvo.",
  "Remove {name} from favorites": "Remover {name} dos favoritos",
  "Add {name} to favorites": "Adicionar {name} aos favoritos",
  "Remove from favorites": "Remover dos favoritos",
  "Add to favorites": "Adicionar aos favoritos",
  "Move {name} up": "Mover {name} para cima",
  "Move up": "Mover para cima",
  "Move {name} down": "Mover {name} para baixo",
  "Move down": "Mover para baixo",
  "Edit {slug}": "Editar {slug}",
  "Edit name and options": "Editar nome e opções",
  "Remove {slug}": "Remover {slug}",
  "Remove custom model": "Remover modelo personalizado",
  "Custom models are always shown in the picker":
    "Modelos personalizados sempre aparecem no seletor",
  "Hidden from picker": "Oculto no seletor",
  "Shown in picker": "Exibido no seletor",
  "Show {name} in the model picker": "Exibir {name} no seletor de modelos",
  custom: "personalizado",
  "Filter models": "Filtrar modelos",
  "Enable all": "Ativar todos",
  "Disable all": "Desativar todos",
  "{count} model": "{count} modelo",
  "{count} models": "{count} modelos",
  "{count} favorite": "{count} favorito",
  "{count} favorites": "{count} favoritos",
  "{count} hidden model": "{count} oculto",
  "{count} hidden models": "{count} ocultos",
  "Add custom model": "Adicionar modelo personalizado",
  "No models match.": "Nenhum modelo corresponde.",
  "No models reported for this provider yet.": "Este provedor ainda não informou nenhum modelo.",
  Favorites: "Favoritos",
  All: "Todos",
  Add: "Adicionar",

  // Settings → Providers: panel
  "Checked unavailable": "Verificação indisponível",
  Checked: "Verificado",
  "Primary device": "Dispositivo principal",
  "Local device": "Dispositivo local",
  "Remote device": "Dispositivo remoto",
  "Loading provider settings": "Carregando as configurações dos provedores",
  "Could not connect to this device": "Não foi possível conectar a este dispositivo",
  "Provider settings are unavailable": "As configurações dos provedores estão indisponíveis",
  "Checking what this session is allowed to change.": "Verificando o que esta sessão pode alterar.",
  "Waiting for {environment}'s configuration.": "Aguardando a configuração de {environment}.",
  Devices: "Dispositivos",
  "Device unavailable": "Dispositivo indisponível",
  "Reconnect this device to set up its provider, or select another device.":
    "Reconecte este dispositivo para configurar o provedor dele ou selecione outro dispositivo.",
  "No connected devices": "Nenhum dispositivo conectado",
  "Loading devices": "Carregando dispositivos",
  "Connect an execution environment before configuring providers.":
    "Conecte um ambiente de execução antes de configurar os provedores.",
  "Reading connected execution environments.": "Lendo os ambientes de execução conectados.",
  "Could not update {provider}": "Não foi possível atualizar o {provider}",
  "The provider update command could not be started.":
    "Não foi possível iniciar o comando de atualização do provedor.",
  "{provider} provider settings": "configurações do provedor {provider}",
  "Refresh provider status": "Atualizar o status dos provedores",
  "Refreshing providers": "Atualizando provedores",
  "Add provider": "Adicionar provedor",
  "Limited permissions": "Permissões limitadas",
  "This session can view {environment}'s providers but can't change their settings.":
    "Esta sessão pode ver os provedores de {environment}, mas não pode alterar as configurações deles.",
  "This provider instance is no longer available on this device.":
    "Esta instância de provedor não está mais disponível neste dispositivo.",
  "No providers configured.": "Nenhum provedor configurado.",
  "This interval is configured here, then the shared Background activity policy decides whether provider probes may run when the timer fires. Custom intervals appear as Advanced in General settings.":
    "Este intervalo é configurado aqui; depois, a política compartilhada de Atividade em segundo plano decide se as verificações dos provedores podem rodar quando o timer dispara. Intervalos personalizados aparecem como Avançado nas configurações gerais.",
  "Refresh provider status, versions, and models in the background. Set to 0 to disable.":
    "Atualiza o status, as versões e os modelos dos provedores em segundo plano. Defina 0 para desativar.",
  "provider health check interval": "intervalo de verificação de saúde dos provedores",
  "Decrease provider health check interval":
    "Diminuir o intervalo de verificação de saúde dos provedores",
  "Provider health check interval in seconds":
    "Intervalo de verificação de saúde dos provedores em segundos",
  "Increase provider health check interval":
    "Aumentar o intervalo de verificação de saúde dos provedores",

  // Settings → Providers: Antigravity setup
  "Sign in with your Google account.": "Entre com a sua conta Google.",
  "Starting Google sign-in.": "Iniciando o login com Google.",
  "Waiting for Google sign-in.": "Aguardando o login com Google.",
  "Checking Google sign-in and available models.":
    "Verificando o login com Google e os modelos disponíveis.",
  "Google sign-in complete.": "Login com Google concluído.",
  "Google sign-in failed.": "O login com Google falhou.",
  "Google sign-in cancelled.": "Login com Google cancelado.",
  "Connect with the credentials in the provider settings.":
    "Conecte com as credenciais das configurações do provedor.",
  "Checking credentials.": "Verificando as credenciais.",
  "Checking credentials and available models.":
    "Verificando as credenciais e os modelos disponíveis.",
  "Connected.": "Conectado.",
  "Could not connect with the configured credentials.":
    "Não foi possível conectar com as credenciais configuradas.",
  "Connection cancelled.": "Conexão cancelada.",
  "Antigravity setup": "Configuração do Antigravity",
  "Device that runs this provider.": "Dispositivo que roda este provedor.",
  "Enable Antigravity": "Ativar o Antigravity",
  "Setup unavailable": "Configuração indisponível",
  "Provider setup is read-only.": "A configuração do provedor é somente leitura.",
  "Update required": "Atualização necessária",
  "Update this environment to manage Antigravity.":
    "Atualize este ambiente para gerenciar o Antigravity.",
  "Reading sign-in status.": "Lendo o status do login.",
  "Signed in with Google.": "Conectado com Google.",
  "Downloading {downloaded} MB.": "Baixando {downloaded} MB.",
  "Downloading {downloaded} MB of {total} MB.": "Baixando {downloaded} MB de {total} MB.",
  "Extracting Antigravity.": "Extraindo o Antigravity.",
  "Checking the downloaded runtime.": "Verificando o runtime baixado.",
  "Installed.": "Instalado.",
  "The configured Antigravity runtime is unavailable.":
    "O runtime configurado do Antigravity está indisponível.",
  "The configured Antigravity runtime has not been checked.":
    "O runtime configurado do Antigravity ainda não foi verificado.",
  "{size} MB download.": "Download de {size} MB.",
  "Not installed.": "Não instalado.",
  "Provider setup failed.": "A configuração do provedor falhou.",
  "Provider setup failed. Try again.": "A configuração do provedor falhou. Tente de novo.",
  "Could not open the sign-in page. Copy the link and open it in your browser.":
    "Não foi possível abrir a página de login. Copie o link e abra no seu navegador.",
  "Could not copy the sign-in link. Use Open sign-in page.":
    "Não foi possível copiar o link de login. Use Abrir página de login.",
  "Checking redirect": "Verificando o redirecionamento",
  "Sign out of Google for {name} on {environment}? This stops its running threads. Thread history is kept.":
    "Sair do Google no {name} em {environment}? Isso interrompe as threads em execução dele. O histórico das threads é mantido.",
  "Disconnect for {name} on {environment}? This stops its running threads. Thread history is kept.":
    "Desconectar o {name} em {environment}? Isso interrompe as threads em execução dele. O histórico das threads é mantido.",
  "Signing out": "Saindo",
  "Remove the downloaded Antigravity runtime from {environment}? Google sign-in and thread history are kept.":
    "Remover o runtime baixado do Antigravity de {environment}? O login com Google e o histórico das threads são mantidos.",
  "Removing runtime": "Removendo o runtime",
  "Install and manage Antigravity.": "Instale e gerencie o Antigravity.",
  "Uses the custom binary path below. Installation keeps that path.":
    "Usa o caminho de binário personalizado abaixo. A instalação mantém esse caminho.",
  "Automatic installation unavailable. Set a binary path or use another environment.":
    "Instalação automática indisponível. Defina um caminho de binário ou use outro ambiente.",
  "Antigravity download": "Download do Antigravity",
  "Cancelling installation": "Cancelando a instalação",
  "Cancel installation": "Cancelar instalação",
  "Starting installation": "Iniciando a instalação",
  "Update Antigravity": "Atualizar o Antigravity",
  "Reinstall Antigravity": "Reinstalar o Antigravity",
  "Retry installation": "Tentar instalar de novo",
  "Install managed runtime": "Instalar runtime gerenciado",
  "Install Antigravity": "Instalar o Antigravity",
  "Remove downloaded runtime": "Remover runtime baixado",
  "Connect your Google account.": "Conecte a sua conta Google.",
  "Connect with the credentials below.": "Conecte com as credenciais abaixo.",
  "Open sign-in page": "Abrir página de login",
  "Link copied": "Link copiado",
  "Copy sign-in link": "Copiar link de login",
  "Cancelling sign-in": "Cancelando o login",
  "Cancel sign-in": "Cancelar login",
  "Starting sign-in": "Iniciando o login",
  "Retry Google sign-in": "Tentar o login com Google de novo",
  "Sign in with Google": "Entrar com Google",
  "Retry connection": "Tentar conectar de novo",
  Connect: "Conectar",
  "Sign out of Google": "Sair do Google",
  Disconnect: "Desconectar",
  "Link expires at": "O link expira às",
  "If the final localhost page does not load, paste its full URL here.":
    "Se a página final do localhost não carregar, cole a URL completa dela aqui.",
  Continue: "Continuar",
  "Sign-in is open in another client. Complete or cancel it there.":
    "O login está aberto em outro cliente. Conclua ou cancele por lá.",
  "Retry setup status": "Tentar ler o status da configuração de novo",

  // Settings → Providers: usage hubs
  "Cursor account usage": "Uso da conta do Cursor",
  "Read your existing Cursor CLI login from macOS Keychain to show account history and monthly limits. macOS may ask you to allow access.":
    "Lê o login atual do Cursor CLI nas Chaves do macOS para mostrar o histórico da conta e os limites mensais. O macOS pode pedir para você permitir o acesso.",
  "No hubs configured.": "Nenhum hub configurado.",
  Remove: "Remover",
  "Remove {label}?": "Remover {label}?",
  "The hub's management key is deleted from this server. Its accounts leave the Limits view; the hub itself is untouched. Add it again with the URL and key to bring them back.":
    "A chave de gerenciamento do hub é excluída deste servidor. As contas dele saem da visão de Limites; o hub em si não é alterado. Adicione de novo com a URL e a chave para trazê-las de volta.",
  "Remove hub": "Remover hub",

  // Settings → Keybindings
  "Search keybindings": "Buscar atalhos de teclado",
  "Unknown condition: {name}": "Condição desconhecida: {name}",
  "Unknown conditions: {names}": "Condições desconhecidas: {names}",
  "T3 Code does not recognize this condition yet. It can still be saved, but it may not match unless the runtime provides it.":
    "O T3 Code ainda não reconhece esta condição. Ela pode ser salva mesmo assim, mas talvez não seja atendida se o runtime não a fornecer.",
  "Conflicts with {name}.": "Conflita com {name}.",
  "Conflicts with {names}.": "Conflita com {names}.",
  "Conflicts with {names}, and more.": "Conflita com {names} e outros.",
  "The most recent matching binding wins when both conditions can apply.":
    "O atalho correspondente mais recente vence quando as duas condições podem valer.",
  Condition: "Condição",
  "Negate {name}": "Negar {name}",
  Not: "Não",
  "Negate group": "Negar grupo",
  and: "e",
  or: "ou",
  Group: "Grupo",
  When: "Quando",
  Always: "Sempre",
  "When expression": "Expressão da condição",
  "Fix the expression above to continue editing visually.":
    "Corrija a expressão acima para continuar editando visualmente.",
  Saving: "Salvando",
  "Edit shortcut for {command}: {shortcut}": "Editar atalho de {command}: {shortcut}",
  "Keybinding for {command}": "Atalho de {command}",
  "Press shortcut": "Pressione o atalho",
  Unassigned: "Não atribuído",
  "Edit when clause for {command}": "Editar a condição de {command}",
  "Actions for {command}": "Ações de {command}",
  Custom: "Personalizado",
  "new keybinding": "novo atalho",
  Command: "Comando",
  "Cancel new keybinding": "Cancelar novo atalho",
  "New keybinding": "Novo atalho",
  "No keybindings match your search.": "Nenhum atalho corresponde à sua busca.",
  "Some shortcuts may be claimed by the browser before T3 Code sees them. Use the desktop app for better keybinding support.":
    "Alguns atalhos podem ser capturados pelo navegador antes de chegarem ao T3 Code. Use o app para desktop para ter um suporte melhor a atalhos.",
  "Unable to open keybindings file": "Não foi possível abrir o arquivo de atalhos",
  "The keybindings file was not opened.": "O arquivo de atalhos não foi aberto.",
  "Unable to save keybinding": "Não foi possível salvar o atalho",
  "The keybinding was not saved.": "O atalho não foi salvo.",
  "Unable to remove keybinding": "Não foi possível remover o atalho",
  "The keybinding was not removed.": "O atalho não foi removido.",
  binding: "atalho",
  bindings: "atalhos",
  "Add keybinding": "Adicionar atalho",
  "Open keybindings.json": "Abrir keybindings.json",
  "Clear all conditions": "Limpar todas as condições",
  "Remove condition": "Remover condição",
  "Remove group and its conditions": "Remover o grupo e as condições dele",
  "Use variables with !, &&, ||, and parentheses.": "Use variáveis com !, &&, || e parênteses.",

  // Settings → Keybindings: command labels (dynamic keys from commandLabel)
  "Pull Request: Copy Link or Thread ID": "Pull request: Copiar link ou ID da thread",
  "Run Script: {name}": "Executar script: {name}",
  "Thread: Jump: 1": "Thread: Ir para a 1ª",
  "Model Picker: Jump: 1": "Seletor de modelo: Ir para o 1º",
  "Thread: Jump: 2": "Thread: Ir para a 2ª",
  "Model Picker: Jump: 2": "Seletor de modelo: Ir para o 2º",
  "Thread: Jump: 3": "Thread: Ir para a 3ª",
  "Model Picker: Jump: 3": "Seletor de modelo: Ir para o 3º",
  "Thread: Jump: 4": "Thread: Ir para a 4ª",
  "Model Picker: Jump: 4": "Seletor de modelo: Ir para o 4º",
  "Thread: Jump: 5": "Thread: Ir para a 5ª",
  "Model Picker: Jump: 5": "Seletor de modelo: Ir para o 5º",
  "Thread: Jump: 6": "Thread: Ir para a 6ª",
  "Model Picker: Jump: 6": "Seletor de modelo: Ir para o 6º",
  "Thread: Jump: 7": "Thread: Ir para a 7ª",
  "Model Picker: Jump: 7": "Seletor de modelo: Ir para o 7º",
  "Thread: Jump: 8": "Thread: Ir para a 8ª",
  "Model Picker: Jump: 8": "Seletor de modelo: Ir para o 8º",
  "Thread: Jump: 9": "Thread: Ir para a 9ª",
  "Model Picker: Jump: 9": "Seletor de modelo: Ir para o 9º",
  "Thread: Stop": "Thread: Parar",
  "Thread: Steer Queued Message": "Thread: Redirecionar mensagem da fila",
  "Thread: Previous": "Thread: Anterior",
  "Thread: Next": "Thread: Próxima",
  "Thread: Settle": "Thread: Concluir",
  "Thread: Pin": "Thread: Fixar",
  "Thread: Undo": "Thread: Desfazer",
  "Model Picker: Toggle": "Seletor de modelo: Alternar",
  "Model Picker: Previous Provider": "Seletor de modelo: Provedor anterior",
  "Model Picker: Next Provider": "Seletor de modelo: Próximo provedor",
  "Sidebar: Toggle": "Barra lateral: Alternar",
  "Navigation: Back": "Navegação: Voltar",
  "Navigation: Forward": "Navegação: Avançar",
  "Terminal: Toggle": "Terminal: Alternar",
  "Terminal: Split": "Terminal: Dividir",
  "Terminal: Split Vertical": "Terminal: Dividir na vertical",
  "Terminal: New": "Terminal: Novo",
  "Terminal: Close": "Terminal: Fechar",
  "Right Panel: Toggle": "Painel direito: Alternar",
  "Right Panel: Toggle Maximized": "Painel direito: Alternar maximizado",
  "Right Panel: Close": "Painel direito: Fechar",
  "Pull Request: Copy Number": "Pull request: Copiar número",
  "Diff: Toggle": "Diff: Alternar",
  "Preview: Toggle": "Visualização: Alternar",
  "Preview: Refresh": "Visualização: Atualizar",
  "Preview: Focus Url": "Visualização: Focar na URL",
  "Preview: Zoom In": "Visualização: Aumentar zoom",
  "Preview: Zoom Out": "Visualização: Diminuir zoom",
  "Preview: Reset Zoom": "Visualização: Redefinir zoom",
  "Command Palette: Toggle": "Paleta de comandos: Alternar",
  "File Picker: Toggle": "Seletor de arquivos: Alternar",
  "Project Search: Toggle": "Busca no projeto: Alternar",
  "Usage: Open": "Uso: Abrir",
  "Theme: Select": "Tema: Selecionar",
  "Appearance: Cycle": "Aparência: Alternar em ciclo",
  "Theme Editor: Toggle": "Editor de tema: Alternar",
  "Composer: Stash": "Composer: Fazer stash",
  "Composer: Host": "Composer: Host",
  "Composer: Effort": "Composer: Esforço",
  "Composer: Mode": "Composer: Modo",
  "Composer: Workspace": "Composer: Workspace",
  "Composer: Previous Worktree": "Composer: Worktree anterior",
  "Composer: Branch": "Composer: Branch",
  "Chat: New": "Chat: Novo",
  "Chat: New Local": "Chat: Novo local",
  "Editor: Open Favorite": "Editor: Abrir favorito",

  // Settings → SnapShots: capture shortcut
  "Couldn't prepare the changes. Check Advanced for help.":
    "Não foi possível preparar as alterações. Veja Avançado para obter ajuda.",
  "Shortcut saved": "Atalho salvo",
  "Use {shortcut} from another app.": "Use {shortcut} a partir de outro app.",
  "Couldn't save your shortcut. Review the changes and try again.":
    "Não foi possível salvar o seu atalho. Revise as alterações e tente de novo.",
  Shortcut: "Atalho",
  "Press your shortcut. Esc cancels.": "Pressione o seu atalho. Esc cancela.",
  "Saved, but the shortcut needs attention. Check Advanced for help.":
    "Salvo, mas o atalho precisa de atenção. Veja Avançado para obter ajuda.",
  "Shortcut removed.": "Atalho removido.",
  "Use {shortcut} from another app to capture a window.":
    "Use {shortcut} a partir de outro app para capturar uma janela.",
  "Review the change below to remove your shortcut.":
    "Revise a alteração abaixo para remover o seu atalho.",
  "Review the change below, then save your shortcut.":
    "Revise a alteração abaixo e depois salve o seu atalho.",
  "There's no capture shortcut to remove.": "Não há atalho de captura para remover.",
  "This shortcut is already set up.": "Este atalho já está configurado.",
  "Shortcut changes": "Alterações do atalho",
  "Only these changes will be saved. We'll keep a backup.":
    "Só estas alterações serão salvas. Vamos manter um backup.",
  "Saving…": "Salvando…",
  "Save shortcut": "Salvar atalho",
  "Remove shortcut": "Remover atalho",
  "Allow T3 Code to read your desktop settings. You'll review any changes here before saving.":
    "Permita que o T3 Code leia as configurações do seu desktop. Você revisa qualquer alteração aqui antes de salvar.",
  "Preparing changes…": "Preparando as alterações…",
  "Review changes": "Revisar alterações",
  "Update T3 Code to finish setting up your shortcut.":
    "Atualize o T3 Code para terminar de configurar o seu atalho.",
  "Connecting to your desktop…": "Conectando ao seu desktop…",
  "Restart T3 Code to finish connecting your shortcut.":
    "Reinicie o T3 Code para terminar de conectar o seu atalho.",
  Troubleshooting: "Solução de problemas",
  "Settings file": "Arquivo de configurações",
  "T3 Code also reads any files included by this file.":
    "O T3 Code também lê os arquivos incluídos por este arquivo.",
  "Linked to {path}. The link will be kept.": "Vinculado a {path}. O vínculo será mantido.",
  "Choose a different file…": "Escolher outro arquivo…",
  "Remove shortcut…": "Remover atalho…",
  "Use your desktop's shortcut settings file.":
    "Use o arquivo de configurações de atalhos do seu desktop.",
  "A custom --config or NIRI_CONFIG can change its location.":
    "Um --config personalizado ou NIRI_CONFIG pode mudar o local dele.",
  "On Omarchy, use your own bindings file, not its defaults.":
    "No Omarchy, use o seu próprio arquivo de atalhos, não o padrão dele.",
  "Backup: {path}": "Backup: {path}",
  "Manual setup": "Configuração manual",
  "Paste this inside binds { … } in your Niri config, then save.":
    "Cole isto dentro de binds { … } na sua configuração do Niri e depois salve.",
  "Add this binding to your Hyprland config, then save.":
    "Adicione este atalho à sua configuração do Hyprland e depois salve.",
  "Change the keys if needed.": "Mude as teclas se precisar.",
  Copied: "Copiado",
  "Copy shortcut": "Copiar atalho",
  "Turn capture off in T3 Code to stop it. Remove the shortcut from {desktop} to free up the keys.":
    "Desligue a captura no T3 Code para interrompê-la. Remova o atalho do {desktop} para liberar as teclas.",
  "I've added the shortcut": "Já adicionei o atalho",
  "Could not start shortcut recording.": "Não foi possível começar a gravar o atalho.",
  "Add a letter, number, or function key to your shortcut.":
    "Adicione uma letra, um número ou uma tecla de função ao seu atalho.",
  "Record snapshot shortcut, currently {shortcut}": "Gravar atalho de snapshot, atual: {shortcut}",
  "Change snapshot shortcut": "Mudar atalho de snapshot",
  "Press shortcut…": "Pressione o atalho…",
  "Change shortcut": "Mudar atalho",
  "Choose shortcut": "Escolher atalho",

  // Settings → SnapShots: status and setup messages
  "Checking snapshots…": "Verificando snapshots…",
  "Not supported on this platform.": "Não compatível com esta plataforma.",
  "Turn this on to set up snapshots.": "Ative para configurar os snapshots.",
  "Capture needs attention": "A captura precisa de atenção",
  "Check capture access in setup": "Verifique o acesso de captura na configuração",
  "Install the capture helper to continue": "Instale o auxiliar de captura para continuar",
  "Set up active-window snapshots": "Configurar snapshots da janela ativa",
  "Manual capture only — you'll choose a window each time":
    "Só captura manual — você escolhe uma janela a cada vez",
  "Enable capture to continue": "Ative a captura para continuar",
  "Connecting your shortcut…": "Conectando seu atalho…",
  "Waiting for shortcut permission": "Aguardando permissão do atalho",
  "Ready to capture": "Pronto para capturar",
  "Use your shortcut from another app": "Use seu atalho em outro app",
  "Finish shortcut setup": "Concluir a configuração do atalho",
  "Approve the shortcut permission prompt to continue.":
    "Aprove o pedido de permissão do atalho para continuar.",
  "Shortcut saved.": "Atalho salvo.",
  "Continue setup": "Continuar configuração",
  "Manage capture": "Gerenciar captura",
  "Set up {desktop} capture": "Configurar captura do {desktop}",
  "Capture effects aren't available on this desktop.":
    "Os efeitos de captura não estão disponíveis neste desktop.",
  "Install or update the capture helper to enable effects.":
    "Instale ou atualize o auxiliar de captura para ativar os efeitos.",
  "Capture effects aren't available on Niri.":
    "Os efeitos de captura não estão disponíveis no Niri.",
  "Update the GNOME extension, then sign out and back in to enable effects.":
    "Atualize a extensão do GNOME e depois saia e entre de novo na sessão para ativar os efeitos.",
  "Finish extension setup to enable effects.":
    "Conclua a configuração da extensão para ativar os efeitos.",
  "Automatic capture isn't available here. Choose a window instead.":
    "A captura automática não está disponível aqui. Escolha uma janela.",
  "Capture a window and attach it to your current draft.":
    "Capture uma janela e anexe ao seu rascunho atual.",
  "This desktop only provides a screenshot.": "Este desktop só oferece captura de tela.",
  "Update the desktop app to use snapshots.": "Atualize o app para desktop para usar snapshots.",
  "Only available in the desktop app.": "Disponível só no app para desktop.",
  "Still unable to check access. See Advanced for help.":
    "Ainda não foi possível verificar o acesso. Veja Avançado para obter ajuda.",
  "Ready. You'll choose a window each time.": "Pronto. Você vai escolher uma janela a cada vez.",
  "Still waiting for you to sign out and back in.":
    "Ainda aguardando você sair e entrar de novo na sessão.",
  "Ready. Continue to choose your shortcut.": "Pronto. Continue para escolher seu atalho.",
  "Not ready yet. Finish the step above.": "Ainda não está pronto. Conclua a etapa acima.",

  // Settings → SnapShots: settings page
  Off: "Desligado",
  "Whoosh (Default)": "Whoosh (Padrão)",
  "(Default)": "(Padrão)",
  Click: "Clique",
  "Couldn't check capture setup": "Não foi possível verificar a configuração da captura",
  "Couldn't open shortcut permissions": "Não foi possível abrir as permissões do atalho",
  "Couldn't complete capture setup": "Não foi possível concluir a configuração da captura",
  "Couldn't save capture settings": "Não foi possível salvar as configurações de captura",
  "Couldn't allow app text capture": "Não foi possível permitir a captura de texto do app",
  "Couldn't verify capture access": "Não foi possível verificar o acesso de captura",
  "Couldn't close capture setup": "Não foi possível fechar a configuração da captura",
  "Could not check this shortcut.": "Não foi possível verificar este atalho.",
  'T3 Code already uses this for "{command}".': 'O T3 Code já usa este atalho para "{command}".',
  "Checking shortcut…": "Verificando atalho…",
  "Ready to save.": "Pronto para salvar.",
  "Try a shortcut such as Ctrl+Shift+2.": "Tente um atalho como Ctrl+Shift+2.",
  "Restart T3 Code to finish capture setup.":
    "Reinicie o T3 Code para concluir a configuração da captura.",
  "Updating capture settings…": "Atualizando as configurações de captura…",
  "Enable snapshots": "Ativar snapshots",
  "Include text and controls when the app makes them available.":
    "Incluir texto e controles quando o app os disponibilizar.",
  "Include app text in snapshots": "Incluir texto do app nos snapshots",
  "Choose a window to capture from any app.": "Escolha uma janela para capturar em qualquer app.",
  "Capture the window you're using without switching apps.":
    "Capture a janela que você está usando sem trocar de app.",
  "Shortcut permissions": "Permissões do atalho",
  "Choose the sound played when capture starts.": "Escolha o som tocado quando a captura começa.",
  "Snapshot sound: {sound}": "Som do snapshot: {sound}",
  "Play Whoosh": "Tocar Whoosh",
  "Play Click": "Tocar Clique",
  "Show a gentle cue on the captured window.": "Mostrar um sinal suave na janela capturada.",
  "Flash captured window": "Piscar a janela capturada",
  "Animate captured windows into your draft.":
    "Animar a entrada das janelas capturadas no rascunho.",
  "Animate snapshots": "Animar snapshots",

  // Settings → SnapShots: setup dialog
  "Set up snapshots for {desktop}": "Configurar snapshots para {desktop}",
  "Set up snapshots": "Configurar snapshots",
  Access: "Acesso",
  "Install the extension": "Instalar a extensão",
  "The T3 Code GNOME extension lets you capture other windows and bring them into your draft. Sign out once after installing.":
    "A extensão do T3 Code para GNOME permite capturar outras janelas e trazê-las para o seu rascunho. Saia da sessão uma vez depois de instalar.",
  "Extension installed": "Extensão instalada",
  "Save your work, then sign out and back in. Your setup will be waiting here.":
    "Salve seu trabalho e depois saia e entre de novo na sessão. Sua configuração vai estar esperando aqui.",
  "Update the extension": "Atualizar a extensão",
  "Install the update, then sign out and back in.":
    "Instale a atualização e depois saia e entre de novo na sessão.",
  "Allow GNOME extensions": "Permitir extensões do GNOME",
  "Open GNOME Extensions and turn on extensions, then check again.":
    "Abra o GNOME Extensions, ative as extensões e verifique de novo.",
  "Enable the extension": "Ativar a extensão",
  "Enable T3 Code SnapShots to start capturing windows.":
    "Ative o T3 Code SnapShots para começar a capturar janelas.",
  "Capture is ready": "A captura está pronta",
  "Next, choose your shortcut.": "Agora, escolha seu atalho.",
  "Automatic capture isn't available": "A captura automática não está disponível",
  "Use Take snapshot from the command palette to choose a window.":
    "Use o comando Tirar snapshot na paleta de comandos para escolher uma janela.",
  "Couldn't set up the extension": "Não foi possível configurar a extensão",
  "Check T3 Code SnapShots in GNOME Extensions, then try again.":
    "Verifique o T3 Code SnapShots no GNOME Extensions e tente de novo.",
  "Permission status unavailable": "Status da permissão indisponível",
  "Let's try that again": "Vamos tentar de novo",
  "Couldn't check snapshots. Try again to continue.":
    "Não foi possível verificar os snapshots. Tente de novo para continuar.",
  "Check capture access": "Verificar o acesso de captura",
  "The extension isn't ready yet. Try again in a moment.":
    "A extensão ainda não está pronta. Tente de novo em instantes.",
  "Let's fix capture access": "Vamos corrigir o acesso de captura",
  "Try reinstalling the capture helper, then check again.":
    "Tente reinstalar o auxiliar de captura e verifique de novo.",
  "Update the capture helper": "Atualizar o auxiliar de captura",
  "Allow snapshots": "Permitir snapshots",
  "T3 Code's capture helper lets you capture other apps and return to your draft. It's included with T3 Code.":
    "O auxiliar de captura do T3 Code permite capturar outros apps e voltar ao seu rascunho. Ele já vem com o T3 Code.",
  "Choose a window each time": "Escolher uma janela a cada vez",
  "Your desktop doesn't support automatic capture. You'll choose the window to capture instead.":
    "Seu desktop não oferece captura automática. Você vai escolher a janela a capturar.",
  "Your desktop may ask for permission when you first capture.":
    "Seu desktop pode pedir permissão na primeira captura.",
  "Test a snapshot of the current window. If macOS asks to bypass its window picker, choose Allow. The test image is discarded.":
    "Teste um snapshot da janela atual. Se o macOS pedir para ignorar o seletor de janelas, escolha Permitir. A imagem de teste é descartada.",
  "Allow each permission, then continue.": "Conceda cada permissão e depois continue.",
  "Allow access when prompted to start capturing windows.":
    "Permita o acesso quando solicitado para começar a capturar janelas.",
  "Choose your shortcut": "Escolha seu atalho",
  "Click the shortcut, then press the keys you want.":
    "Clique no atalho e pressione as teclas que quiser.",
  "Choose your keys, then approve the permission prompt if asked.":
    "Escolha as teclas e aprove o pedido de permissão, se aparecer.",
  "Use both Shift keys, or record a different shortcut.":
    "Use as duas teclas Shift ou grave outro atalho.",
  "Screen Recording": "Gravação de tela",
  "Capture the window you're using.": "Capturar a janela que você está usando.",
  Accessibility: "Acessibilidade",
  "Include text and controls from the captured app.": "Incluir texto e controles do app capturado.",
  "Optional. Include text and controls from the captured app.":
    "Opcional. Incluir texto e controles do app capturado.",
  "Reinstall helper": "Reinstalar auxiliar",
  "Try again": "Tentar de novo",
  "Capture needs attention. Go back to check access.":
    "A captura precisa de atenção. Volte para verificar o acesso.",
  "Couldn't finish this step. Try again or check Advanced for help.":
    "Não foi possível concluir esta etapa. Tente novamente ou veja Avançado para obter ajuda.",
  "Included with T3 Code. No download needed.": "Já vem com o T3 Code. Não precisa baixar nada.",
  "Disable extension": "Desativar extensão",
  "Remove capture helper": "Remover auxiliar de captura",
  Close: "Fechar",
  "Finish later": "Terminar depois",
  "Installing…": "Instalando…",
  "Check again": "Verificar de novo",
  "Update helper": "Atualizar auxiliar",
  "Install helper": "Instalar auxiliar",
  "Enabling…": "Ativando…",
  "Working…": "Processando…",
  "Update extension": "Atualizar extensão",
  "Install extension": "Instalar extensão",
  "Enable extension": "Ativar extensão",
  "Test capture and continue": "Testar captura e continuar",
  "Allow capture": "Permitir captura",
  "Save and finish": "Salvar e concluir",

  // Usage → custom model prices
  "Input tokens": "Entrada",
  Output: "Saída",
  "Cache read": "Leitura de cache",
  "Cache write": "Escrita de cache",
  "Input rate": "Taxa de entrada",
  "Enter a model ID.": "Informe o ID do modelo.",
  "{field} is required on {target}.": "O campo {field} é obrigatório em {target}.",
  "Use non-negative numbers for prices.": "Use números não negativos nos preços.",
  "Could not save. Try again.": "Não foi possível salvar. Tente novamente.",

  // Usage → custom model prices dialog
  Offline: "Offline",
  "Prices not loaded": "Preços não carregados",
  "Update server to edit prices": "Atualize o servidor para editar preços",
  "Checking permissions…": "Verificando permissões…",
  "Read-only access": "Acesso somente leitura",
  "This model already has a row. Edit its prices there.":
    "Este modelo já tem uma linha. Edite os preços nela.",
  "{count} environments": "{count} ambientes",
  "All environments": "Todos os ambientes",
  "Environment removed": "Ambiente removido",
  "Custom model prices": "Preços personalizados de modelos",
  "Prices apply to all past and future usage on the environments you select.":
    "Os preços valem para todo o uso, passado e futuro, nos ambientes selecionados.",
  "Apply to": "Aplicar a",
  "USD / million tokens": "USD / milhão de tokens",
  "Connect an environment to set model prices.":
    "Conecte um ambiente para definir preços de modelos.",
  "Select an environment to see and change its model prices.":
    "Selecione um ambiente para ver e alterar os preços dos modelos.",
  "Model ID": "ID do modelo",
  "Add model price": "Adicionar preço de modelo",
  "Some environment prices are unavailable.": "Alguns preços de ambientes estão indisponíveis.",
  "No custom prices. Add a row to override automatic pricing.":
    "Nenhum preço personalizado. Adicione uma linha para substituir o preço automático.",
  "New model ID": "ID do novo modelo",
  "Automatic pricing after saving": "Preço automático após salvar",
  "{field} price for {model}": "{field}: preço para {model}",
  "new model": "novo modelo",
  "Undo reset for {model}": "Desfazer redefinição de {model}",
  "Remove new model": "Remover novo modelo",
  "Reset price for {model} to automatic": "Redefinir o preço de {model} para automático",
  "Undo reset": "Desfazer redefinição",
  "Remove row": "Remover linha",
  "Reset to automatic": "Redefinir para automático",
  "Blank cache rates use the input price. Enter 0 for free tokens.":
    "Taxas de cache em branco usam o preço de entrada. Informe 0 para tokens gratuitos.",
  "Mixed cells keep each environment’s rate until you edit them.":
    "Células mistas mantêm a taxa de cada ambiente até você editá-las.",
  "Not saved · {error}": "Não salvo · {error}",
  Saved: "Salvo",
  "Changes apply to {destination}": "As alterações valem para {destination}",
  "Discard pending changes": "Descartar alterações pendentes",
  "Discard changes": "Descartar alterações",
  "Retry failed saves": "Tentar de novo os salvamentos que falharam",

  // Usage → subscription limits and reset credits
  "Ahead of pace: spending faster than the window elapses":
    "Acima do ritmo: gastando mais rápido do que a janela avança",
  "On pace with the window": "No ritmo da janela",
  "Under pace: headroom left for the rest of the window":
    "Abaixo do ritmo: sobra margem para o resto da janela",
  "{percent}% left": "{percent}% restante",
  "{percent}% of the window left": "{percent}% da janela restante",
  "The line is where even spending would be.": "A linha marca onde estaria um gasto uniforme.",
  "Resets {time}": "Redefinição: {time}",
  "Reset applied. Your windows have cleared.": "Redefinição aplicada. Suas janelas foram zeradas.",
  "Nothing to reset right now.": "Nada para redefinir agora.",
  "No reset credit left.": "Não resta crédito de redefinição.",
  "That credit was already redeemed.": "Esse crédito já foi resgatado.",
  "Could not use the reset credit.": "Não foi possível usar o crédito de redefinição.",
  "Use a reset credit?": "Usar um crédito de redefinição?",
  "This redeems one credit on your account and clears the current rate-limit windows. It cannot be undone.":
    "Isso resgata um crédito da sua conta e zera as janelas atuais de limite de requisições. Não pode ser desfeito.",
  "Use credit": "Usar crédito",
  "No reset credits banked": "Nenhum crédito de redefinição em reserva",
  "{count} banked": "{count} em reserva",
  "expires in {duration}": "expira em {duration}",
  "{count} reset credit banked": "{count} crédito de redefinição em reserva",
  "{count} reset credits banked": "{count} créditos de redefinição em reserva",
  "next expires in {duration}": "o próximo expira em {duration}",
  "Using…": "Usando…",
  "Use reset": "Usar redefinição",

  // Usage → pooled subscription limits
  "Account {initials}": "Conta {initials}",
  Plan: "Plano",
  "Signed in": "Logado em",
  Via: "Via",
  Left: "Restante",
  Resets: "Redefine",
  in: "em",
  Restores: "Devolve",
  "+{percent}% of pool": "+{percent}% do total",
  Segment: "Segmento",
  left: "restante",
  "No provider on the selected environments reports subscription limits.":
    "Nenhum provedor nos ambientes selecionados informa limites de assinatura.",

  // Usage → usage page
  Cost: "Custo",
  Tokens: "Tokens",
  Limits: "Limites",
  "Past 24h": "Últimas 24h",
  "{count} days": "{count} dias",
  "{start} to {end}": "{start} a {end}",
  "Usage breadcrumb": "Trilha de navegação de Uso",
  Usage: "Uso",
  "Usage metric": "Métrica de uso",
  "Usage period": "Período de uso",
  "Refresh limits": "Atualizar limites",
  "Refresh usage": "Atualizar uso",
  "Connect an environment to see limits.": "Conecte um ambiente para ver os limites.",
  "Connect an environment to see usage.": "Conecte um ambiente para ver o uso.",
  "Select an environment to see limits.": "Selecione um ambiente para ver os limites.",
  "Select an environment to see usage.": "Selecione um ambiente para ver o uso.",
  "{count} session": "{count} sessão",
  "{count} sessions": "{count} sessões",
  "{count} sessions · API estimate excludes {percent} unpriced records":
    "{count} sessões · a estimativa de API exclui {percent} de registros sem preço",
  "{count} sessions · API estimate": "{count} sessões · estimativa de API",
  "{percent} of cost · {tokens} tokens": "{percent} do custo · {tokens} tokens",
  "{percent} of tokens · {cost}": "{percent} dos tokens · {cost}",
  "Hourly processed tokens": "Tokens processados por hora",
  "Hourly cost": "Custo por hora",
  "Daily processed tokens": "Tokens processados por dia",
  "Daily cost": "Custo por dia",
  Totals: "Totais",
  "Processed tokens": "Tokens processados",
  "Cached input": "Entrada em cache",
  "Uncached input": "Entrada sem cache",
  "Cache savings": "Economia com cache",
  Breakdown: "Detalhamento",
  "Usage breakdown": "Detalhamento do uso",
  Hour: "Hora",
  Day: "Dia",
  Share: "Parcela",
  "No activity in this window.": "Nenhuma atividade neste período.",
  Unpriced: "Sem preço",
  Total: "Total",
  "Requires access to your Cursor login in macOS Keychain.":
    "Requer acesso ao seu login do Cursor no Keychain do macOS.",
  Enable: "Ativar",
  "Enable Cursor usage from {environment}": "Ativar o uso do Cursor em {environment}",
  "Enable on {environment}": "Ativar em {environment}",
  "{environment} could not report usage.": "{environment} não conseguiu informar o uso.",
  "{environment} runs an older server version and is excluded from totals.":
    "{environment} usa uma versão antiga do servidor e fica fora dos totais.",
  "Counted once across environments sharing a transcript directory: {sources}":
    "Contado uma vez entre ambientes que compartilham um diretório de transcrições: {sources}",
  "{count} environment still scanning": "{count} ambiente ainda em análise",
  "{count} environments still scanning": "{count} ambientes ainda em análise",
  "totals are partial": "os totais são parciais",
  "Some environments could not report usage": "Alguns ambientes não conseguiram informar o uso",
  "Scanning…": "Analisando…",
  "Refreshing…": "Atualizando…",
  Ready: "Pronto",
  "No environments connected.": "Nenhum ambiente conectado.",
  "Totals are partial while selected environments scan.":
    "Os totais são parciais enquanto os ambientes selecionados são analisados.",
  "Model prices": "Preços de modelos",

  // Usage → provider chart
  "Hourly processed tokens by provider": "Tokens processados por hora, por provedor",
  "Hourly cost by provider": "Custo por hora, por provedor",
  "Daily processed tokens by provider": "Tokens processados por dia, por provedor",
  "Daily cost by provider": "Custo por dia, por provedor",
};
export default dictionary;
