import { scopeProjectRef } from "@t3tools/client-runtime/environment";
import {
  isAtomCommandInterrupted,
  settlePromise,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId } from "@t3tools/contracts";
import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";
import { create } from "zustand";

import { useHandleNewThread } from "~/hooks/useHandleNewThread";
import { t } from "~/i18n";
import { ensureBrowseDirectoryPath } from "~/lib/projectPaths";
import { cn, newProjectId } from "~/lib/utils";
import { useEnvironments } from "~/state/environments";
import { filesystemEnvironment } from "~/state/filesystem";
import { projectEnvironment } from "~/state/projects";
import { useAtomCommand } from "~/state/use-atom-command";
import { useAtomQueryRunner } from "~/state/use-atom-query-runner";
import { vcsEnvironment } from "~/state/vcs";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { stackedThreadToast, toastManager } from "../ui/toast";
import {
  NEW_PROJECT_BRANDS,
  type NewProjectBrand,
  newProjectFiles,
  newProjectSlug,
} from "./newProjectTemplates";

const useNewProjectAssistant = create<{ environmentId: EnvironmentId | null }>(() => ({
  environmentId: null,
}));

/** Opens the "start a project from scratch" assistant for one environment. */
export function openNewProjectAssistant(environmentId: EnvironmentId) {
  useNewProjectAssistant.setState({ environmentId });
}

const OWNER_STORAGE_KEY = "t3code:new-project-owner";

