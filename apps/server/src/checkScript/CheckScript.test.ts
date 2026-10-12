import * as NodeServices from "@effect/platform-node/NodeServices";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import * as ProcessRunner from "../processRunner.ts";
import * as CheckScript from "./CheckScript.ts";

const TestLayer = CheckScript.layer.pipe(
  Layer.provide(ProcessRunner.layer),
  Layer.provideMerge(NodeServices.layer),
);

it.layer(TestLayer)("CheckScript", (it) => {
  it.effect("reports a passing command with its output", () =>
    Effect.gen(function* () {
      const checkScript = yield* CheckScript.CheckScript;
      const result = yield* checkScript.run({ cwd: process.cwd(), command: "node --version" });
      expect(result.exitCode).toBe(0);
      expect(result.timedOut).toBe(false);
      expect(result.outputTail).toMatch(/^v\d+\./);
    }),
  );

  it.effect("keeps double quotes inside the command intact", () =>
    Effect.gen(function* () {
      const checkScript = yield* CheckScript.CheckScript;
      const result = yield* checkScript.run({
        cwd: process.cwd(),
        command: "node -e \"console.log('quoted ok')\"",
      });
      expect(result.exitCode).toBe(0);
      expect(result.outputTail).toContain("quoted ok");
    }),
  );

  it.effect("keeps a percent sign literal", () =>
    Effect.gen(function* () {
      const checkScript = yield* CheckScript.CheckScript;
      const result = yield* checkScript.run({
        cwd: process.cwd(),
        command: "node -e \"console.log('50% done')\"",
      });
      expect(result.exitCode).toBe(0);
      expect(result.outputTail).toContain("50% done");
    }),
  );

  it.effect("returns a failing exit code as a result, not an error", () =>
    Effect.gen(function* () {
      const checkScript = yield* CheckScript.CheckScript;
      const result = yield* checkScript.run({
        cwd: process.cwd(),
        command: "exit 3",
      });
      expect(result.exitCode).toBe(3);
      expect(result.timedOut).toBe(false);
    }),
  );
});
