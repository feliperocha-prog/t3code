import type { ChangesExplanation, ProjectScript } from "@t3tools/contracts";

import { t } from "~/i18n";

export type ChecklistItemId = "secrets" | "build" | "tests" | "review";

export type ChecklistItemStatus = "running" | "pass" | "warn" | "fail" | "skipped";

export interface ChecklistItemState {
  readonly id: ChecklistItemId;
  readonly status: ChecklistItemStatus;
  readonly detail: string;
}

export function checklistItemLabel(id: ChecklistItemId): string {
  switch (id) {
    case "secrets":
      return t("Secret in code");
    case "build":
      return t("Build");
    case "tests":
      return t("Tests");
    case "review":
      return t("Reviewer");
  }
}

// Word-start match so "latest" is not a test script and "prebuild" is not a build.
const BUILD_WORD = /\bbuild/i;
const TEST_WORD = /\btest/i;

function pickScript(
  scripts: ReadonlyArray<ProjectScript>,
  icon: ProjectScript["icon"],
  word: RegExp,
): ProjectScript | null {
  // Dev servers never finish, so they cannot pass or fail a check.
  const runnable = scripts.filter((script) => !script.async && !script.previewUrl);
  return (
    runnable.find((script) => script.icon === icon) ??
    runnable.find((script) => word.test(script.name) || word.test(script.command)) ??
    null
  );
}

/** The project scripts the checklist runs as Build and Tests; null when the project has none. */
export function pickCheckScripts(scripts: ReadonlyArray<ProjectScript>): {
  build: ProjectScript | null;
  test: ProjectScript | null;
} {
  return {
    build: pickScript(scripts, "build", BUILD_WORD),
    test: pickScript(scripts, "test", TEST_WORD),
  };
}

export interface CheckCommand {
  readonly name: string;
  readonly command: string;
}

// What `npm init` writes; running it would always fail the check.
const NPM_PLACEHOLDER_TEST = /no test specified/i;

function packageJsonScripts(contents: string | null): Record<string, unknown> {
  if (contents === null) return {};
  try {
    const parsed: unknown = JSON.parse(contents);
    if (typeof parsed !== "object" || parsed === null || !("scripts" in parsed)) return {};
    const scripts = parsed.scripts;
    return typeof scripts === "object" && scripts !== null ? { ...scripts } : {};
  } catch {
    return {};
  }
}

/**
 * Build and Tests commands: a project action wins; without one, the `build` and
 * `test` scripts of the root package.json run through npm, which any package
 * manager's project accepts once its dependencies are installed.
 */
export function resolveCheckCommands(
  scripts: ReadonlyArray<ProjectScript>,
  packageJsonContents: string | null,
): { build: CheckCommand | null; test: CheckCommand | null } {
  const picked = pickCheckScripts(scripts);
  const fromPackage = packageJsonScripts(packageJsonContents);
  const build = typeof fromPackage.build === "string" && fromPackage.build.trim().length > 0;
  const test =
    typeof fromPackage.test === "string" &&
    fromPackage.test.trim().length > 0 &&
    !NPM_PLACEHOLDER_TEST.test(fromPackage.test);
  return {
    build: picked.build ?? (build ? { name: "npm run build", command: "npm run build" } : null),
    test: picked.test ?? (test ? { name: "npm test", command: "npm test" } : null),
  };
}

const REVIEW_PATHS_SHOWN = 3;

/** Turns the reviewer's per-file risk into the checklist verdict. */
export function reviewVerdict(explanation: Pick<ChangesExplanation, "files">): {
  status: "pass" | "warn" | "fail";
  reason: string;
} {
  const high = explanation.files.filter((file) => file.risk === "high");
  if (high.length > 0) {
    return {
      status: "fail",
      reason: t("{count} high-risk file(s): {paths}", {
        count: high.length,
        paths: high
          .slice(0, REVIEW_PATHS_SHOWN)
          .map((file) => file.path)
          .join(", "),
      }),
    };
  }
  const medium = explanation.files.filter((file) => file.risk === "medium");
  if (medium.length > 0) {
    return { status: "warn", reason: t("{count} medium-risk file(s)", { count: medium.length }) };
  }
  return { status: "pass", reason: t("No risky file") };
}

/**
 * Which footer buttons the checklist allows. A failed item asks for an explicit
 * override; while anything still runs, neither publish button is enabled.
 */
export function checklistDecision(items: ReadonlyArray<ChecklistItemState>): {
  canPublish: boolean;
  needsOverride: boolean;
  isRunning: boolean;
  blockingReasons: ReadonlyArray<string>;
} {
  const isRunning = items.some((item) => item.status === "running");
  const blockingReasons = items
    .filter((item) => item.status === "fail")
    .map((item) => checklistItemLabel(item.id));
  const needsOverride = blockingReasons.length > 0;
  return { canPublish: !isRunning && !needsOverride, needsOverride, isRunning, blockingReasons };
}
