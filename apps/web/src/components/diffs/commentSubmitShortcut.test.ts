import { describe, expect, it } from "vite-plus/test";

import { isCommentSubmitShortcut } from "./commentSubmitShortcut";

describe("isCommentSubmitShortcut", () => {
  it("accepts Command or Ctrl+Enter only while an eligible comment is idle", () => {
    expect(
      isCommentSubmitShortcut({ key: "Enter", metaKey: true, ctrlKey: false }, "Looks good", false),
    ).toBe(true);
    expect(
      isCommentSubmitShortcut({ key: "Enter", metaKey: false, ctrlKey: true }, "Looks good", false),
    ).toBe(true);
    expect(
      isCommentSubmitShortcut({ key: "Enter", metaKey: true, ctrlKey: false }, "Looks good", true),
    ).toBe(false);
  });

  it("rejects empty comments and unrelated key presses", () => {
    expect(
      isCommentSubmitShortcut({ key: "Enter", metaKey: true, ctrlKey: false }, "   ", false),
    ).toBe(false);
    expect(
      isCommentSubmitShortcut({ key: "K", metaKey: true, ctrlKey: false }, "Looks good", false),
    ).toBe(false);
  });

  it("keeps plain Enter and Shift+Enter as newlines unless submitOnEnter is set", () => {
    const enter = { key: "Enter", metaKey: false, ctrlKey: false, shiftKey: false };
    const shiftEnter = { ...enter, shiftKey: true };
    expect(isCommentSubmitShortcut(enter, "Rename this", false)).toBe(false);
    expect(isCommentSubmitShortcut(shiftEnter, "Rename this", false)).toBe(false);
    expect(isCommentSubmitShortcut(enter, "Rename this", false, { submitOnEnter: false })).toBe(
      false,
    );
  });

  it("sends on Enter but not Shift+Enter when submitOnEnter is set", () => {
    const enter = { key: "Enter", metaKey: false, ctrlKey: false, shiftKey: false };
    const options = { submitOnEnter: true };
    expect(isCommentSubmitShortcut(enter, "Rename this", false, options)).toBe(true);
    expect(
      isCommentSubmitShortcut({ ...enter, shiftKey: true }, "Rename this", false, options),
    ).toBe(false);
    expect(
      isCommentSubmitShortcut({ ...enter, ctrlKey: true }, "Rename this", false, options),
    ).toBe(true);
    expect(isCommentSubmitShortcut(enter, "  ", false, options)).toBe(false);
    expect(isCommentSubmitShortcut(enter, "Rename this", true, options)).toBe(false);
  });

  it("ignores Enter that confirms an IME composition", () => {
    const composingEnter = {
      key: "Enter",
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      isComposing: true,
    };
    expect(
      isCommentSubmitShortcut(composingEnter, "Rename this", false, { submitOnEnter: true }),
    ).toBe(false);
    expect(
      isCommentSubmitShortcut(
        { ...composingEnter, isComposing: false, keyCode: 229 },
        "Rename this",
        false,
        { submitOnEnter: true },
      ),
    ).toBe(false);
  });
});
