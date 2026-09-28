import type { EnvironmentId, ServerSelfUpdateCapability } from "@t3tools/contracts";
import type { ServerUpdateStage, ServerUpdateState } from "@t3tools/client-runtime/state/server";
import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import { CircleArrowUpIcon } from "lucide-react";
import { type ComponentProps, useRef, useState } from "react";

import { requestConfirmDialog } from "~/confirmDialog";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { useEnvironmentSettings } from "~/hooks/useSettings";
import { serverEnvironment } from "~/state/server";
import { useAtomCommand } from "~/state/use-atom-command";
import { manualServerUpdateCommand } from "~/versionSkew";
import { Button } from "./ui/button";
import { toastManager } from "./ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";
import { t } from "~/i18n";

// The wire "installing" stage is a sub-second launcher handoff, so the UI
// folds it into the download phase; everything after the handoff is the
// restart the user is actually waiting through.
const UPDATE_STAGE_LABELS: Record<ServerUpdateStage, string> = {
  downloading: t("Downloading…"),
  installing: t("Downloading…"),
  resuming: t("Restarting…"),
};
const pendingUpdateEnvironmentIds = new Set<EnvironmentId>();

export function serverUpdateStageLabel(stage: ServerUpdateStage): string {
  return UPDATE_STAGE_LABELS[stage];
}

function updateFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message : t("Server update failed.");
}

export interface ServerUpdateTarget {
  readonly environmentId: EnvironmentId;
  readonly serverLabel: string;
  readonly selfUpdate: ServerSelfUpdateCapability | null;
  readonly desktopAppUpdate?: boolean;
  readonly threadContinuation?: boolean;
  readonly targetVersion: string;
  readonly continueThreadsAfterServerUpdate?: boolean;
}

type UpdateButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> & {
  readonly label?: string;
  /** "icon" renders a compact icon button with the label in a tooltip. */
  readonly appearance?: "button" | "icon";
};

function useServerUpdate() {
  const updateServer = useAtomCommand(serverEnvironment.updateServer, { reportFailure: false });
  return async (target: ServerUpdateTarget, failureTitle = t("Server update failed")) => {
    const { environmentId, serverLabel, selfUpdate, targetVersion } = target;
    if (pendingUpdateEnvironmentIds.has(environmentId)) return;
    pendingUpdateEnvironmentIds.add(environmentId);
    try {
      const result = await updateServer({
        environmentId,
        input: {
          targetVersion,
          ...(target.threadContinuation && target.continueThreadsAfterServerUpdate
            ? { continueRunningThreads: true }
            : {}),
        },
      });
      if (result._tag === "Failure") {
        if (isAtomCommandInterrupted(result)) return;
        throw squashAtomCommandFailure(result);
      }
      toastManager.add({
        type: "success",
        title: t("{server} updated", { server: serverLabel }),
        description:
          selfUpdate === "desktop-managed"
            ? t("Desktop app relaunched on {version}.", { version: result.value.targetVersion })
            : t("Reconnected on t3@{version}.", { version: result.value.targetVersion }),
      });
    } catch (error) {
      toastManager.add({
        type: "error",
        title: failureTitle,
        description: updateFailureMessage(error),
      });
    } finally {
      pendingUpdateEnvironmentIds.delete(environmentId);
    }
  };
}

/** Updates eligible machines independently; manual paths remain in the machine list. */
export function ServerUpdatesAction({
  targets,
  label = t("Update all"),
  variant = "outline",
  size = "xs",
  className,
}: UpdateButtonProps & {
  readonly targets: ReadonlyArray<ServerUpdateTarget>;
}) {
  const update = useServerUpdate();
  const pending = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const eligible = targets.filter(
    (target) =>
      target.selfUpdate !== null &&
      (target.selfUpdate !== "desktop-managed" || target.desktopAppUpdate),
  );
  const handleUpdate = async () => {
    if (pending.current) return;
    pending.current = true;
    setIsPending(true);
    try {
      const available = eligible.filter(
        (target) => !pendingUpdateEnvironmentIds.has(target.environmentId),
      );
      const desktopTargets = available.filter((target) => target.selfUpdate === "desktop-managed");
      if (desktopTargets.length > 0) {
        const confirmed =
          (await requestConfirmDialog(
            t(
              "Update the T3 Code desktop apps on {machines}? They will close and relaunch on those machines.",
              { machines: desktopTargets.map((target) => target.serverLabel).join(", ") },
            ),
          )) ?? true;
        if (!confirmed) return;
      }
      await Promise.all(
        available.map((target) =>
          update(target, t("{server} update failed", { server: target.serverLabel })),
        ),
      );
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  };
  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={isPending || eligible.length === 0}
      onClick={() => void handleUpdate()}
    >
      {label}
    </Button>
  );
}

