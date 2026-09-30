const dictionary: Readonly<Record<string, string>> = {
  // Textos novos que chegaram com a v0.0.44 do T3 Code original.

  // Fila de mensagens
  "Sending to the agent": "Enviando ao agente",
  "Sending. {status}.": "Enviando. {status}.",
  "Attachment '{name}' did not upload.": "Não foi possível enviar o anexo '{name}'.",
  'Queued message not sent in "{title}"': 'Não foi possível enviar a mensagem da fila em "{title}"',
  "Queued message not sent": "Não foi possível enviar a mensagem da fila",
  "Use Send now to try again.": "Use Enviar agora para tentar de novo.",

  // Limite de uso do ChatGPT
  "Using ChatGPT plan": "Usando o plano do ChatGPT",
  "Manage usage": "Gerenciar uso",
  "ChatGPT usage limit reached": "Limite de uso do ChatGPT atingido",
  "Review your usage settings in ChatGPT to continue.":
    "Revise suas configurações de uso no ChatGPT para continuar.",
  "Your ChatGPT plan is connected": "Seu plano do ChatGPT está conectado",
  "Eligible usage in T3 Code uses your ChatGPT plan. Manage your shared usage and any credit settings in ChatGPT.":
    "O uso elegível no T3 Code usa o seu plano do ChatGPT. Gerencie o uso compartilhado e as configurações de créditos no ChatGPT.",
  "{provider} on {environment}": "{provider} em {environment}",
  "View usage in ChatGPT with your connected account.":
    "Veja o uso no ChatGPT com a sua conta conectada.",
  "ChatGPT shared usage": "Uso compartilhado do ChatGPT",

  // Remover ambiente do T3 Connect
  "Remove {name} from this device?": "Remover {name} deste dispositivo?",
  "This forgets its pairing, credentials, and cached threads here.":
    "Isso apaga daqui o pareamento, as credenciais e as threads em cache.",
  "It stays on your T3 Connect account and keeps its host space. Deregister it in":
    "Ele continua na sua conta do T3 Connect e mantém o espaço do host. Cancele o registro em",
  "T3 Connect settings": "configurações do T3 Connect",
  "to free it.": "para liberá-lo.",
  "Remove from this device": "Remover deste dispositivo",

  // Boas-vindas
  "Some history was not imported": "Parte do histórico não foi importada",
  "Imported {count} thread": "{count} thread importada",
  "Imported {count} threads": "{count} threads importadas",
  "Connect your agents": "Conecte seus agentes",
  "Choose an agent to start coding. You can add more later.":
    "Escolha um agente para começar a programar. Você pode adicionar outros depois.",
  "Connect another ChatGPT account": "Conectar outra conta do ChatGPT",
  "Ready to code.": "Pronto para programar.",

  // Contas do Codex / ChatGPT
  "Add ChatGPT account": "Adicionar conta do ChatGPT",
  "Each account has its own Codex instance and sign-in. Choose the other account on the sign-in page.":
    "Cada conta tem a sua própria instância do Codex e o seu login. Escolha a outra conta na página de login.",
  "Codex runtime": "Runtime do Codex",
  "Preparing managed setup.": "Preparando a configuração gerenciada.",
  "Account name": "Nome da conta",
  "Shown in the provider list and model picker.":
    "Aparece na lista de provedores e no seletor de modelos.",
  "e.g. Personal or Work": "ex.: Pessoal ou Trabalho",
  "Adding account…": "Adicionando conta…",
  "Add an account or configure a provider on {environment}.":
    "Adicione uma conta ou configure um provedor em {environment}.",
  "Configure manually": "Configurar manualmente",
  "Reconnect ChatGPT": "Reconectar o ChatGPT",
  "On OpenAI, sign in with the account you choose here.":
    "Na OpenAI, entre com a conta que você escolher aqui.",
  "ChatGPT account to connect": "Conta do ChatGPT para conectar",
  "Use a different account": "Usar outra conta",
  "Continue with ChatGPT": "Continuar com o ChatGPT",
  "ChatGPT sign-in couldn't finish": "Não foi possível concluir o login no ChatGPT",
  "Return to the provider and try again.": "Volte ao provedor e tente de novo.",

  // Configuração do Codex
  "Signed in as": "Conectado como",
  "Connected with your Codex CLI.": "Conectado com o seu Codex CLI.",
  "Checking your Codex CLI...": "Verificando o seu Codex CLI...",
  "Code with your ChatGPT subscription.": "Programe com a sua assinatura do ChatGPT.",
  "Use existing CLI": "Usar o CLI existente",
  "ChatGPT account": "Conta do ChatGPT",
  "Preparing sign-in.": "Preparando o login.",
  "Codex setup failed. Try again.": "Não foi possível configurar o Codex. Tente de novo.",
  "ChatGPT sign-in could not finish. Try again.":
    "Não foi possível concluir o login no ChatGPT. Tente de novo.",
  "ChatGPT sign-in on the primary environment was interrupted. Try again.":
    "O login no ChatGPT no ambiente principal foi interrompido. Tente de novo.",
  "Could not finish sign-in on this computer. Try again or paste the redirect URL below.":
    "Não foi possível concluir o login neste computador. Tente de novo ou cole abaixo a URL de redirecionamento.",
  "Downloading {downloaded} of {total} MB.": "Baixando {downloaded} de {total} MB.",
  "Installing Codex.": "Instalando o Codex.",
  "Checking Codex.": "Verificando o Codex.",
  "Using your installed Codex": "Usando o Codex instalado",
  "Managed by T3 Code": "Gerenciado pelo T3 Code",
  "T3 Code downloads and manages Codex for you.": "O T3 Code baixa e gerencia o Codex para você.",
  "Finishing sign-in...": "Concluindo o login...",
  "Continue as {email} on OpenAI.": "Continue como {email} na OpenAI.",
  "Finish signing in in your browser.": "Conclua o login no navegador.",
  "Signed in with ChatGPT.": "Conectado com o ChatGPT.",
  "Use your ChatGPT subscription.": "Use a sua assinatura do ChatGPT.",
  "Open ChatGPT sign-in": "Abrir o login do ChatGPT",
  "Signing in...": "Entrando...",
  "If sign-in doesn't return to T3 Code, paste the URL from the final localhost page.":
    "Se o login não voltar para o T3 Code, cole a URL da última página do localhost.",
  "ChatGPT sign-in redirect URL": "URL de redirecionamento do login do ChatGPT",
  "Paste the URL from the sign-in tab": "Cole a URL da aba de login",
  "Try sign-in in your browser": "Tentar o login no navegador",
  "Other ways to connect": "Outras formas de conectar",
  "Use T3 desktop for automatic return": "Use o T3 desktop para voltar automaticamente",
  "Having trouble signing in?": "Problemas para entrar?",
  "Could not read setup status. Reconnect and try again.":
    "Não foi possível ler o status da configuração. Reconecte e tente de novo.",
  "Connected to ChatGPT.": "Conectado ao ChatGPT.",
  "Setting up...": "Configurando...",
  "Reconnect account": "Reconectar conta",
  "Codex setup": "Configuração do Codex",
  "Change account": "Trocar de conta",
  "Could not read Codex setup status. Reconnect and try again.":
    "Não foi possível ler o status da configuração do Codex. Reconecte e tente de novo.",
  "Selected by T3 Code.": "Escolhido pelo T3 Code.",
  "Codex binary path": "Caminho do binário do Codex",
  "Could not read runtime path": "Não foi possível ler o caminho do runtime",
  "Shared Codex config, sessions, and state.":
    "Configuração, sessões e estado do Codex compartilhados.",
  "Codex home path": "Caminho do CODEX_HOME",
  "Account-specific home sharing the Codex state above.":
    "Pasta própria da conta, que compartilha o estado do Codex acima.",
  "This instance uses the shared Codex home directly.":
    "Esta instância usa diretamente o CODEX_HOME compartilhado.",
  "Codex shadow home path": "Caminho da pasta sombra do Codex",
  "Not used": "Não usado",
  "Complete sign-in in your browser.": "Conclua o login no navegador.",

  // Credenciais do Bitbucket
  "Bitbucket credentials": "Credenciais do Bitbucket",
  "Access token": "Token de acesso",
  "Scoped to one repository, project, or workspace. Create it in that item's Bitbucket settings.":
    "Vale para um repositório, projeto ou workspace. Crie nas configurações do Bitbucket desse item.",
  "Learn more": "Saiba mais",
  "API token": "Token de API",
  "Uses your Atlassian account, so it reaches every repository you can. Give it read and write access to repositories and pull requests, and read:user:bitbucket.":
    "Usa a sua conta Atlassian, então alcança todo repositório que você alcança. Dê acesso de leitura e escrita a repositórios e pull requests, e read:user:bitbucket.",
  "Create an API token": "Criar um token de API",
  "Bitbucket sign-in method": "Forma de login no Bitbucket",
  "Atlassian account email": "E-mail da conta Atlassian",
  "Without a saved token, the server falls back to its T3CODE_BITBUCKET_* environment variables.":
    "Sem token salvo, o servidor usa as variáveis de ambiente T3CODE_BITBUCKET_*.",
  "Saving replaces your {method}.": "Salvar substitui o seu {method}.",

  // Uso
  "Usage: {metric}": "Uso: {metric}",
  "Usage: Period: {period}": "Uso: Período: {period}",
  "API estimate": "Estimativa de API",
  "Unpriced usage details": "Detalhes do uso sem preço",
  "API estimate excludes {percent} unpriced records.":
    "A estimativa de API exclui {percent} de registros sem preço.",
  "This client is older than the server on {environment}; its usage is excluded from totals.":
    "Este cliente é mais antigo que o servidor em {environment}; o uso dele fica fora dos totais.",

  // Largura do chat
  "Chat width": "Largura do chat",
  "chat width": "largura do chat",
  "Set how wide messages and the composer can grow on large screens.":
    "Define até que largura as mensagens e o campo de texto crescem em telas grandes.",
  "Comfortable (default)": "Confortável (padrão)",
  "chat width|Comfortable": "Confortável",
  "chat width|Wide": "Larga",
  "chat width|Full": "Tela inteira",

  // Configurações
  "No environments": "Nenhum ambiente",
};

export default dictionary;
