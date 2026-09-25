import { assert, expect, it } from "vite-plus/test";
import { DEFAULT_CLIENT_SETTINGS, type DesktopSnapShotState } from "@t3tools/contracts";

import {
  createRecordingRequestTracker,
  snapShotStatus,
  snapShotShortcutStatus,
  snapShotUnavailableMessage,
  snapShotSoundPatch,
  snapShotFeedbackUnavailableMessage,
  snapShotSetupSummary,
  snapShotSetupButtonLabel,
  snapShotSetupComplete,
  snapShotDescription,
  snapShotAccessibilityUnavailableMessage,
} from "./SnapShotSettings.logic";
import { t } from "~/i18n";

it.each([
  ["off", { snapShotPlaySound: false }],
  ["soft-pop", { snapShotPlaySound: true, snapShotSound: "soft-pop" }],
  ["camera-shutter", { snapShotPlaySound: true, snapShotSound: "camera-shutter" }],
] as const)("maps %s to compatible capture settings", (sound, patch) => {
  expect(snapShotSoundPatch(sound)).toEqual(patch);
});

it("offers effects only with a capable GNOME extension, explaining how to upgrade v1", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "gnome-extension",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: true,
    shortcutMessage: null,
    message: null,
  };
  expect(snapShotFeedbackUnavailableMessage(state)).toContain(
    t("Update the GNOME extension, then sign out and back in to enable effects."),
  );
  expect(
    snapShotFeedbackUnavailableMessage({ ...state, linuxFeedbackAvailable: true }),
  ).toBeUndefined();
  expect(snapShotFeedbackUnavailableMessage({ ...state, linuxBackend: "picker" })).toContain(
    t("Capture effects aren't available on this desktop."),
  );
  expect(snapShotFeedbackUnavailableMessage({ ...state, mode: "direct" })).toBeUndefined();
});

it("ignores a stale request after a newer request starts", () => {
  const requests = createRecordingRequestTracker();
  const firstRequest = requests.tryBegin();
  assert(firstRequest);

  requests.clear();
  const secondRequest = requests.tryBegin();
  assert(secondRequest);

  expect(requests.owns(firstRequest)).toBe(false);
  expect(requests.owns(secondRequest)).toBe(true);
  expect(requests.tryBegin()).toBeNull();
});

it("reports unavailable capture support without browser globals", () => {
  expect(snapShotUnavailableMessage(false)).toBe(t("Only available in the desktop app."));
});

it("describes Niri setup without claiming a global shortcut is registered", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "niri",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: false,
    shortcutMessage: "Managed by Niri",
    message: null,
  };
  expect(snapShotStatus(state, true)).toBe(t("Finish shortcut setup"));
  expect(snapShotStatus(state, true)).not.toContain("could not be registered");
  expect(snapShotFeedbackUnavailableMessage(state)).toContain(
    t("Capture effects aren't available on Niri."),
  );
});

it("distinguishes Hyprland helper setup, action registration, and verified shortcut delivery", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "hyprland",
    linuxDesktop: "hyprland",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: false,
    shortcutMessage: "Connecting to Hyprland shortcuts…",
    message: null,
    hyprlandHelper: { status: "not-installed", message: "Install helper" },
  };
  expect(snapShotSetupButtonLabel(state)).toBe(
    t("Set up {desktop} capture", { desktop: "Hyprland" }),
  );
  expect(snapShotStatus(state, false)).toBe(t("Turn this on to set up snapshots."));
  expect(snapShotStatus(state, true)).toContain(t("Install the capture helper to continue"));
  expect(snapShotFeedbackUnavailableMessage(state)).toContain(
    t("Install or update the capture helper to enable effects."),
  );
  const ready = {
    ...state,
    hyprlandHelper: { status: "ready" as const, message: "Ready" },
    linuxFeedbackAvailable: true,
  };
  expect(snapShotSetupButtonLabel(ready)).toBe(t("Manage capture"));
  expect(snapShotShortcutStatus({ ...ready, shortcutPending: true })).not.toContain("permission");
  expect(snapShotStatus({ ...ready, shortcutActionRegistered: true }, true)).toBe(
    t("Use your shortcut from another app"),
  );
  expect(snapShotStatus({ ...ready, shortcutVerified: true }, true)).toBe(t("Ready to capture"));
  expect(snapShotFeedbackUnavailableMessage(ready)).toBeUndefined();
  expect(snapShotAccessibilityUnavailableMessage(ready)).toBeUndefined();
});

