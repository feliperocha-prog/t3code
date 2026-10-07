import { CommandId, TurnId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import {
  needsMissingObjective,
  resolveObjectiveCommit,
  THREAD_OBJECTIVE_MAX_LENGTH,
} from "./threadObjective.logic";

describe("resolveObjectiveCommit", () => {
  it("commits the trimmed text", () => {
    expect(resolveObjectiveCommit({ value: "  Subir a LP  ", original: null })).toEqual({
      action: "commit",
      objective: "Subir a LP",
    });
  });

  it("clears with an empty string when the field is emptied", () => {
    expect(resolveObjectiveCommit({ value: "   ", original: "Subir a LP" })).toEqual({
      action: "commit",
      objective: "",
    });
  });

  it("skips unchanged text and an empty field without an objective", () => {
    expect(resolveObjectiveCommit({ value: "Subir a LP ", original: "Subir a LP" })).toEqual({
      action: "noop",
    });
    expect(resolveObjectiveCommit({ value: "", original: undefined })).toEqual({ action: "noop" });
  });

  it("caps the objective at the server limit", () => {
    const result = resolveObjectiveCommit({ value: "a".repeat(250), original: null });
    expect(result).toEqual({
      action: "commit",
      objective: "a".repeat(THREAD_OBJECTIVE_MAX_LENGTH),
    });
  });
});

describe("needsMissingObjective", () => {
  const settled = {
    objective: null,
    objectiveState: null,
    latestUserMessageAt: "2026-01-01T00:00:00.000Z",
    latestTurn: {
      turnId: TurnId.make("turn-1"),
      state: "completed",
      requestedAt: "2026-01-01T00:00:00.000Z",
      startedAt: "2026-01-01T00:00:01.000Z",
      completedAt: "2026-01-01T00:00:09.000Z",
      assistantMessageId: null,
    },
    titleRegeneration: null,
  } satisfies Parameters<typeof needsMissingObjective>[0];

  it("asks for an old conversation whose last turn settled without an objective", () => {
    expect(needsMissingObjective(settled, true)).toBe(true);
    expect(needsMissingObjective({ ...settled, objective: "   " }, true)).toBe(true);
    expect(
      needsMissingObjective(
        { ...settled, latestTurn: { ...settled.latestTurn, state: "interrupted" } },
        true,
      ),
    ).toBe(true);
  });

  it("asks for a conversation imported from Claude Code, which has messages but no turn", () => {
    expect(
      needsMissingObjective({ ...settled, latestTurn: null, latestUserMessageAt: null }, true),
    ).toBe(true);
  });

  it("waits while a turn runs or is on its way, since that turn writes the objective itself", () => {
    expect(
      needsMissingObjective(
        { ...settled, latestTurn: { ...settled.latestTurn, state: "running" } },
        true,
      ),
    ).toBe(false);
    // A first message the server has stamped but not started a turn for yet.
    expect(needsMissingObjective({ ...settled, latestTurn: null }, true)).toBe(false);
    expect(
      needsMissingObjective(
        {
          ...settled,
          titleRegeneration: {
            requestId: CommandId.make("cmd-regenerate"),
            startedAt: "2026-01-01T00:00:10.000Z",
          },
        },
        true,
      ),
    ).toBe(false);
  });

  it("leaves an empty conversation and an existing or manual objective alone", () => {
    expect(needsMissingObjective(settled, false)).toBe(false);
    expect(needsMissingObjective({ ...settled, objective: "Subir a LP" }, true)).toBe(false);
    // An objective the user emptied by hand stays empty.
    expect(needsMissingObjective({ ...settled, objectiveState: { source: "manual" } }, true)).toBe(
      false,
    );
  });
});
