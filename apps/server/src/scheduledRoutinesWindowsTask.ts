import type { ScheduledRoutine } from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

/** Set by the packaged Windows desktop app: the exe the task launches. */
export const ROUTINES_LAUNCHER_ENV = "T3CODE_ROUTINES_LAUNCHER";
/** The desktop app opens with no window, runs due routines, then quits. */
export const ROUTINES_LAUNCH_ARG = "--t3-routines";
export const ROUTINES_TASK_NAME = "T3 Code\\Rotinas";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * The Task Scheduler definition that opens the app at every daily routine's
 * time, and hourly while an interval routine is on. The app itself decides
 * what is due, so a launch with nothing due just quits. Null when no routine
 * is on, meaning the task should not exist.
 */
export function routinesTaskXml(
  routines: ReadonlyArray<ScheduledRoutine>,
  launcher: string,
  today: string,
): string | null {
  const enabled = routines.filter((routine) => routine.enabled);
  if (enabled.length === 0) return null;
  const dailyTimes = [
    ...new Set(
      enabled.flatMap((routine) =>
        routine.schedule.kind === "daily" ? [routine.schedule.time] : [],
      ),
    ),
  ].toSorted();
  const triggers = dailyTimes.map(
    (time) =>
      `    <CalendarTrigger><StartBoundary>${today}T${time}:00</StartBoundary><Enabled>true</Enabled><ScheduleByDay><DaysInterval>1</DaysInterval></ScheduleByDay></CalendarTrigger>`,
  );
  if (enabled.some((routine) => routine.schedule.kind === "interval")) {
    triggers.push(
      `    <TimeTrigger><Repetition><Interval>PT1H</Interval><StopAtDurationEnd>false</StopAtDurationEnd></Repetition><StartBoundary>${today}T00:00:00</StartBoundary><Enabled>true</Enabled></TimeTrigger>`,
    );
  }
  return [
    `<?xml version="1.0" encoding="UTF-16"?>`,
    `<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">`,
    `  <RegistrationInfo><Description>Abre o T3 Code sem janela para rodar as rotinas agendadas.</Description></RegistrationInfo>`,
    `  <Triggers>`,
    ...triggers,
    `  </Triggers>`,
    `  <Principals><Principal id="Author"><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>`,
    `  <Settings>`,
    `    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>`,
    `    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>`,
    `    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>`,
    `    <StartWhenAvailable>true</StartWhenAvailable>`,
    `    <ExecutionTimeLimit>PT4H</ExecutionTimeLimit>`,
    `    <Enabled>true</Enabled>`,
    `  </Settings>`,
    `  <Actions Context="Author"><Exec><Command>${escapeXml(launcher)}</Command><Arguments>${ROUTINES_LAUNCH_ARG}</Arguments></Exec></Actions>`,
    `</Task>`,
    ``,
  ].join("\r\n");
}

const schtasks = (args: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    return yield* spawner.exitCode(
      ChildProcess.make("schtasks", args, { stdin: "ignore", stdout: "ignore", stderr: "ignore" }),
    );
  });

/** Creates, replaces or removes the task so it matches `xml`. */
export const syncRoutinesTask = Effect.fn("syncRoutinesTask")(function* (
  xml: string | null,
  stateDir: string,
) {
  if (xml === null) {
    // Exit code 1 just means there was no task to remove.
    yield* schtasks(["/Delete", "/TN", ROUTINES_TASK_NAME, "/F"]);
    return;
  }
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const file = path.join(stateDir, "scheduled-routines-task.xml");
  // schtasks reads the XML as UTF-16 LE with a byte order mark.
  const body = Buffer.from(String.fromCharCode(0xfeff) + xml, "utf16le");
  yield* fs.writeFile(file, new Uint8Array(body));
  const code = yield* schtasks(["/Create", "/TN", ROUTINES_TASK_NAME, "/XML", file, "/F"]);
  if (code !== 0) {
    yield* Effect.logWarning("could not register the scheduled routines task", { exitCode: code });
  }
});
