import { RegistryContext, useAtomValue } from "@effect/atom-react";
import {
  type EnvironmentId,
  PROJECT_BRIEF_NOTE_MAX_LENGTH,
  type ProjectBrief,
} from "@t3tools/contracts";
import * as Cause from "effect/Cause";
import * as Option from "effect/Option";
import { AsyncResult, Atom } from "effect/unstable/reactivity";
import { useContext, useEffect, useState } from "react";

import { projectEnvironment } from "~/state/projects";

export interface ProjectBriefState {
  /** The latest summary of this note; while a redo runs, the previous one. */
  readonly data: ProjectBrief | null;
  readonly isPending: boolean;
  /** Why the summary is unavailable; null while pending or once it arrived. */
  readonly error: string | null;
}

type BriefQueryAtom = Atom.Atom<AsyncResult.AsyncResult<ProjectBrief, unknown>>;

const IDLE_BRIEF_ATOM: BriefQueryAtom = Atom.make(
  AsyncResult.initial<ProjectBrief, never>(false),
).pipe(Atom.withLabel("project-brief:idle"));

function errorDetail(cause: unknown): string {
  if (typeof cause === "string") return cause;
  if (typeof cause === "object" && cause !== null && "detail" in cause) {
    const detail = (cause as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Summary of the hub note by the configured text model. Idle while the note is
 * unread. A new `refreshNonce` (above 0) asks the server to skip its cache; the
 * previous summary of the same note stays on screen until the new one lands.
 * The nonce lives in the caller, so a home opened later starts from 0 again: once
 * a redo lands, the plain query is refetched to pick up the summary it cached.
 */
export function useProjectBrief(
  environmentId: EnvironmentId,
  noteContents: string | null,
  refreshNonce: number,
): ProjectBriefState {
  const registry = useContext(RegistryContext);
  const query = (nonce: number): BriefQueryAtom =>
    noteContents === null
      ? IDLE_BRIEF_ATOM
      : projectEnvironment.generateBrief({
          environmentId,
          input: {
            noteContents: noteContents.slice(0, PROJECT_BRIEF_NOTE_MAX_LENGTH),
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

  const [kept, setKept] = useState<{ contents: string; brief: ProjectBrief } | null>(null);
  if (data !== null && noteContents !== null && kept?.brief !== data) {
    setKept({ contents: noteContents, brief: data });
  }
  const previous = kept !== null && kept.contents === noteContents ? kept.brief : null;

  return {
    data: data ?? previous,
    isPending: noteContents !== null && data === null && !failed,
    error: failed ? errorDetail(Cause.squash(result.cause)) : null,
  };
}
