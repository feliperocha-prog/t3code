/**
 * Pure helpers for the project home: where the project's state note lives in
 * the vault, and which parts of the note and the README it shows.
 */

/** Last path segment of a workspace root, for either separator style. */
export function projectFolderName(cwd: string): string {
  const segments = cwd.split(/[\\/]+/).filter((segment) => segment.length > 0);
  return segments.at(-1) ?? "";
}

/** The state note path used when the project does not set one. */
export function defaultStateNotePath(cwd: string): string {
  return `Projetos/${projectFolderName(cwd)}/HUB.md`;
}

/** The configured note path, or the default one when the setting is empty. */
export function resolveStateNotePath(cwd: string, configured: string): string {
  const trimmed = configured.trim();
  return trimmed.length > 0 ? trimmed : defaultStateNotePath(cwd);
}
