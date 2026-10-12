import { describe, expect, it } from "vite-plus/test";

import { scanDiffForSecrets } from "./secretScan.ts";

// Sample credentials are assembled at runtime so this file never holds a
// literal that a push-protection scanner would flag.
const sample = {
  aws: ["AKIA", "ABCDEFGHIJKLMNOP"].join(""),
  google: ["AIza", "S".repeat(35)].join(""),
  sk: ["sk-", "ant", "a".repeat(30)].join(""),
  github: ["ghp_", "b".repeat(36)].join(""),
  slack: ["xoxb-", "1234567890-abc"].join(""),
  stripe: ["sk_", "live_", "c".repeat(24)].join(""),
  hubspot: ["pat-", "na1-", "0123abcd-".repeat(4)].join(""),
  privateKey: ["-----BEGIN ", "RSA PRIVATE KEY-----"].join(""),
  jwt: ["eyJ", "hbGciOiJIUzI1NiJ9", ".eyJ", "zdWIiOiIxMjM0NTY3ODkwIn0", ".sig"].join(""),
};

function patch(path: string, added: ReadonlyArray<string>, options: { newFile?: boolean } = {}) {
  const header = options.newFile
    ? [`diff --git a/${path} b/${path}`, "new file mode 100644", "--- /dev/null", `+++ b/${path}`]
    : [`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`];
  return [
    ...header,
    `@@ -10,1 +10,${added.length + 1} @@`,
    " const unchanged = true;",
    ...added.map((line) => `+${line}`),
    "",
  ].join("\n");
}

function kindsOf(diff: string) {
  return scanDiffForSecrets(diff).map((finding) => finding.kind);
}

describe("scanDiffForSecrets", () => {
  it.each([
    ["aws-access-key", `const key = "${sample.aws}";`],
    ["google-api-key", `const key = "${sample.google}";`],
    ["sk-api-key", `ANTHROPIC = "${sample.sk}"`],
    ["github-token", `auth: ${sample.github}`],
    ["slack-token", `hook ${sample.slack}`],
    ["stripe-key", `stripe(${sample.stripe})`],
    ["hubspot-token", `const hs = "${sample.hubspot}";`],
    ["private-key", sample.privateKey],
    ["jwt", `Authorization: Bearer ${sample.jwt}`],
    ["assignment", `DB_PASSWORD = "hunter2hunter2hunter2"`],
  ] as const)("finds %s on an added line", (kind, line) => {
    expect(kindsOf(patch("src/config.ts", [line]))).toEqual([kind]);
  });

  it("reports the new-file line number and masks the secret to its first 4 characters", () => {
    const [finding] = scanDiffForSecrets(patch("src/aws.ts", [`const key = "${sample.aws}";`]));
    expect(finding).toEqual({
      path: "src/aws.ts",
      line: 11,
      kind: "aws-access-key",
      excerpt: 'const key = "AKIA…";',
    });
  });

  it("keeps long excerpts within 80 characters", () => {
    const line = `${"x".repeat(120)} token = "${"q".repeat(40)}" ${"y".repeat(120)}`;
    const [finding] = scanDiffForSecrets(patch("src/long.ts", [line]));
    expect(finding?.excerpt.length).toBeLessThanOrEqual(80);
    expect(finding?.excerpt).toContain("qqqq…");
  });

  it("flags an added env or key file even when it holds nothing recognizable", () => {
    expect(kindsOf(patch(".env", ["DEBUG=1"], { newFile: true }))).toEqual(["env-file"]);
    expect(kindsOf(patch("apps/web/.env.local", ["A=1"], { newFile: true }))).toEqual(["env-file"]);
    expect(kindsOf(patch("certs/server.pem", ["abc"], { newFile: true }))).toEqual(["env-file"]);
  });

  it("ignores env templates, placeholders and environment lookups", () => {
    expect(
      kindsOf(patch(".env.example", ["API_KEY=your-api-key-here"], { newFile: true })),
    ).toEqual([]);
    expect(kindsOf(patch("src/config.ts", ["const token = process.env.GITHUB_TOKEN;"]))).toEqual(
      [],
    );
    expect(kindsOf(patch("src/config.ts", ['password: "changeme-changeme"']))).toEqual([]);
    expect(kindsOf(patch("src/config.ts", ['api_key = "<insert-your-key>"']))).toEqual([]);
  });

  it("ignores ordinary code that only names a credential", () => {
    for (const line of [
      "accessToken: TrimmedNonEmptyString,",
      "const token = useAuthToken();",
      "password: hashPassword(input),",
      'const token = localStorage.getItem("session-token");',
      "const refreshTokenExpiresAt = computeExpiry(now);",
    ]) {
      expect(kindsOf(patch("src/auth.ts", [line]))).toEqual([]);
    }
  });

  it("finds a literal credential in a quoted value or an env-style line", () => {
    expect(kindsOf(patch("src/auth.ts", ['const token = "abcdef0123456789abcdef";']))).toEqual([
      "assignment",
    ]);
    expect(
      kindsOf(patch(".env", ["HUBSPOT_TOKEN=abcdef0123456789abcdef"], { newFile: true })),
    ).toEqual(["assignment", "env-file"]);
  });

  it("finds a literal credential after a compound or JSON-quoted name", () => {
    for (const line of [
      'accessToken: "abcdefghijklmnopq",',
      'const access_token = "abcdefghijklmnopq";',
      '"api_key": "abcdefghijklmnopq",',
    ]) {
      expect(kindsOf(patch("src/config.json", [line]))).toEqual(["assignment"]);
    }
  });

  it("finds an env-style value with base64 padding or a trailing comment", () => {
    expect(
      kindsOf(
        patch(".env", ["AWS_SECRET_ACCESS_KEY=abcdefghijklmnopq== # prod"], { newFile: true }),
      ),
    ).toEqual(["assignment", "env-file"]);
  });

  it("ignores removed lines, context lines and an edited (not added) env file", () => {
    const diff = [
      "diff --git a/src/config.ts b/src/config.ts",
      "--- a/src/config.ts",
      "+++ b/src/config.ts",
      "@@ -1,2 +1,1 @@",
      `-const key = "${sample.aws}";`,
      ` const other = "${sample.github}";`,
      "",
    ].join("\n");
    expect(kindsOf(diff)).toEqual([]);
    expect(kindsOf(patch(".env", ["DEBUG=1"]))).toEqual([]);
  });

  it("does not read the +++ file header as an added line", () => {
    const path = `src/${sample.aws}.ts`;
    expect(kindsOf(patch(path, ["const ok = true;"]))).toEqual([]);
  });
});
