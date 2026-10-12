import { useEffect, useMemo, useRef } from "react";

import { t } from "~/i18n";
import { readLocalApi } from "~/localApi";
import { useAllEnvironmentShellsBootstrapped, useThreadShells } from "~/state/entities";
import type { PullRequestStateKind } from "../chat/pullRequestState";
import { toastManager } from "../ui/toast";
import {
  collectPullRequestChanges,
  collectPullRequestObservations,
  createPullRequestChangeTracker,
} from "./pullRequestChange.logic";

const TOAST_TYPE: Partial<Record<PullRequestStateKind, "success" | "warning" | "error">> = {
  merged: "success",
  approved: "success",
  changesRequested: "warning",
  checksFailing: "error",
};

/**
 * Raises a toast when a review request linked to any thread moves to a state
 * worth acting on (checks failing, changes requested, approved, live). It only
 * reads the link snapshots the server already syncs onto thread shells, so it
 * adds no request of its own; the first state seen for each request is recorded
 * silently.
 */
export function PullRequestChangeNotifier() {
  const bootstrapped = useAllEnvironmentShellsBootstrapped();
  const threadShells = useThreadShells();
  const tracker = useRef(createPullRequestChangeTracker());
  const observations = useMemo(() => collectPullRequestObservations(threadShells), [threadShells]);

  useEffect(() => {
    if (!bootstrapped) return;
    const changes = collectPullRequestChanges(tracker.current, observations, Date.now());
    for (const change of changes) {
      const type = TOAST_TYPE[change.kind];
      toastManager.add({
        ...(type ? { type } : {}),
        title: t("PR #{number}: {state}", { number: change.number, state: change.label }),
        description: change.title,
        actionProps: {
          children: t("Open"),
          onClick: () => {
            void readLocalApi()?.shell.openExternal(change.url);
          },
        },
      });
    }
  }, [bootstrapped, observations]);

  return null;
}
