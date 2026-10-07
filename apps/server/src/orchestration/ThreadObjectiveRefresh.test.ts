import { describe, expect, it } from "vite-plus/test";

import { shouldRefreshThreadObjective } from "./ThreadObjectiveRefresh.ts";

const settled = (previousCount: number | undefined, userMessageCount: number) =>
  shouldRefreshThreadObjective({ previousCount, userMessageCount, force: false });

describe("shouldRefreshThreadObjective", () => {
  it("refreshes when the count reaches the next multiple of three", () => {
    expect(settled(1, 2)).toBe(false);
    expect(settled(2, 3)).toBe(true);
    expect(settled(3, 4)).toBe(false);
    expect(settled(5, 6)).toBe(true);
    // Several messages in one turn still cross the multiple.
    expect(settled(4, 7)).toBe(true);
  });

  it("does not refresh twice for the same count", () => {
    expect(settled(3, 3)).toBe(false);
  });

  it("only records the count the first time a thread is seen since startup", () => {
    expect(settled(undefined, 3)).toBe(false);
    expect(settled(undefined, 1)).toBe(false);
  });

  it("does not refresh when a revert lowers the count", () => {
    expect(settled(4, 2)).toBe(false);
  });

  it("refreshes right away after a reset to automatic once the user has written", () => {
    expect(
      shouldRefreshThreadObjective({ previousCount: undefined, userMessageCount: 1, force: true }),
    ).toBe(true);
    expect(
      shouldRefreshThreadObjective({ previousCount: 3, userMessageCount: 3, force: true }),
    ).toBe(true);
    expect(
      shouldRefreshThreadObjective({ previousCount: undefined, userMessageCount: 0, force: true }),
    ).toBe(false);
  });
});
