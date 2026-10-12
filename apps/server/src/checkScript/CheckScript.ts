// @effect-diagnostics nodeBuiltinImport:off - the Windows batch file is a spawn-boundary detail.
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
import * as NodeCrypto from "node:crypto";
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";

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

interface ShellInvocation {
  readonly command: string;
  readonly args: ReadonlyArray<string>;
  /** A temporary script to delete once the process has finished. */
  readonly scriptPath?: string;
}

function shellInvocation(
  command: string,
  platform: NodeJS.Platform,
  env: NodeJS.ProcessEnv,
): ShellInvocation {
  if (platform === "win32") {
    // Node re-quotes every argument on Windows, so a command holding `"` would
    // reach cmd.exe mangled. A batch file carries the command verbatim.
    const scriptPath = NodePath.join(NodeOS.tmpdir(), `t3-check-${NodeCrypto.randomUUID()}.cmd`);
    NodeFS.writeFileSync(scriptPath, `@echo off\r\n${command}\r\n`, "utf8");
    return { command: env.ComSpec ?? "cmd.exe", args: ["/d", "/c", scriptPath], scriptPath };
  }
  return { command: "sh", args: ["-lc", command] };
}

function removeScript(invocation: ShellInvocation): Effect.Effect<void> {
  return Effect.sync(() => {
    if (invocation.scriptPath !== undefined) {
      NodeFS.rmSync(invocation.scriptPath, { force: true });
    }
  });
}

function outputTail(stdout: string, stderr: string, maxChars: number): string {
  const combined =
    stderr.length > 0 ? `${stdout}${stdout.endsWith("\n") ? "" : "\n"}${stderr}` : stdout;
  return combined.slice(-maxChars);
}

/**
 * Keeps only the last `maxBytes` of a stream. The collected stdout is capped
 * at its beginning, but the failure a user needs to see is at the end.
 */
function tailCollector(maxBytes: number) {
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  return {
    push(chunk: Uint8Array) {
      chunks.push(chunk);
      bytes += chunk.byteLength;
      while (chunks.length > 1 && bytes - (chunks[0]?.byteLength ?? 0) >= maxBytes) {
        bytes -= chunks.shift()?.byteLength ?? 0;
      }
    },
    text(): string {
      return Buffer.concat(chunks).toString("utf8").slice(-maxBytes);
    },
    get bytes() {
      return bytes;
    },
  };
}

export const make = Effect.fn("CheckScript.make")(function* () {
  const processRunner = yield* ProcessRunner;
  const platform = yield* HostProcessPlatform;
  const env = yield* HostProcessEnvironment;

  const run = Effect.fn("CheckScript.run")(function* (input: ProjectRunCheckScriptInput) {
    const invocation = yield* Effect.sync(() => shellInvocation(input.command, platform, env));
    const startedAt = yield* Clock.currentTimeMillis;
    const maxChars = input.maxOutputChars ?? CHECK_SCRIPT_OUTPUT_TAIL_LENGTH;
    // UTF-8 can use up to 4 bytes per character; keep enough to fill the tail.
    const stdoutTail = tailCollector(maxChars * 4);
    const stderrTail = tailCollector(maxChars * 4);
    const output = yield* processRunner
      .run({
        command: invocation.command,
        args: invocation.args,
        cwd: input.cwd,
        onStdoutChunk: (chunk) => stdoutTail.push(chunk),
        onStderrChunk: (chunk) => stderrTail.push(chunk),
        timeout: input.timeoutMs ?? CHECK_SCRIPT_TIMEOUT_DEFAULT_MS,
        maxOutputBytes: MAX_OUTPUT_BYTES,
        outputMode: "truncate",
        // A timeout comes back as a result; its partial output is lost.
        timeoutBehavior: "timedOutResult",
      })
      .pipe(
        Effect.mapError((cause) => new CheckScriptError({ detail: cause.message })),
        Effect.ensuring(removeScript(invocation)),
      );
    const finishedAt = yield* Clock.currentTimeMillis;
    return {
      exitCode: output.code,
      timedOut: output.timedOut,
      durationMs: Math.max(0, Math.round(finishedAt - startedAt)),
      outputTail: outputTail(
        // The collected streams are cut at their end past MAX_OUTPUT_BYTES; the
        // streamed tails still have the end, which is where the failure is.
        stdoutTail.bytes > 0 ? stdoutTail.text() : output.stdout,
        stderrTail.bytes > 0 ? stderrTail.text() : output.stderr,
        maxChars,
      ),
    } satisfies ProjectRunCheckScriptResult;
  });

  return CheckScript.of({ run });
});

export const layer = Layer.effect(CheckScript, make());
