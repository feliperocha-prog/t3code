import {
  MAX_ROUTINE_INTERVAL_HOURS,
  type ProjectId,
  type RoutineSchedule,
  type ScheduledRoutine,
  type ScheduledRoutineRun,
} from "@t3tools/contracts";
import { Link } from "@tanstack/react-router";
import * as Cause from "effect/Cause";
import { PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~/i18n";
import { randomUUID } from "~/lib/utils";
import { useProjects } from "~/state/entities";
import { serverEnvironment } from "~/state/server";
import { useAtomCommand } from "~/state/use-atom-command";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { listsInFlight } from "./BehaviorRulesSettings";
import { useSettingsScope } from "./SettingsScopeContext";
import { SettingsRow, SettingsSection } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";
import { useScopedSettings, useUpdateScopedSettings } from "./useScopedSettings";

const ROUTINE_KEYS = ["scheduledRoutines"] as const;

export function describeSchedule(schedule: RoutineSchedule): string {
  if (schedule.kind === "daily") return t("Every day at {time}", { time: schedule.time });
  return schedule.hours === 1
    ? t("Every hour")
    : t("Every {hours} hours", { hours: String(schedule.hours) });
}

/** The schedule the form describes, or null while a field is not valid yet. */
export function draftSchedule(
  kind: RoutineSchedule["kind"],
  time: string,
  hours: string,
): RoutineSchedule | null {
  if (kind === "daily") {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? { kind, time } : null;
  }
  const parsed = Number(hours);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_ROUTINE_INTERVAL_HOURS
    ? { kind, hours: parsed }
    : null;
}

const lastRunTime = (run: ScheduledRoutineRun) =>
  new Date(run.at).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Prompts the server sends on a schedule, each run in a new conversation of
 * the chosen project. Routines belong to one environment because projects do,
 * so the section asks for a single environment before showing them.
 */
export function RoutinesSettings() {
  const { scope } = useSettingsScope();
  const environmentId = scope.environmentIds.length === 1 ? scope.environmentIds[0]! : null;
  const savedRoutines = useScopedSettings((settings) => settings.scheduledRoutines);
  const runs = useScopedSettings((settings) => settings.scheduledRoutineRuns);
  const updateSettings = useUpdateScopedSettings();
  const allProjects = useProjects();
  const projects = useMemo(
    () => allProjects.filter((project) => project.environmentId === environmentId),
    [allProjects, environmentId],
  );
  const runRoutine = useAtomCommand(serverEnvironment.runScheduledRoutine, {
    reportFailure: false,
  });
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<ProjectId | null>(null);
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<RoutineSchedule["kind"]>("daily");
  const [time, setTime] = useState("09:00");
  const [hours, setHours] = useState("4");
  const [running, setRunning] = useState<ReadonlySet<string>>(new Set());
  // Same round-trip guard as the agent rules: a second click before the
  // server echoes the first must build on the list we just sent.
  const [sent, setSent] = useState<{
    base: ReadonlyArray<ScheduledRoutine>;
    lists: ReadonlyArray<ReadonlyArray<ScheduledRoutine>>;
  }>({ base: savedRoutines, lists: [] });
  const inFlight = listsInFlight(sent, savedRoutines);
  const routines = inFlight.at(-1) ?? savedRoutines;
  const setRoutines = (scheduledRoutines: ReadonlyArray<ScheduledRoutine>) => {
    setSent({ base: savedRoutines, lists: [...inFlight, scheduledRoutines] });
    updateSettings({ scheduledRoutines });
  };

  const schedule = draftSchedule(kind, time, hours);
  const chosenProject = projects.find((project) => project.id === projectId) ?? null;
  const canAdd =
    name.trim().length > 0 && prompt.trim().length > 0 && chosenProject !== null && schedule;
  const submit = () => {
    if (!canAdd || chosenProject === null || schedule === null) return;
    setRoutines([
      ...routines,
      {
        id: randomUUID(),
        name: name.trim(),
        projectId: chosenProject.id,
        prompt: prompt.trim(),
        schedule,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    setName("");
    setPrompt("");
  };

  const runNow = async (routine: ScheduledRoutine) => {
    if (environmentId === null) return;
    setRunning((current) => new Set(current).add(routine.id));
    const result = await runRoutine({ environmentId, input: { routineId: routine.id } });
    setRunning((current) => {
      const next = new Set(current);
      next.delete(routine.id);
      return next;
    });
    let problem: string | null = null;
    if (result._tag === "Failure") {
      const error = Cause.squash(result.cause);
      problem = error instanceof Error ? error.message : t("Update failed.");
    } else if (result.value.problem === "project-missing") {
      problem = t("The routine's project no longer exists.");
    } else if (result.value.problem !== null) {
      problem = t("The conversation could not be started.");
    }
    toastManager.add(
      problem === null
        ? { type: "success", title: t("Routine started"), description: routine.name }
        : { type: "error", title: t("Routine did not start"), description: problem },
    );
  };

  if (environmentId === null) {
    return (
      <SettingsSection {...searchableSetting("scheduled-routines")}>
        <SettingsRow
          title={t("Choose one environment")}
          description={t("Routines run on one machine. Pick it in the selector at the top.")}
        />
      </SettingsSection>
    );
  }

  const projectTitle = (id: ProjectId) =>
    projects.find((project) => project.id === id)?.title ?? t("Missing project");

  return (
    <SettingsSection {...searchableSetting("scheduled-routines")}>
      <SettingsRow
        title={t("New routine")}
        description={t(
          "T3 sends the message on schedule, each time in a new conversation. On the installed Windows app it also runs with T3 closed, as long as the computer is on.",
        )}
        serverScoped
        settingKeys={ROUTINE_KEYS}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Input
              size="sm"
              className="min-w-40 flex-1"
              value={name}
              placeholder={t("Name, e.g. Daily check-up")}
              aria-label={t("Routine name")}
              onChange={(event) => setName(event.target.value)}
            />
            <Select
              value={chosenProject?.id ?? null}
              onValueChange={(value) => setProjectId(value as ProjectId | null)}
            >
              <SelectTrigger size="compact" className="w-48" aria-label={t("Project")}>
                <SelectValue>{chosenProject?.title ?? t("Choose project")}</SelectValue>
              </SelectTrigger>
              <SelectPopup align="start" alignItemWithTrigger={false}>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>
          <Textarea
            size="sm"
            value={prompt}
            placeholder={t("What the agent should do, e.g. Run the B2B check-up and summarize it")}
            aria-label={t("Routine message")}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={kind}
              onValueChange={(value) => setKind(value === "interval" ? "interval" : "daily")}
            >
              <SelectTrigger size="compact" className="w-40" aria-label={t("When")}>
                <SelectValue>
                  {kind === "daily" ? t("Every day at") : t("Every N hours")}
                </SelectValue>
              </SelectTrigger>
              <SelectPopup align="start" alignItemWithTrigger={false}>
                <SelectItem value="daily">{t("Every day at")}</SelectItem>
                <SelectItem value="interval">{t("Every N hours")}</SelectItem>
              </SelectPopup>
            </Select>
            {kind === "daily" ? (
              <Input
                size="sm"
                type="time"
                className="w-28"
                value={time}
                aria-label={t("Time")}
                onChange={(event) => setTime(event.target.value)}
              />
            ) : (
              <Input
                size="sm"
                type="number"
                min={1}
                max={MAX_ROUTINE_INTERVAL_HOURS}
                className="w-20"
                value={hours}
                aria-label={t("Hours between runs")}
                onChange={(event) => setHours(event.target.value)}
              />
            )}
            <Button type="submit" size="sm" variant="outline" disabled={!canAdd}>
              <PlusIcon />
              {t("Add")}
            </Button>
          </div>
        </form>
      </SettingsRow>
      {routines.length === 0 ? (
        <SettingsRow
          title={t("No routines yet")}
          description={t("Add one above, e.g. a check-up every morning at 09:00.")}
        />
      ) : null}
      {routines.map((routine) => {
        const run = runs[routine.id];
        return (
          <SettingsRow
            key={routine.id}
            title={routine.name}
            description={`${describeSchedule(routine.schedule)} · ${projectTitle(routine.projectId)}`}
            status={
              run ? (
                <span className={run.failed ? "text-destructive" : undefined}>
                  {run.failed
                    ? t("Last run {time}: failed", { time: lastRunTime(run) })
                    : t("Last run {time}", { time: lastRunTime(run) })}
                  {run.threadId ? (
                    <>
                      {" · "}
                      <Link
                        to="/$environmentId/$threadId"
                        params={{ environmentId, threadId: run.threadId }}
                        className="underline underline-offset-2"
                      >
                        {t("Open conversation")}
                      </Link>
                    </>
                  ) : null}
                </span>
              ) : (
                t("Has not run yet")
              )
            }
            serverScoped
            settingKeys={ROUTINE_KEYS}
            control={
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={running.has(routine.id)}
                  onClick={() => void runNow(routine)}
                >
                  <PlayIcon />
                  {t("Run now")}
                </Button>
                <Switch
                  checked={routine.enabled}
                  aria-label={routine.enabled ? t("Switch routine off") : t("Switch routine on")}
                  onCheckedChange={(checked) =>
                    setRoutines(
                      routines.map((entry) =>
                        entry.id === routine.id ? { ...entry, enabled: Boolean(checked) } : entry,
                      ),
                    )
                  }
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon-xs"
                        variant="ghost-destructive"
                        aria-label={t("Delete routine")}
                        onClick={() =>
                          setRoutines(routines.filter((entry) => entry.id !== routine.id))
                        }
                      />
                    }
                  >
                    <Trash2Icon />
                  </TooltipTrigger>
                  <TooltipPopup>{t("Delete routine")}</TooltipPopup>
                </Tooltip>
              </div>
            }
          />
        );
      })}
    </SettingsSection>
  );
}