function readStoredOwner(): string {
  try {
    return window.localStorage.getItem(OWNER_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeOwner(owner: string) {
  try {
    window.localStorage.setItem(OWNER_STORAGE_KEY, owner);
  } catch {
    // Only a convenience: the next project asks again.
  }
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : t("An error occurred.");

/** Mounted once at the root; shows the assistant while an entry point has it open. */
export function NewProjectAssistantHost() {
  const environmentId = useNewProjectAssistant((state) => state.environmentId);
  if (environmentId === null) return null;
  return (
    <NewProjectAssistant
      // A fresh form per opening, so a cancelled draft does not linger.
      key={environmentId}
      environmentId={environmentId}
      onClose={() => useNewProjectAssistant.setState({ environmentId: null })}
    />
  );
}

function NewProjectAssistant({
  environmentId,
  onClose,
}: {
  environmentId: EnvironmentId;
  onClose: () => void;
}) {
  const formId = useId();
  const { environments } = useEnvironments();
  const { handleNewThread } = useHandleNewThread();
  const browse = useAtomQueryRunner(filesystemEnvironment.browse, {
    reportFailure: false,
    reportDefect: false,
  });
  const createProject = useAtomCommand(projectEnvironment.create, { reportFailure: false });
  const writeFile = useAtomCommand(projectEnvironment.writeFile, { reportFailure: false });
  const initRepository = useAtomCommand(vcsEnvironment.init, { reportFailure: false });

  const configuredBase =
    environments
      .find((environment) => environment.environmentId === environmentId)
      ?.serverConfig?.settings.addProjectBaseDirectory?.trim() ?? "";
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [brand, setBrand] = useState<NewProjectBrand | null>(null);
  const [owner, setOwner] = useState(readStoredOwner);
  // The setting's stock "~/" would drop projects loose in the home folder.
  const [baseDirectory, setBaseDirectory] = useState(
    configuredBase === "" || configuredBase === "~/" ? "~/Projetos/" : configuredBase,
  );
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = newProjectSlug(name);
  const base = ensureBrowseDirectoryPath(baseDirectory.trim() || "~/");
  const ready =
    slug !== "" && purpose.trim() !== "" && brand !== null && owner.trim() !== "" && step === null;

  const create = async () => {
    if (!ready || brand === null) return;
    setError(null);

    setStep(t("Checking the folder…"));
    const listing = await browse({ environmentId, input: { partialPath: base } });
    if (listing._tag === "Failure") {
      setStep(null);
      setError(t("Could not open {folder}. Check that it exists.", { folder: base }));
      return;
    }
    const { parentPath, entries } = listing.value;
    if (entries.some((entry) => entry.name.toLowerCase() === slug)) {
      setStep(null);
      setError(
        t("{folder} already has a folder named {name}.", { folder: parentPath, name: slug }),
      );
      return;
    }
    const separator = parentPath.includes("\\") ? "\\" : "/";
    const root = `${parentPath.replace(/[\\/]+$/, "")}${separator}${slug}`;

    setStep(t("Creating the project…"));
    const projectId = newProjectId();
    const created = await createProject({
      environmentId,
      input: {
        projectId,
        title: name.trim(),
        workspaceRoot: root,
        createWorkspaceRootIfMissing: true,
        defaultModelSelection: null,
      },
    });
    if (created._tag === "Failure") {
      setStep(null);
      if (!isAtomCommandInterrupted(created)) {
        setError(errorMessage(squashAtomCommandFailure(created)));
      }
      return;
    }
    storeOwner(owner.trim());

    // From here the project exists, so a failure is reported and the rest still runs.
    const problems: string[] = [];
    setStep(t("Writing README, .gitignore and CLAUDE.md…"));
    for (const file of newProjectFiles({ name, purpose, brand, owner })) {
      const written = await writeFile({ environmentId, input: { cwd: root, ...file } });
      if (written._tag === "Failure") problems.push(file.relativePath);
    }
    setStep(t("Starting git…"));
    const initialized = await initRepository({ environmentId, input: { cwd: root } });
    if (initialized._tag === "Failure") problems.push("git init");

    toastManager.add(
      stackedThreadToast(
        problems.length === 0
          ? {
              type: "success",
              title: t("Project {name} created", { name: name.trim() }),
              description: root,
            }
          : {
              type: "warning",
              title: t("Project {name} created with gaps", { name: name.trim() }),
              description: t("Could not finish: {steps}. Folder: {folder}", {
                steps: problems.join(", "),
                folder: root,
              }),
            },
      ),
    );
    onClose();
    await settlePromise(() => handleNewThread(scopeProjectRef(environmentId, projectId)));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && step === null) onClose();
      }}
    >
      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("New project from scratch")}</DialogTitle>
          <DialogDescription>
            {t(
              "Creates a local folder with git, a README, a .gitignore that keeps .env out, and a CLAUDE.md with the Moon rules and the brand identity. Nothing goes to GitHub.",
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form
            id={formId}
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground">{t("Name")}</span>
              <Input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("e.g. Stock dashboard")}
                disabled={step !== null}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground">{t("What is it for?")}</span>
              <Textarea
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder={t("One or two sentences. They open the README and the CLAUDE.md.")}
                disabled={step !== null}
              />
            </label>
            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-xs font-medium text-foreground">{t("Brand")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {NEW_PROJECT_BRANDS.map((info) => (
                  <button
                    key={info.id}
                    type="button"
                    aria-pressed={brand === info.id}
                    disabled={step !== null}
                    onClick={() => setBrand(info.id)}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors disabled:cursor-default",
                      brand === info.id
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-accent/50",
                    )}
                  >
                    <span className="flex items-center justify-between text-sm font-medium text-foreground">
                      {info.label}
                      {brand === info.id ? <CheckIcon className="size-3.5 text-primary" /> : null}
                    </span>
                    <span className="flex gap-1">
                      {info.swatches.map((color) => (
                        <span
                          key={color}
                          className="size-4 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">{t("Owner")}</span>
                <Input
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  placeholder={t("Your name")}
                  disabled={step !== null}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">{t("Create in")}</span>
                <Input
                  value={baseDirectory}
                  onChange={(event) => setBaseDirectory(event.target.value)}
                  spellCheck={false}
                  disabled={step !== null}
                />
              </label>
            </div>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {slug === "" ? t("The folder name comes from the project name.") : `${base}${slug}`}
            </p>
            {error ? <p className="text-xs text-destructive-foreground">{error}</p> : null}
          </form>
        </DialogPanel>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={step !== null}>
            {t("Cancel")}
          </Button>
          <Button type="submit" form={formId} size="sm" disabled={!ready}>
            {step ?? t("Create project")}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
