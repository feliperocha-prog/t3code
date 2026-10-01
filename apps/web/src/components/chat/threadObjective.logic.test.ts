import { describe, expect, it } from "vite-plus/test";

import { resolveObjectiveCommit, THREAD_OBJECTIVE_MAX_LENGTH } from "./threadObjective.logic";

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
