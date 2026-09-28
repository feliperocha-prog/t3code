import type { EnvironmentId } from "@t3tools/contracts";
import type { RelayClientEnvironmentRecord } from "@t3tools/contracts/relay";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";

import { T3ConnectEnvironmentRow } from "./T3ConnectUserProfilePage";
import { t } from "~/i18n";

const environment: RelayClientEnvironmentRecord = {
  environmentId: "environment-1" as EnvironmentId,
  label: "Studio Mac",
  endpoint: {
    httpBaseUrl: "https://studio.example.com",
    wsBaseUrl: "wss://studio.example.com",
    providerKind: "cloudflare_tunnel",
  },
  linkedAt: "2026-08-12T12:00:00.000Z",
};

function renderRow({
  confirmationOpen = false,
  mutationPending = false,
}: {
  readonly confirmationOpen?: boolean;
  readonly mutationPending?: boolean;
} = {}) {
  return renderToStaticMarkup(
    <T3ConnectEnvironmentRow
      environment={environment}
      confirmationOpen={confirmationOpen}
      mutationPending={mutationPending}
      onConfirmationChange={vi.fn()}
      onDeregister={vi.fn()}
    />,
  );
}

describe("T3 Connect environment row", () => {
  it("keeps deregistration confirmation inline and collapsed by default", () => {
    const markup = renderRow();

    expect(markup).toContain("Studio Mac");
    expect(markup).toContain(t("Deregister"));
    expect(markup).not.toContain(t("Deregister server"));
    expect(markup).not.toContain(t("Confirm deregistration of {label}", { label: "Studio Mac" }));
  });

  it("expands Clerk-style confirmation content beneath the environment row", () => {
    const markup = renderRow({ confirmationOpen: true });

    expect(markup).toContain(t("Deregister server"));
    expect(markup).toContain(
      t("“{label}” will be removed from this account.", { label: "Studio Mac" }),
    );
    expect(markup).toContain(t("Confirm deregistration of {label}", { label: "Studio Mac" }));
    expect(markup).toContain(
      t(
        "T3 Connect access will be revoked, any managed tunnel will be removed, and a host space will become available. Local connections on your devices are not changed.",
      ),
    );
    expect(markup).toContain(t("Cancel"));
  });

  it("locks the confirmation actions while deregistration is pending", () => {
    const markup = renderRow({ confirmationOpen: true, mutationPending: true });

    expect(markup).toContain(t("Deregistering…"));
    expect(markup.match(/ disabled=""/g)).toHaveLength(3);
  });
});
