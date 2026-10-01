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
      objectiveGenerated={false}
      editingObjective={false}
      onEditingObjectiveChange={() => undefined}
      {...props}
    />,
  );
}

describe("ThreadBrief", () => {
  it("invites the user to set an objective and shows an empty status", () => {
    const html = render();

    expect(html).toContain(tc("thread objective", "Set this conversation's objective"));
    expect(html).toContain(tc("thread objective", "Edit objective"));
    expect(html).not.toContain(tc("thread objective", "· proposed by the AI, click to edit"));
    expect(html).toContain('data-status-card="compact"');
    expect(html).toContain(tc("status card", "No status"));
    expect(html).not.toContain(tc("status card", "↑ from the last reply · click to go to it"));
  });

  it("marks an AI objective and links the card to its reply", () => {
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
    expect(html).toContain(tc("thread objective", "· proposed by the AI, click to edit"));
    expect(html).toContain('data-status-tone="waiting"');
    expect(html).toContain("aprovar o deploy");
    expect(html).toContain(tc("status card", "↑ from the last reply · click to go to it"));
    expect(html).toContain("<button");
  });

  it("edits the objective in a capped input", () => {
    const html = render({ editingObjective: true, shell: shell({ objective: "Subir a LP" }) });

    expect(html).toContain('maxLength="200"');
    expect(html).toContain('value="Subir a LP"');
    expect(html).toContain(`aria-label="${tc("thread objective", "Conversation objective")}"`);
  });
});