it("keeps unavailable capture distinct from the opt-in setup prompt", () => {
  const state: DesktopSnapShotState = {
    mode: "unavailable",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: false,
    shortcutMessage: null,
    message: "Wayland is required.",
  };

  expect(snapShotStatus(state, false)).toBe("Wayland is required.");
});

it.each(["gnome-extension", "niri", "screenshot-portal", "picker"] as const)(
  "waits for opt-in before presenting %s setup requirements",
  (linuxBackend) => {
    const state: DesktopSnapShotState = {
      mode: "portal",
      linuxBackend,
      shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
      shortcutRegistered: false,
      shortcutMessage: "Shortcut permission needed",
      message: "Capture needs attention",
      gnomeExtension: { status: "not-installed", message: "Install the extension" },
    };

    expect(DEFAULT_CLIENT_SETTINGS.snapShotEnabled).toBe(false);
    expect(snapShotStatus(state, false)).toBe(t("Turn this on to set up snapshots."));
    expect(snapShotStatus(state, true)).toBe(t("Capture needs attention"));
  },
);

it("distinguishes saved shortcuts from observed delivery without making users repeat setup", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "gnome-extension",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: true,
    shortcutMessage: "Requested",
    message: null,
    gnomeExtension: { status: "enabled", message: "Running" },
  };
  expect(snapShotSetupSummary(state, true)).toBe(t("Shortcut saved"));
  expect(snapShotSetupButtonLabel(state)).toBe(t("Manage capture"));
  expect(snapShotSetupSummary({ ...state, shortcutVerified: true }, true)).toBe(
    t("Ready to capture"),
  );
  expect(snapShotSetupButtonLabel({ ...state, shortcutVerified: true })).toBe(t("Manage capture"));
  expect(snapShotSetupButtonLabel({ ...state, shortcutRegistered: false })).toBe(
    t("Manage capture"),
  );
  expect(
    snapShotSetupButtonLabel({
      ...state,
      gnomeExtension: { status: "disabled", message: "Enable the extension" },
    }),
  ).toBe(t("Set up {desktop} capture", { desktop: "GNOME" }));
  expect(snapShotSetupSummary({ ...state, shortcutVerified: true }, false)).toContain(
    t("Enable capture to continue"),
  );
  expect(
    snapShotSetupSummary(
      {
        ...state,
        gnomeExtension: { status: "restart-required", message: "Sign out" },
        shortcutVerified: true,
      },
      true,
    ),
  ).toBe(t("Set up active-window snapshots"));
  expect(
    snapShotSetupSummary(
      { ...state, linuxBackend: "niri", gnomeExtension: undefined, shortcutRegistered: false },
      true,
    ),
  ).toBe(t("Finish shortcut setup"));
  expect(
    snapShotSetupSummary(
      { ...state, linuxBackend: "picker", gnomeExtension: undefined, shortcutVerified: true },
      true,
    ),
  ).toBe(t("Manual capture only — you'll choose a window each time"));
  expect(
    snapShotSetupSummary(
      {
        ...state,
        linuxBackend: "screenshot-portal",
        gnomeExtension: { status: "not-installed", message: "Optional extension" },
        shortcutVerified: true,
      },
      true,
    ),
  ).toBe(t("Ready to capture"));
});

it.each([
  ["gnome", "GNOME"],
  ["kde", "KDE Plasma"],
  ["niri", "Niri"],
] as const)(
  "names %s when setup cannot yet determine the capture backend",
  (linuxDesktop, name) => {
    const state: DesktopSnapShotState = {
      mode: "portal",
      linuxDesktop,
      shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
      shortcutRegistered: false,
      shortcutMessage: null,
      message: "Capability check failed",
    };
    expect(snapShotSetupButtonLabel(state)).toBe(t("Set up {desktop} capture", { desktop: name }));
  },
);

