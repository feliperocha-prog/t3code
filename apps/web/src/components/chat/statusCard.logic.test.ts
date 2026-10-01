import { MessageId, type OrchestrationSession, ThreadId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { resolveStatusCardView, type StatusCardThreadInput } from "./statusCard.logic";

function session(status: OrchestrationSession["status"]): OrchestrationSession {
  return {
    threadId: ThreadId.make("thread-1"),
    status,
    providerName: null,
    runtimeMode: "full-access",
    activeTurnId: null,
    lastError: null,
    updatedAt: "2026-10-01T12:00:00.000Z",
  };
}

const card = {
  kind: "pronto" as const,
  status: "pronto",
  voce: "nada",
  eu: "nada, acabou",
  messageId: MessageId.make("assistant-1"),
};

const idle: StatusCardThreadInput = {
  hasPendingApprovals: false,
  hasPendingUserInput: false,
  session: session("ready"),
  backgroundLiveness: null,
  statusCard: null,
};

describe("resolveStatusCardView", () => {
  it("shows the last reply's card when nothing is live", () => {
    expect(resolveStatusCardView({ ...idle, statusCard: card })).toEqual({
      tone: "done",
      headline: { kind: "card", status: "pronto" },
      voce: "nada",
      eu: "nada, acabou",
      messageId: card.messageId,
    });
  });

  it("maps each card kind to its tone", () => {
    const tone = (kind: "pronto" | "aguardando" | "bloqueado" | "outro") =>
      resolveStatusCardView({ ...idle, statusCard: { ...card, kind } }).tone;
    expect(tone("aguardando")).toBe("waiting");
    expect(tone("pronto")).toBe("done");
    expect(tone("bloqueado")).toBe("failed");
    expect(tone("outro")).toBe("neutral");
  });

  it("falls back to an empty neutral state without a card", () => {
    expect(resolveStatusCardView(idle)).toEqual({
      tone: "neutral",
      headline: { kind: "none" },
      voce: "",
      eu: "",
      messageId: null,
    });
    expect(
      resolveStatusCardView({ ...idle, statusCard: { ...card, status: "  " } }).headline,
    ).toEqual({ kind: "none" });
  });

  it("shows working while the session runs or starts, hiding the stale card", () => {
    for (const status of ["running", "starting"] as const) {
      const view = resolveStatusCardView({ ...idle, session: session(status), statusCard: card });
      expect(view).toEqual({
        tone: "working",
        headline: { kind: "working" },
        voce: "",
        eu: "",
        messageId: null,
      });
    }
  });

  it("ranks a pending approval above a running session (sidebar order)", () => {
    const view = resolveStatusCardView({
      ...idle,
      session: session("running"),
      hasPendingApprovals: true,
      hasPendingUserInput: true,
      statusCard: card,
    });
    expect(view.tone).toBe("waiting");
    expect(view.headline).toEqual({ kind: "approval" });
  });

  it("ranks pending input above a running session", () => {
    const view = resolveStatusCardView({
      ...idle,
      session: session("running"),
      hasPendingUserInput: true,
    });
    expect(view.tone).toBe("waiting");
    expect(view.headline).toEqual({ kind: "input" });
  });

  it("shows failed for a session error, above background work", () => {
    const view = resolveStatusCardView({
      ...idle,
      session: session("error"),
      backgroundLiveness: "working",
      statusCard: card,
    });
    expect(view.tone).toBe("failed");
    expect(view.headline).toEqual({ kind: "failed" });
  });

  it("treats background subagents as working but lets monitoring show the card", () => {
    expect(
      resolveStatusCardView({ ...idle, backgroundLiveness: "working", statusCard: card }).headline,
    ).toEqual({ kind: "working" });
    expect(
      resolveStatusCardView({ ...idle, backgroundLiveness: "monitoring", statusCard: card })
        .headline,
    ).toEqual({ kind: "card", status: "pronto" });
  });

  it("works without a session", () => {
    expect(resolveStatusCardView({ ...idle, session: null, statusCard: card }).tone).toBe("done");
  });
});
