import type { ExecutionEnvironmentPlatformOs, FileManagerRevealKind } from "@t3tools/contracts";
import { t } from "~/i18n";

export function revealInFileExplorerLabel(platform: string): string {
  const normalized = platform.toLowerCase();
  if (normalized.includes("mac")) return t("Reveal in Finder");
  if (normalized.includes("win")) return t("Reveal in File Explorer");
  return t("Reveal in Files");
}

/** Same wording keyed by an environment's reported OS rather than a
    navigator platform string, for actions that reveal on the server machine. */
export function revealInFileExplorerLabelForOs(os: ExecutionEnvironmentPlatformOs): string {
  if (os === "darwin") return t("Reveal in Finder");
  if (os === "windows") return t("Reveal in File Explorer");
  return t("Reveal in Files");
}

/** Server-selected wording, including Windows File Explorer reached from WSL. */
export function revealInFileExplorerLabelForKind(kind: FileManagerRevealKind): string {
  if (kind === "finder") return t("Reveal in Finder");
  if (kind === "file-explorer") return t("Reveal in File Explorer");
  return t("Reveal in Files");
}
