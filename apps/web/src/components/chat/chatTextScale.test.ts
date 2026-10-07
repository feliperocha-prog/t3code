import { describe, expect, it } from "vite-plus/test";

import { CHAT_TEXT_SCALE_LEVELS, formatChatTextScale, stepChatTextScale } from "./chatTextScale";

describe("chatTextScale", () => {
  it("offers every 10% level from 80% to 180%", () => {
    expect(CHAT_TEXT_SCALE_LEVELS.map(formatChatTextScale)).toEqual([
      "80%",
      "90%",
      "100%",
      "110%",
      "120%",
      "130%",
      "140%",
      "150%",
      "160%",
      "170%",
      "180%",
    ]);
  });

  it("steps without drifting and stops at the ends", () => {
    let scale = 1;
    for (let index = 0; index < 3; index += 1) scale = stepChatTextScale(scale, 1);
    expect(scale).toBe(1.3);
    expect(stepChatTextScale(1.8, 1)).toBe(1.8);
    expect(stepChatTextScale(0.8, -1)).toBe(0.8);
    expect(stepChatTextScale(0.9, -1)).toBe(0.8);
  });
});