it("keeps picker limitations visible after shortcut verification without recommending a GNOME extension", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "picker",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: true,
    shortcutMessage: null,
    message: null,
    shortcutVerified: true,
  };
  expect(snapShotStatus(state, true)).toContain(
    t("Manual capture only — you'll choose a window each time"),
  );
  expect(snapShotDescription(state)).toContain(
    t("Automatic capture isn't available here. Choose a window instead."),
  );
  expect(snapShotFeedbackUnavailableMessage(state)).not.toContain("GNOME");
  expect(snapShotAccessibilityUnavailableMessage(state)).toContain(
    t("This desktop only provides a screenshot."),
  );
  expect(
    snapShotAccessibilityUnavailableMessage({ ...state, linuxBackend: "screenshot-portal" }),
  ).toContain(t("This desktop only provides a screenshot."));
  expect(
    snapShotAccessibilityUnavailableMessage({ ...state, linuxBackend: "kde" }),
  ).toBeUndefined();
  expect(snapShotFeedbackUnavailableMessage({ ...state, linuxBackend: "kde" })).toContain(
    t("Install or update the capture helper to enable effects."),
  );
  expect(
    snapShotFeedbackUnavailableMessage({
      ...state,
      linuxBackend: "kde",
      linuxFeedbackAvailable: true,
      kdeHelper: { status: "ready", message: "Ready", feedbackAvailable: true },
    }),
  ).toBeUndefined();
  expect(
    snapShotStatus(
      { ...state, linuxBackend: "kde", kdeHelper: { status: "not-installed", message: "Install" } },
      true,
    ),
  ).toContain(t("Install the capture helper to continue"));
});

it("does not ask Niri users to repeat setup when its capture endpoint is available", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "niri",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: false,
    shortcutBinding: "Ctrl+Shift+2 { spawn ...; }",
    shortcutMessage: null,
    message: null,
  };
  expect(snapShotStatus(state, true)).toBe(t("Use your shortcut from another app"));
  expect(snapShotSetupButtonLabel(state)).toBe(t("Manage capture"));
});

it("reports pending, denied, and assigned shortcuts without inferring consent from saved keys", () => {
  const state: DesktopSnapShotState = {
    mode: "portal",
    linuxBackend: "screenshot-portal",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: false,
    shortcutPending: true,
    shortcutMessage: null,
    message: null,
  };
  expect(snapShotStatus(state, true)).toContain(t("Waiting for shortcut permission"));
  expect(snapShotShortcutStatus(state)).toContain(
    t("Approve the shortcut permission prompt to continue."),
  );
  const denied = { ...state, shortcutPending: false, shortcutMessage: "Permission wasn't granted" };
  expect(snapShotShortcutStatus(denied)).toBe("Permission wasn't granted");
  const approved = {
    ...denied,
    shortcutRegistered: true,
    shortcutLabel: "Press <Shift><Control>2",
    shortcutMessage: "Desktop shortcut: Press <Shift><Control>2",
  };
  expect(snapShotStatus(approved, true)).toBe(t("Ready to capture"));
  expect(snapShotShortcutStatus(approved)).toBeNull();
  expect(snapShotShortcutStatus({ ...approved, shortcutPending: true })).toContain(
    t("Approve the shortcut permission prompt to continue."),
  );
  expect(
    snapShotShortcutStatus({
      ...approved,
      shortcutRegistered: false,
      shortcutMessage: "Permission wasn't granted",
    }),
  ).toBe("Permission wasn't granted");
});

it("hides macOS setup only while permissions and the shortcut are all in place", () => {
  const ready: DesktopSnapShotState = {
    mode: "direct",
    shortcut: DEFAULT_CLIENT_SETTINGS.snapShotShortcut,
    shortcutRegistered: true,
    shortcutMessage: null,
    message: null,
    macPermissions: { screenRecording: true, accessibility: true },
  };
  expect(snapShotSetupComplete(ready, true)).toBe(true);
  expect(snapShotSetupComplete({ ...ready, macPermissions: undefined }, true)).toBe(false);
  expect(snapShotSetupComplete({ ...ready, shortcutRegistered: false }, true)).toBe(false);
  const revoked = {
    ...ready,
    macPermissions: { screenRecording: true, accessibility: false },
    message: "Allow Accessibility in System Settings, then restart T3 Code.",
  };
  expect(snapShotSetupComplete(revoked, true)).toBe(false);
  expect(snapShotStatus(revoked, true)).toBe(t("Capture needs attention"));
  expect(snapShotSetupButtonLabel(revoked)).toBe(t("Continue setup"));
  expect(snapShotSetupComplete({ ...revoked, message: null }, false)).toBe(true);
  expect(
    snapShotSetupComplete(
      { ...ready, windows: true, macPermissions: undefined, shortcutRegistered: false },
      true,
    ),
  ).toBe(true);
});
