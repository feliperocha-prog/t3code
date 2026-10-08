import { EnvironmentId, MessageId, ThreadId } from "@t3tools/contracts";
import type { ComponentProps, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";

import { tc } from "~/i18n";
import type { SidebarThreadSummary } from "~/types";

vi.mock("../../state/use-atom-command", () => ({ useAtomCommand: () => vi.fn() }));
vi.mock("../ui/tooltip", async () => {
  const { cloneElement, isValidElement } = await import("react");
  return {
    Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
    TooltipTrigger({
      render,
      children,
    }: ComponentProps<typeof import("../ui/tooltip").TooltipTrigger>) {
      if (!isValidElement(render)) return <>{children}</>;
      return children === undefined ? render : cloneElement(render, undefined, children);
    },
    TooltipPopup: () => null,
  };
});

import { ThreadBrief } from "./ThreadBrief";

function shell(overrides: Partial<SidebarThreadSummary> = {}): SidebarThreadSummary {
  return {
    id: ThreadId.make("thread-1"),
    title: "Thread",
    session: null,
    hasPendingApprovals: false,
    hasPendingUserInput: false,
    backgroundLiveness: null,
    objective: null,
    statusCard: null,
    ...overrides,
  } as SidebarThreadSummary;
}

function render(props: Partial<ComponentProps<typeof ThreadBrief>> = {}) {
  return renderToStaticMarkup(
    <ThreadBrief
      environmentId={EnvironmentId.make("env-1")}
      threadId={ThreadId.make("thread-1")}
      shell={shell()}
      hasUserMessage={false}
      objectiveGenerated={false}
      objectiveManual={false}
      editingObjective={false}
      onEditingObjectiveChange={() => undefined}
      statusAnswered={false}
      onQuickReply={() => undefined}
      onAdjust={() => undefined}
      {...props}
    />,
  );
}

describe("ThreadBrief", () => {
  it("invites the user to write an objective and hides the status line when there is none", () => {
    const html = render();

    expect(html).toContain(tc("thread objective", "No objective yet — click to write one"));
    expect(html).toContain(tc("thread objective", "Edit objective"));
    expect(html).not.toContain(tc("thread objective", "automatic"));
    expect(html).not.toContain("data-status-card");
    expect(html).not.toContain(tc("status card", "No status"));
  });

  it("marks an AI objective and makes the status strip go to its reply", () => {
    const html = render({
      objectiveGenerated: true,
      shell: shell({
        objective: "Subir a LP nova",
        statusCard: {
          kind: "aguardando",
          status: "aguardando sua aprovação",
          voce: "aprovar o deploy",
          eu: "subir quando aprovar",
          messageId: MessageId.make("assistant-1"),
        },
      }),
    });

    expect(html).toContain("Subir a LP nova");
    expect(html).toContain(tc("thread objective", "automatic"));
    expect(html).not.toContain(tc("thread objective", "written by you"));
    expect(html).toContain('data-status-card="strip"');
    expect(html).toContain('data-status-tone="waiting"');
    expect(html).toContain("aprovar o deploy");
    expect(html).toMatch(/<button[^>]*data-status-card="strip"/);
  });

  it("labels an objective the user wrote", () => {
    const html = render({ objectiveManual: true, shell: shell({ objective: "Subir a LP" }) });

    expect(html).toContain(tc("thread objective", "written by you"));
    expect(html).not.toContain(tc("thread objective", "automatic"));
  });

  it("edits the objective in a capped input", () => {
    const html = render({ editingObjective: true, shell: shell({ objective: "Subir a LP" }) });

    expect(html).toContain('maxLength="200"');
    expect(html).toContain('value="Subir a LP"');
    expect(html).toContain(`aria-label="${tc("thread objective", "Conversation objective")}"`);
    expect(html).not.toContain(tc("thread objective", "Back to automatic"));
  });

  it("offers going back to automatic only while editing a manual objective", () => {
    const html = render({
      editingObjective: true,
      objectiveManual: true,
      shell: shell({ objective: "Subir a LP" }),
    });

    expect(html).toContain(tc("thread objective", "Back to automatic"));
    expect(html).toContain("data-objective-reset");
  });
});
