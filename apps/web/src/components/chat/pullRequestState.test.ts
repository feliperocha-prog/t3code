import { describe, expect, it } from "vite-plus/test";
import { describePullRequestState, type PullRequestStateInput } from "./pullRequestState";

const open: PullRequestStateInput = {
  state: "open",
  isDraft: false,
  mergeability: "mergeable",
};

describe("describePullRequestState", () => {
  it("reads a merged request as already live", () => {
    expect(describePullRequestState({ ...open, state: "merged", checksState: "failing" })).toEqual({
      kind: "merged",
      label: "Já no ar (juntado)",
      tone: "green",
    });
  });

  it("reads a closed request as closed without joining", () => {
    expect(describePullRequestState({ ...open, state: "closed", isDraft: true })).toEqual({
      kind: "closed",
      label: "Fechado sem juntar",
      tone: "grey",
    });
  });

  it("reads an open draft as a draft before checks or reviews", () => {
    expect(describePullRequestState({ ...open, isDraft: true, checksState: "failing" })).toEqual({
      kind: "draft",
      label: "Rascunho",
      tone: "grey",
    });
  });

  it("puts failing checks ahead of the review verdict", () => {
    expect(
      describePullRequestState({
        ...open,
        checksState: "failing",
        reviewDecision: "approved",
      }),
    ).toEqual({ kind: "checksFailing", label: "Checagem falhando", tone: "red" });
  });

  it("reads requested changes", () => {
    expect(
      describePullRequestState({
        ...open,
        reviewDecision: "changes-requested",
        mergeability: "conflicting",
      }),
    ).toEqual({ kind: "changesRequested", label: "Pediram mudanças", tone: "yellow" });
  });

  it("reads an approved request as waiting to be joined", () => {
    expect(
      describePullRequestState({
        ...open,
        reviewDecision: "approved",
        mergeability: "conflicting",
      }),
    ).toEqual({ kind: "approved", label: "Aprovado, falta juntar", tone: "green" });
  });

  it("reads a conflict when nothing above applies", () => {
    expect(describePullRequestState({ ...open, mergeability: "conflicting" })).toEqual({
      kind: "conflicting",
      label: "Com conflito",
      tone: "red",
    });
  });

  it("falls back to awaiting review, including when the host reports nothing", () => {
    expect(describePullRequestState(open)).toEqual({
      kind: "awaitingReview",
      label: "Esperando revisão",
      tone: "yellow",
    });
    expect(
      describePullRequestState({
        state: "open",
        isDraft: null,
        checksState: null,
        reviewDecision: "review-required",
      }).kind,
    ).toBe("awaitingReview");
  });
});
