import { MessageId, type ThreadStatusCard } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { tc } from "~/i18n";

import {
  NOTIFICATION_BODY_MAX_LENGTH,
  notificationBody,
} from "./ThreadNotificationCoordinator.logic";

const card = (overrides: Partial<ThreadStatusCard> = {}): ThreadStatusCard => ({
  kind: "pronto",
  status: "Build passed",
  voce: "nothing",
  eu: "nothing, done",
  messageId: MessageId.make("message-1"),
  ...overrides,
});

describe("notificationBody", () => {
  it("uses the title when there is no status card", () => {
    expect(notificationBody({ title: "Fix the login form" })).toBe("Fix the login form");
    expect(notificationBody({ title: "Fix the login form", statusCard: null })).toBe(
      "Fix the login form",
    );
  });

  it("uses the title when the card has no status text", () => {
    expect(
      notificationBody({ title: "Fix the login form", statusCard: card({ status: "  " }) }),
    ).toBe("Fix the login form");
  });

  it("shows only the status when the work is done", () => {
    expect(notificationBody({ title: "Fix the login form", statusCard: card() })).toBe(
      "Build passed",
    );
  });

  it.each(["bloqueado", "aguardando"] as const)("adds what the user has to do when %s", (kind) => {
    expect(
      notificationBody({
        title: "Fix the login form",
        statusCard: card({ kind, status: "Waiting for approval", voce: "approve the deploy" }),
      }),
    ).toBe(`Waiting for approval · ${tc("status card", "You")}: approve the deploy`);
  });

  it("skips an empty Você even when waiting", () => {
    expect(
      notificationBody({
        title: "Fix the login form",
        statusCard: card({ kind: "aguardando", status: "Waiting", voce: " " }),
      }),
    ).toBe("Waiting");
  });

  it("cuts long text at 120 characters with an ellipsis", () => {
    const body = notificationBody({
      title: "Fix the login form",
      statusCard: card({ kind: "bloqueado", status: "a".repeat(80), voce: "b".repeat(80) }),
    });
    expect(body).toHaveLength(NOTIFICATION_BODY_MAX_LENGTH);
    expect(body.endsWith("…")).toBe(true);
    expect(body.startsWith("a".repeat(80))).toBe(true);
  });

  it("keeps text of exactly 120 characters whole", () => {
    const status = "c".repeat(NOTIFICATION_BODY_MAX_LENGTH);
    expect(notificationBody({ title: "x", statusCard: card({ status }) })).toBe(status);
  });
});
