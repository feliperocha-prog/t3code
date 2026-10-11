import { describe, expect, it } from "vite-plus/test";

import { stepChatWidth } from "./chatWidth";

describe("stepChatWidth", () => {
  it("steps through the widths in order", () => {
    expect(stepChatWidth("comfortable", 1)).toBe("wide");
    expect(stepChatWidth("wide", 1)).toBe("full");
    expect(stepChatWidth("full", -1)).toBe("wide");
    expect(stepChatWidth("wide", -1)).toBe("comfortable");
  });

  it("stays at either end instead of wrapping", () => {
    expect(stepChatWidth("full", 1)).toBe("full");
    expect(stepChatWidth("comfortable", -1)).toBe("comfortable");
  });
});