/**
 * One-row status for an in-flight server update: "Downloading…" then
 * "Restarting…". The update is a wait, not a warning: a single pulsing dot
 * and label, no step rail, no versions. Failure turns the row red with the
 * rollback reason.
 */
export function ServerUpdateProgress({
  state,
}: {
  readonly state: Exclude<ServerUpdateState, { status: "idle" }>;
}) {
  if (state.status === "failed") {
    return (
      <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-destructive" role="alert">
        <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
        <Tooltip>
          <TooltipTrigger render={<span className="min-w-0 truncate">{state.message}</span>} />
          <TooltipPopup side="top">{state.message}</TooltipPopup>
        </Tooltip>
      </div>
    );
  }
  return (
    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-foreground">
      <span
        className="size-1.5 shrink-0 animate-status-pulse rounded-full bg-foreground"
        aria-hidden="true"
      />
      <span>{serverUpdateStageLabel(state.stage)}</span>
    </div>
  );
}

/**
 * Offers the update path advertised by a version-skewed server. Self-updates
 * delegate their full lifecycle to client-runtime so this component can
 * unmount during reconnect without losing operation state.
 */
export function ServerUpdateAction({
  environmentId,
  serverLabel,
  selfUpdate,
  desktopAppUpdate = false,
  threadContinuation = false,
  targetVersion,
  label = t("Update"),
  variant = "outline",
  size = "xs",
  className,
  appearance = "button",
}: Omit<ServerUpdateTarget, "continueThreadsAfterServerUpdate"> & UpdateButtonProps) {
  const isDesktopAppUpdate = selfUpdate === "desktop-managed";
  const continueThreadsAfterServerUpdate = useEnvironmentSettings(
    environmentId,
    (settings) => settings.continueThreadsAfterServerUpdate,
  );
  const update = useServerUpdate();
  const { copyToClipboard } = useCopyToClipboard<{ command: string }>({
    target: "update command",
    onCopy: ({ command }) => {
      toastManager.add({
        type: "success",
        title: t("Update command copied"),
        description: t("Run `{command}` on {server} to update it.", {
          command,
          server: serverLabel,
        }),
      });
    },
    onError: (error) => {
      toastManager.add({
        type: "error",
        title: t("Could not copy update command"),
        description: error.message,
      });
    },
  });

  const handleUpdate = async () => {
    if (pendingUpdateEnvironmentIds.has(environmentId)) {
      return;
    }
    if (isDesktopAppUpdate) {
      // No themed host mounted (undefined) means proceed: the click itself
      // was the request. This is the only confirmation in the flow; the
      // remote machine installs without asking anyone there.
      const confirmed =
        (await requestConfirmDialog(
          t(
            "Update the T3 Code desktop app that runs the {server}? It will close and relaunch on that machine.",
            { server: serverLabel },
          ),
        )) ?? true;
      if (!confirmed) {
        return;
      }
    }
    await update({
      environmentId,
      serverLabel,
      selfUpdate,
      desktopAppUpdate,
      threadContinuation,
      targetVersion,
      continueThreadsAfterServerUpdate,
    });
  };

  if (selfUpdate === "desktop-managed" && !desktopAppUpdate) {
    return (
      <span className="text-muted-foreground text-xs">
        {t("Update the desktop app on that machine to update this server.")}
      </span>
    );
  }

  const manualCommand = selfUpdate === null ? manualServerUpdateCommand(targetVersion) : null;
  const actionLabel = manualCommand !== null ? t("Copy update command") : label;
  const onClick =
    manualCommand !== null
      ? () => copyToClipboard(manualCommand, { command: manualCommand })
      : () => void handleUpdate();

  if (appearance === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-xs"
              variant="ghost-muted"
              className={className}
              aria-label={t("{action} for {server}", { action: actionLabel, server: serverLabel })}
              onClick={onClick}
            />
          }
        >
          <CircleArrowUpIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipPopup side="top">{actionLabel}</TooltipPopup>
      </Tooltip>
    );
  }

  return (
    <Button size={size} variant={variant} className={className} onClick={onClick}>
      {actionLabel}
    </Button>
  );
}
