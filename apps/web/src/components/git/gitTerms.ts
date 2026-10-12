import { tc } from "~/i18n";

/**
 * Git vocabulary shown bilingually: a plain word for what the action does, the
 * technical term beside it, and a one-line explanation on hover. The plain word
 * and the explanation go through the dictionary; the technical term never does.
 */
export type GitTermName =
  | "commit"
  | "push"
  | "pull"
  | "merge"
  | "pr"
  | "branch"
  | "worktree"
  | "diff"
  | "stash"
  | "rebase"
  | "checkout";

interface GitTermEntry {
  /** English plain word, the dictionary key under the "git term" context. */
  readonly simple: string;
  /** Shown as-is in every language. */
  readonly technical: string;
  /** English explanation, the dictionary key under the "git term help" context. */
  readonly help: string;
}

export const GIT_TERMS: Readonly<Record<GitTermName, GitTermEntry>> = {
  commit: {
    simple: "Save a version",
    technical: "commit",
    help: "Records a named snapshot of your files on this computer. Nothing leaves your PC.",
  },
  push: {
    simple: "Publish",
    technical: "push",
    help: "Sends the saved versions to GitHub so others (and the deploy) can see them.",
  },
  pull: {
    simple: "Update from GitHub",
    technical: "pull",
    help: "Brings versions others published into your copy.",
  },
  merge: {
    simple: "Join",
    technical: "merge",
    help: "Brings one line of work into another, usually into the main one.",
  },
  pr: {
    simple: "Review request",
    technical: "PR",
    help: "A request for someone to review and approve your changes before they join the main line.",
  },
  branch: {
    simple: "Line of work",
    technical: "branch",
    help: "A separate line of versions so you can work without touching the main one.",
  },
  worktree: {
    simple: "Separate copy",
    technical: "worktree",
    help: "A separate folder with its own line of work, so two conversations never overwrite each other.",
  },
  diff: {
    simple: "What changed",
    technical: "diff",
    help: "Line-by-line comparison: red was removed, green was added.",
  },
  stash: {
    simple: "Set aside",
    technical: "stash",
    help: "Puts unsaved changes aside to recover later.",
  },
  rebase: {
    simple: "Replay on top",
    technical: "rebase",
    help: "Re-applies your versions on top of the newest main line.",
  },
  checkout: {
    simple: "Switch to",
    technical: "checkout",
    help: "Opens another line of work in this folder.",
  },
};

/** The plain word, translated. */
export function gitTermSimple(term: GitTermName): string {
  return tc("git term", GIT_TERMS[term].simple);
}

/** The technical term, the same in every language. */
export function gitTermTechnical(term: GitTermName): string {
  return GIT_TERMS[term].technical;
}

/** The one-line explanation, translated. */
export function gitTermHelp(term: GitTermName): string {
  return tc("git term help", GIT_TERMS[term].help);
}

/** "Plain · technical", for places that only take a string (aria-label, tab title). */
export function gitTermLabel(term: GitTermName): string {
  return `${gitTermSimple(term)} · ${gitTermTechnical(term)}`;
}
