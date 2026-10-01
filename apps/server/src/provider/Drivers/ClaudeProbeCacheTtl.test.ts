import { describe, expect, it } from "@effect/vitest";
import * as Exit from "effect/Exit";

import {
  CAPABILITIES_PROBE_RETRY_TTL,
  CAPABILITIES_PROBE_TTL,
  probeCacheTtl,
} from "./ClaudeProbeCacheTtl.ts";

describe("probeCacheTtl", () => {
  it("keeps a probe with usage limits for five minutes", () => {
    expect(probeCacheTtl(Exit.succeed({ usage: { rate_limits_available: true } }))).toBe(
      CAPABILITIES_PROBE_TTL,
    );
  });

  it("retries soon when the probe came back without usage limits", () => {
    const probe: { readonly email: string; readonly usage?: unknown } = { email: "a@b.c" };
    expect(probeCacheTtl(Exit.succeed(probe))).toBe(CAPABILITIES_PROBE_RETRY_TTL);
  });

  it("retries soon when the probe produced nothing", () => {
    expect(probeCacheTtl(Exit.succeed(undefined))).toBe(CAPABILITIES_PROBE_RETRY_TTL);
  });

  it("retries soon when the probe failed", () => {
    expect(probeCacheTtl(Exit.fail("boom"))).toBe(CAPABILITIES_PROBE_RETRY_TTL);
  });
});
