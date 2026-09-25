import { describe, expect, it } from "vite-plus/test";
import { t } from "~/i18n";

import { summarizeGitHubRouting } from "./GitHubRoutingSettings";

describe("summarizeGitHubRouting", () => {
  it("is empty when no machine shares", () => {
    expect(summarizeGitHubRouting([{ label: "alvin", permission: "off" }])).toBeNull();
  });

  it("groups sharing machines by permission, read and act first", () => {
    expect(
      summarizeGitHubRouting([
        { label: "alvin", permission: "read" },
        { label: "bb-1", permission: "read-write" },
        { label: "cup2", permission: "off" },
        { label: "Theo's MacBook Pro", permission: "read-write" },
      ]),
    ).toBe(
      `${t("{machines} read and act", { machines: "bb-1, Theo's MacBook Pro" })} · ${t(
        "{machines} read PRs",
        { machines: "alvin" },
      )}`,
    );
  });
});
