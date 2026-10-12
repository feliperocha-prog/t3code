import { tc } from "~/i18n";

import type { GitTermName } from "../git/gitTerms";

/** The slice of the git status the "Is it live?" block reads. */
export interface DeployStateInput {
  readonly isRepo: boolean;
  readonly hasWorkingTreeChanges: boolean;
  readonly workingTree: { readonly files: ReadonlyArray<unknown> };
  readonly hasUpstream: boolean;
  readonly aheadCount: number;
  readonly behindCount: number;
}

export type DeployStateLineKind =
  | "unsaved"
  | "clean"
  | "ahead"
  | "behind"
  | "published"
  | "neverPublished";

export type DeployStateTone = "green" | "yellow";

export interface DeployStateLine {
  readonly kind: DeployStateLineKind;
  readonly text: string;
  readonly tone: DeployStateTone;
  /** Git term the line is about, shown small next to it; null when none fits. */
  readonly term: GitTermName | null;
}

function countText(count: number, one: string, many: string): string {
  return count === 1 ? tc("deploy state", one, { count }) : tc("deploy state", many, { count });
}

/**
 * Plain-language lines about how far the project's work is from GitHub:
 * unsaved edits, saved versions not yet published, versions others published,
 * or everything published. Null when the folder is not a git repository.
 * Git does not record when something was last published, so no date is shown.
 */
export function describeDeployState(status: DeployStateInput): DeployStateLine[] | null {
  if (!status.isRepo) return null;
  const lines: DeployStateLine[] = [];

  if (status.hasWorkingTreeChanges) {
    lines.push({
      kind: "unsaved",
      text: countText(
        status.workingTree.files.length,
        "{count} file changed and not saved as a version yet",
        "{count} files changed and not saved as a version yet",
      ),
      tone: "yellow",
      term: "commit",
    });
  } else {
    lines.push({
      kind: "clean",
      text: tc("deploy state", "No unsaved changes"),
      tone: "green",
      term: null,
    });
  }

  if (!status.hasUpstream) {
    lines.push({
      kind: "neverPublished",
      text: tc("deploy state", "This line of work has never been published"),
      tone: "yellow",
      term: "push",
    });
    return lines;
  }

  if (status.aheadCount > 0) {
    lines.push({
      kind: "ahead",
      text: countText(
        status.aheadCount,
        "{count} saved version not published yet",
        "{count} saved versions not published yet",
      ),
      tone: "yellow",
      term: "push",
    });
  }
  if (status.behindCount > 0) {
    lines.push({
      kind: "behind",
      text: countText(
        status.behindCount,
        "{count} version published by others that you haven't brought in yet",
        "{count} versions published by others that you haven't brought in yet",
      ),
      tone: "yellow",
      term: "pull",
    });
  }
  if (status.aheadCount === 0 && status.behindCount === 0) {
    lines.push({
      kind: "published",
      text: tc("deploy state", "Everything published"),
      tone: "green",
      term: null,
    });
  }
  return lines;
}
