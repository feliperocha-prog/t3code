// Brazilian Portuguese for the native shell (menus, context menu, dialogs).
// The web UI has its own dictionary in apps/web/src/i18n; the English text
// stays in the code as the key so upstream merges stay small.
const ptBR: Readonly<Record<string, string>> = {
  // Application menu
  File: "Arquivo",
  Edit: "Editar",
  View: "Exibir",
  Window: "Janela",
  Help: "Ajuda",
  "Settings...": "Configurações...",
  "Check for Updates...": "Procurar atualizações...",
  "Paste as Text": "Colar como texto",
  Speech: "Fala",
  "Actual Size": "Tamanho real",
  "Zoom In": "Aumentar zoom",
  "Zoom Out": "Diminuir zoom",
  Undo: "Desfazer",
  Redo: "Refazer",
  Cut: "Recortar",
  Copy: "Copiar",
  Paste: "Colar",
  Delete: "Excluir",
  "Select All": "Selecionar tudo",
  Reload: "Recarregar",
  "Force Reload": "Forçar recarregamento",
  "Toggle Developer Tools": "Ferramentas do desenvolvedor",
  "Toggle Full Screen": "Tela cheia",
  Quit: "Sair",
  Close: "Fechar",
  Minimize: "Minimizar",
  Zoom: "Zoom",
  "Bring All to Front": "Trazer todas para a frente",
  "Start Speaking": "Começar a falar",
  "Stop Speaking": "Parar de falar",
  // Context menu
  "No suggestions": "Nenhuma sugestão",
  "Copy Link": "Copiar link",
  "Copy Image": "Copiar imagem",
  // Update dialogs
  "You're up to date!": "Você está com a versão mais recente!",
  "T3 Code {version} is currently the newest version available.":
    "O T3 Code {version} é a versão mais recente disponível.",
  "Update check failed": "Falha ao procurar atualizações",
  "Could not check for updates.": "Não foi possível procurar atualizações.",
  "An unknown error occurred. Please try again later.":
    "Ocorreu um erro desconhecido. Tente de novo mais tarde.",
  "Updates unavailable": "Atualizações indisponíveis",
  "Automatic updates are not available right now.":
    "As atualizações automáticas não estão disponíveis agora.",
  OK: "OK",
  // SnapShot shortcut status
  "This shortcut is already used by the system or another app.":
    "Este atalho já é usado pelo sistema ou por outro app.",
  "The system could not register this shortcut.": "O sistema não conseguiu registrar este atalho.",
  "SnapShots are not supported on this platform.":
    "SnapShots não são compatíveis com esta plataforma.",
  "Your desktop will confirm this shortcut when you save it.":
    "Seu sistema vai confirmar este atalho quando você salvar.",
};

export function t(text: string, vars?: Readonly<Record<string, string | number>>): string {
  const translated = ptBR[text] ?? text;
  if (!vars) return translated;
  return translated.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}
