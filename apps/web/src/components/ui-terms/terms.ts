import { tc } from "~/i18n";

/**
 * Technical vocabulary shown bilingually: a plain word for what the thing is,
 * the technical term beside it, and a one-line explanation on hover. The plain
 * word and the explanation go through the dictionary; the technical term never
 * does. Every term shares the "git term" / "git term help" dictionary contexts
 * because the git words came first and their translations live under them.
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

export type TermName =
  | GitTermName
  | "token"
  | "context"
  | "compact"
  | "subagent"
  | "checkpoint"
  | "lint"
  | "build"
  | "deploy"
  | "secret";

export interface TermEntry {
  /** English plain word, the dictionary key under the "git term" context. */
  readonly simple: string;
  /** Shown as-is in every language. */
  readonly technical: string;
  /** English explanation, the dictionary key under the "git term help" context. */
  readonly help: string;
}

export const GIT_TERMS: Readonly<Record<GitTermName, TermEntry>> = {
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

export const TERMS: Readonly<Record<TermName, TermEntry>> = {
  ...GIT_TERMS,
  token: {
    simple: "Text unit",
    technical: "token",
    help: "A small piece of text the AI counts to bill you and to measure the context.",
  },
  context: {
    simple: "Conversation memory",
    technical: "context",
    help: "Everything the AI remembers in this conversation; when it fills up, it forgets or gets expensive.",
  },
  compact: {
    simple: "Summarize",
    technical: "compact",
    help: "Summarizes the conversation to free up space in the context.",
  },
  subagent: {
    simple: "Helper",
    technical: "subagent",
    help: "A helper the AI launches to do one part of the work.",
  },
  checkpoint: {
    simple: "Save point",
    technical: "checkpoint",
    help: "A saved point to go back to later.",
  },
  lint: {
    simple: "Quick check",
    technical: "lint",
    help: "Automatic check for silly mistakes in the code.",
  },
  build: {
    simple: "Assemble",
    technical: "build",
    help: "Puts the program together to see whether it compiles.",
  },
  deploy: {
    simple: "Put online",
    technical: "deploy",
    help: "Publishes it for everyone to use.",
  },
  secret: {
    simple: "Password or key",
    technical: "secret",
    help: "A password or key that must never go into the code.",
  },
};

/** The plain word, translated. */
export function termSimple(term: TermName): string {
  return tc("git term", TERMS[term].simple);
}

/** The technical term, the same in every language. */
export function termTechnical(term: TermName): string {
  return TERMS[term].technical;
}

/** The one-line explanation, translated. */
export function termHelp(term: TermName): string {
  return tc("git term help", TERMS[term].help);
}

/** "Plain · technical", for places that only take a string (aria-label, tab title). */
export function termLabel(term: TermName): string {
  return `${termSimple(term)} · ${termTechnical(term)}`;
}
