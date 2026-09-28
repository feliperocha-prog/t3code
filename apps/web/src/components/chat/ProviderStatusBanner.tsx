import { type ProviderInstanceId, type ServerProvider } from "@t3tools/contracts";
import { memo } from "react";
import { InfoIcon, XIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../ui/alert";
import { Button, InlineButton } from "../ui/button";
import { formatProviderDriverKindLabel } from "../../providerModels";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { t } from "~/i18n";

/** Unsupported and broken versions fail mid-turn, so they warn even when ready. */
function getIncompatibleVersion(status: ServerProvider) {
  const compatibility = status.compatibilityAdvisory;
  return compatibility?.status === "unsupported" || compatibility?.status === "broken"
    ? compatibility
    : null;
}

export function getProviderStatusBannerKey(status: ServerProvider | null): string | null {
  if (!status || status.status === "disabled") return null;
  if (status.status === "ready") {
    const incompatible = getIncompatibleVersion(status);
    return incompatible
      ? [status.instanceId, incompatible.status, status.version ?? ""].join("\u0000")
      : null;
  }
  // Antigravity checks saved credentials when a session starts. Its local
  // health check leaves auth unknown after a restart, which is not a failure.
  if (
    status.driver === "antigravity" &&
    status.installed &&
    status.status === "warning" &&
    status.auth.status === "unknown"
  ) {
    return null;
  }
  return [status.instanceId, status.status, status.auth.status, status.message ?? ""].join(
    "\u0000",
  );
}

export function shouldShowProviderStatusBanner(
  status: ServerProvider | null,
  dismissedBannerKey: string | null,
): boolean {
  const bannerKey = getProviderStatusBannerKey(status);
  return bannerKey !== null && bannerKey !== dismissedBannerKey;
}

export function hasProviderSetup(status: ServerProvider): boolean {
  return (
    status.driver === "antigravity" ||
    status.setup?.canAuthenticate === true ||
    status.setup?.canInstall === true
  );
}

/** Keep the environment's error intact in both the banner and model picker. */
export function getProviderStatusMessage(status: ServerProvider): string {
  if (status.message) return status.message;
  const providerName = status.displayName?.trim() || formatProviderDriverKindLabel(status.driver);
  if (!status.installed && hasProviderSetup(status)) {
    return t("Open provider setup to install {provider} on this environment.", {
      provider: formatProviderDriverKindLabel(status.driver),
    });
  }
  if (status.auth.status === "unauthenticated") {
    if (hasProviderSetup(status)) {
      return status.driver === "antigravity"
        ? t("Open provider setup to sign in with Google.")
        : t("Open provider setup to sign in.");
    }
    return t("Sign in via the CLI to authenticate again.");
  }
  return status.status === "ready"
    ? t("No models are available for this provider.")
    : status.status === "error"
      ? t("{provider} provider is unavailable.", { provider: providerName })
      : t("{provider} provider has limited availability.", { provider: providerName });
}

export const ProviderStatusBanner = memo(function ProviderStatusBanner({
  onDismiss,
  onOpenProviderSetup,
  status,
}: {
  onDismiss: () => void;
  onOpenProviderSetup?: (instanceId: ProviderInstanceId) => void;
  status: ServerProvider | null;
}) {
  if (!status || getProviderStatusBannerKey(status) === null) {
    return null;
  }

  const providerName = status.displayName?.trim() || formatProviderDriverKindLabel(status.driver);
  const isUnauthenticated = status.status === "error" && status.auth.status === "unauthenticated";
  const incompatible = status.status === "ready" ? getIncompatibleVersion(status) : null;
  const title = isUnauthenticated
    ? t("{provider} is unauthenticated", { provider: providerName })
    : incompatible
      ? incompatible.status === "broken"
        ? t("{provider} {version} is known to be broken", {
            provider: providerName,
            version: status.version ?? "",
          })
        : t("{provider} {version} is unsupported", {
            provider: providerName,
            version: status.version ?? "",
          })
      : t("{provider} provider status", { provider: providerName });
  const message = incompatible?.message ?? getProviderStatusMessage(status);
  const isWarning = status.status === "warning" || incompatible !== null;

  return (
    <div className="pointer-events-auto mx-auto w-fit max-w-[calc(100%-2rem)] pt-3">
      <Alert
        variant={isWarning ? "warning" : "error"}
        role={incompatible && incompatible.status !== "broken" ? "status" : "alert"}
        surface="glass"
        controlAlignment="first-line"
      >
        <InfoIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <Tooltip>
            <TooltipTrigger render={<div className="line-clamp-3" />}>{message}</TooltipTrigger>
            <TooltipPopup side="top" className="whitespace-pre-wrap">
              {message}
            </TooltipPopup>
          </Tooltip>
          {onOpenProviderSetup && hasProviderSetup(status) ? (
            <InlineButton onClick={() => onOpenProviderSetup(status.instanceId)}>
              {t("Open provider setup")}
            </InlineButton>
          ) : null}
        </AlertDescription>
        <AlertAction>
          <Button
            aria-label={
              status.status === "error"
                ? t("Dismiss {provider} provider error", { provider: providerName })
                : status.status === "warning"
                  ? t("Dismiss {provider} provider warning", { provider: providerName })
                  : t("Dismiss {provider} provider {status}", {
                      provider: providerName,
                      status: status.status,
                    })
            }
            onClick={onDismiss}
            size="icon-xs"
            variant="ghost-muted"
          >
            <XIcon />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
});
