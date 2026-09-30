/**
 * Shows startup failures before React can replace the boot splash.
 *
 * The text is Portuguese inline on purpose: importing ~/i18n here would pull every
 * dictionary into the boot chunk that must load before the app does.
 */
export function showBootError(error: unknown) {
  console.error("T3 Code failed to start.", error);
  const bootShell = document.getElementById("boot-shell");
  if (!bootShell) return;

  const content = document.createElement("div");
  content.id = "boot-error";
  content.setAttribute("role", "alert");

  const message = document.createElement("p");
  message.textContent = "Não foi possível carregar o T3 Code.";
  content.append(message);

  if (import.meta.env.DEV && error instanceof Error) {
    const detail = document.createElement("p");
    detail.textContent = error.message;
    content.append(detail);
  }

  const reload = document.createElement("button");
  reload.type = "button";
  reload.textContent = "Recarregar";
  reload.addEventListener("click", () => window.location.reload());
  content.append(reload);
  bootShell.replaceChildren(content);
}
