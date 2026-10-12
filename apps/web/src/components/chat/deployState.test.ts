import { describe, expect, it } from "vitest";

import { describeDeployState, type DeployStateInput } from "./deployState";

function status(overrides: Partial<DeployStateInput> = {}): DeployStateInput {
  return {
    isRepo: true,
    hasWorkingTreeChanges: false,
    workingTree: { files: [] },
    hasUpstream: true,
    aheadCount: 0,
    behindCount: 0,
    ...overrides,
  };
}

describe("describeDeployState", () => {
  it("hides the block outside a git repository", () => {
    expect(describeDeployState(status({ isRepo: false }))).toBeNull();
  });

  it("reports a clean, fully published line of work", () => {
    expect(describeDeployState(status())).toEqual([
      { kind: "clean", text: "Nenhuma alteração sem salvar", tone: "green", term: null },
      { kind: "published", text: "Tudo publicado", tone: "green", term: null },
    ]);
  });

  it("counts changed files that are not saved as a version", () => {
    const lines = describeDeployState(
      status({ hasWorkingTreeChanges: true, workingTree: { files: [1, 2, 3] } }),
    );
    expect(lines?.[0]).toEqual({
      kind: "unsaved",
      text: "3 arquivos alterados e ainda não salvos como versão",
      tone: "yellow",
      term: "commit",
    });
  });

  it("uses the singular for one changed file", () => {
    const lines = describeDeployState(
      status({ hasWorkingTreeChanges: true, workingTree: { files: [1] } }),
    );
    expect(lines?.[0]?.text).toBe("1 arquivo alterado e ainda não salvo como versão");
  });

  it("reports saved versions not published and versions to bring in", () => {
    const lines = describeDeployState(status({ aheadCount: 2, behindCount: 4 }));
    expect(lines?.slice(1)).toEqual([
      {
        kind: "ahead",
        text: "2 versões salvas e ainda não publicadas",
        tone: "yellow",
        term: "push",
      },
      {
        kind: "behind",
        text: "4 versões publicadas por outros que você ainda não trouxe",
        tone: "yellow",
        term: "pull",
      },
    ]);
  });

  it("does not claim everything is published while something is pending", () => {
    const kinds = describeDeployState(status({ aheadCount: 1 }))?.map((line) => line.kind);
    expect(kinds).toEqual(["clean", "ahead"]);
  });

  it("explains a line of work that was never published", () => {
    expect(describeDeployState(status({ hasUpstream: false, aheadCount: 5 }))).toEqual([
      { kind: "clean", text: "Nenhuma alteração sem salvar", tone: "green", term: null },
      {
        kind: "neverPublished",
        text: "Esta linha de trabalho ainda não foi publicada nenhuma vez",
        tone: "yellow",
        term: "push",
      },
    ]);
  });
});
