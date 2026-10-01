import { describe, expect, it } from "vitest";

import { defaultStateNotePath, projectFolderName, resolveStateNotePath } from "./projectHome.logic";

describe("projectFolderName", () => {
  it("takes the last segment of a POSIX path", () => {
    expect(projectFolderName("/home/felipe/Projetos/t3code")).toBe("t3code");
  });

  it("takes the last segment of a Windows path with a trailing separator", () => {
    expect(projectFolderName("C:\\Users\\felip\\Projetos\\t3code\\")).toBe("t3code");
  });
});

describe("resolveStateNotePath", () => {
  it("defaults to the project's hub under Projetos", () => {
    expect(defaultStateNotePath("C:\\Users\\felip\\Projetos\\minimal-matrix")).toBe(
      "Projetos/minimal-matrix/HUB.md",
    );
    expect(resolveStateNotePath("/work/apex", "   ")).toBe("Projetos/apex/HUB.md");
  });

  it("uses the configured path when the project sets one", () => {
    expect(resolveStateNotePath("/work/apex", " Notas/apex.md ")).toBe("Notas/apex.md");
  });
});
