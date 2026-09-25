import { t } from "~/i18n";
import type { ServerConfig } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { resolveEnvironmentIconPickerLock } from "./EnvironmentIconPicker";

const config = (environmentIcon: boolean | undefined) =>
  ({
    environment: { capabilities: environmentIcon === undefined ? {} : { environmentIcon } },
  }) as unknown as ServerConfig;

describe("resolveEnvironmentIconPickerLock", () => {
  it("locks until the environment is connected", () => {
    expect(resolveEnvironmentIconPickerLock({ serverConfig: null, operateAccess: "granted" })).toBe(
      t("Connect to this environment to change its icon."),
    );
  });

  it("locks on servers that predate the setting, before looking at permissions", () => {
    expect(
      resolveEnvironmentIconPickerLock({
        serverConfig: config(undefined),
        operateAccess: "denied",
      }),
    ).toBe(t("This environment's server is too old to keep an icon. Update it to choose one."));
  });

  it("locks when the session cannot operate the environment", () => {
    expect(
      resolveEnvironmentIconPickerLock({ serverConfig: config(true), operateAccess: "denied" }),
    ).toBe(t("Your session on this environment cannot change its settings."));
  });

  it("stays open while access is still resolving so a slow session does not flicker", () => {
    expect(
      resolveEnvironmentIconPickerLock({ serverConfig: config(true), operateAccess: "pending" }),
    ).toBeNull();
    expect(
      resolveEnvironmentIconPickerLock({ serverConfig: config(true), operateAccess: "granted" }),
    ).toBeNull();
  });
});
