import { RegistryContext, useAtomValue } from "@effect/atom-react";
import {
  CHANGES_EXPLANATION_DIFF_MAX_LENGTH,
  type ChangesExplanation,
  type EnvironmentId,
} from "@t3tools/contracts";
import * as Cause from "effect/Cause";
import * as Option from "effect/Option";
import { AsyncResult, Atom } from "effect/unstable/reactivity";
import { useContext, useEffect, useState } from "react";

import { projectEnvironment } from "~/state/projects";

export interface ChangesExplanationState {
  /** The latest explanation of this patch; while a redo runs, the previous one. */
  readonly data: ChangesExplanation | null;
  readonly isPending: boolean;
  /** Why the explanation is unavailable; null while pending or once it arrived. */
  readonly error: string | null;
}

type ExplanationQueryAtom = Atom.Atom<AsyncResult.AsyncResult<ChangesExplanation, unknown>>;

const IDLE_EXPLANATION_ATOM: ExplanationQueryAtom = Atom.make(
  AsyncResult.initial<ChangesExplanation, never>(false),
).pipe(Atom.withLabel("changes-explanation:idle"));

function errorDetail(cause: unknown): string {
  if (typeof cause === "string") return cause;
  if (typeof cause === "object" && cause !== null && "detail" in cause) {
    const detail = (cause as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Plain-language explanation of a patch by the configured text model. Idle while
 * `diff` is null, so nothing is generated until the user asks. A new
 * `refreshNonce` (above 0) asks the server to skip its cache; the previous
 * explanation of the same patch stays on screen until the new one lands. Once a
 * redo lands, the plain query is refetched to pick up the explanation it cached.
 */
export function useChangesExplanation(
  environmentId: EnvironmentId | null,
  diff: string | null,
  refreshNonce: number,
): ChangesExplanationState {
  const registry = useContext(RegistryContext);
  const query = (nonce: number): ExplanationQueryAtom =>
    diff === null || environmentId === null
      ? IDLE_EXPLANATION_ATOM
      : projectEnvironment.explainChanges({
          environmentId,
          input: {
            diff: diff.slice(0, CHANGES_EXPLANATION_DIFF_MAX_LENGTH),
            ...(nonce > 0 ? { refreshNonce: nonce } : {}),
          },
        });
  const atom = query(refreshNonce);
  const plainAtom = query(0);
  const result = useAtomValue(atom);
  const redoLanded = refreshNonce > 0 && result._tag === "Success" && !result.waiting;
  useEffect(() => {
    if (redoLanded) registry.refresh(plainAtom);
  }, [plainAtom, redoLanded, registry]);
  const data = Option.getOrNull(AsyncResult.value(result));
  const failed = result._tag === "Failure" && data === null;

  const [kept, setKept] = useState<{ diff: string; explanation: ChangesExplanation } | null>(null);
  if (data !== null && diff !== null && kept?.explanation !== data) {
    setKept({ diff, explanation: data });
  }
  const previous = kept !== null && kept.diff === diff ? kept.explanation : null;

  return {
    data: data ?? previous,
    isPending: diff !== null && environmentId !== null && data === null && !failed,
    error: failed ? errorDetail(Cause.squash(result.cause)) : null,
  };
}
