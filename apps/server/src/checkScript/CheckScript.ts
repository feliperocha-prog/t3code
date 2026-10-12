/**
 * Runs one project script (build, tests) to completion so the publish checklist
 * can tell whether it passed. The command goes through the platform shell, the
 * same way a user would type it in a terminal at the project root.
 */
import {
  CHECK_SCRIPT_OUTPUT_TAIL_LENGTH,
  CHECK_SCRIPT_TIMEOUT_DEFAULT_MS,
  CheckScriptError,
  type ProjectRunCheckScriptInput,
  type ProjectRunCheckScriptResult,
} from "@t3tools/contracts";
import { HostProcessEnvironment, HostProcessPlatform } from "@t3tools/shared/hostProcess";
import * as Clock from "effect/Clock";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { ProcessRunner } from "../processRunner.ts";

const MAX_OUTPUT_BYTES = 1_000_000;

export class CheckScript extends Context.Service<
  CheckScript,
  {
    /** Runs `input.command` in `input.cwd`; a non-zero exit or a timeout is a result, not an error. */
    readonly run: (
      input: ProjectRunCheckScriptInput,
    ) => Effect.Effect<ProjectRunCheckScriptResult, CheckScriptError>;
  }
>()("t3/checkScript/CheckScript") {}

function shellInvocation(
  command: string,
  platform: NodeJS.Platform,
  env: NodeJS.ProcessEnv,
): { command: string; args: ReadonlyArray<string> } {
  if (platform === "win32") {
    // `/s` strips the quotes libuv puts around the command argument.
    return { command: env.ComSpec ?? "cmd.exe", args: ["/d", "/s", "/c", command] };
  }
  return { command: "sh", args: ["-lc", command] };
}

function outputTail(stdout: string, stderr: string): string {
  const combined =
    stderr.length > 0 ? `${stdout}${stdout.endsWith("\n") ? "" : "\n"}${stderr}` : stdout;
  return combined.slice(-CHECK_SCRIPT_OUTPUT_TAIL_LENGTH);
}

export const make = Effect.fn("CheckScript.make")(function* () {
  const processRunner = yield* ProcessRunner;
  const platform = yield* HostProcessPlatform;
  const env = yield* HostProcessEnvironment;

  const run = Effect.fn("CheckScript.run")(function* (input: ProjectRunCheckScriptInput) {
    const invocation = shellInvocation(input.command, platform, env);
    const startedAt = yield* Clock.currentTimeMillis;
    const output = yield* processRunner
      .run({
        command: invocation.command,
        args: invocation.args,
        cwd: input.cwd,
        timeout: input.timeoutMs ?? CHECK_SCRIPT_TIMEOUT_DEFAULT_MS,
        maxOutputBytes: MAX_OUTPUT_BYTES,
        outputMode: "truncate",
        // A timeout comes back as a result; its partial output is lost.
        timeoutBehavior: "timedOutResult",
      })
      .pipe(Effect.mapError((cause) => new CheckScriptError({ detail: cause.message })));
    const finishedAt = yield* Clock.currentTimeMillis;
    return {
      exitCode: output.code,
      timedOut: output.timedOut,
      durationMs: Math.max(0, Math.round(finishedAt - startedAt)),
      outputTail: outputTail(output.stdout, output.stderr),
    } satisfies ProjectRunCheckScriptResult;
  });

  return CheckScript.of({ run });
});

export const layer = Layer.effect(CheckScript, make());
