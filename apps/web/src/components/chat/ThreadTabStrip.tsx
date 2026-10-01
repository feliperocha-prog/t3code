import {
  parseScopedThreadKey,
  scopedThreadKey,
  scopeProjectRef,
} from "@t3tools/client-runtime/environment";
import type { ScopedThreadRef } from "@t3tools/contracts";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtomValue } from "@effect/atom-react";
import { useRouter } from "@tanstack/react-router";
import { TriangleAlertIcon, XIcon } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { isCommandPaletteOpen } from "~/commandPaletteBus";
import { t, tc } from "~/i18n";
import { resolveShortcutCommand } from "~/keybindings";
import { isTerminalFocused } from "~/lib/terminalFocus";
import { cn } from "~/lib/utils";
import { isModelPickerOpen } from "~/modelPickerVisibility";
import { readThreadShell, useProject, useThreadShell, useThreadShells } from "~/state/entities";
import { primaryServerKeybindingsAtom } from "~/state/server";
import { buildThreadRouteParams } from "~/threadRoutes";
import {
  hasSameFolderTabConflict,
  resolveAdjacentTabKey,
  resolveTabKeyAfterClose,
  useThreadTabsStore,
} from "~/threadTabsStore";
import { useUiStateStore } from "~/uiStateStore";
import {
  resolveSidebarThreadStatus,
  resolveThreadStatusPill,
  threadStatusLabelText,
} from "../Sidebar.logic";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

/** Tabs whose thread shell is loaded; the rest stay stored but hidden. */
function readVisibleTabs(): ScopedThreadRef[] {
  return useThreadTabsStore.getState().tabs.filter((tab) => readThreadShell(tab) !== null);
}

/** Moves focus between tabs with the arrow, Home and End keys (WAI-ARIA tabs pattern). */
function onTabListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabElements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
  const current = tabElements.findIndex((element) => element === document.activeElement);
  if (current === -1 || tabElements.length === 0) return;
  event.preventDefault();
  const last = tabElements.length - 1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : event.key === "ArrowRight"
          ? (current + 1) % tabElements.length
          : (current - 1 + tabElements.length) % tabElements.length;
  tabElements[next]?.focus();
}

/**
 * Strip of open conversations under the chat header. The active server
 * thread is registered automatically, so every way of opening a thread
 * (sidebar, palette, notifications) produces a tab without extra wiring.
 */
export function ThreadTabStrip({ activeThreadRef }: { activeThreadRef: ScopedThreadRef | null }) {
  const router = useRouter();
  const storedTabs = useThreadTabsStore((state) => state.tabs);
  const shells = useThreadShells();
  const ensureTab = useThreadTabsStore((state) => state.ensureTab);
  const closeTab = useThreadTabsStore((state) => state.closeTab);
  const moveTab = useThreadTabsStore((state) => state.moveTab);
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);
  const activeKey = activeThreadRef ? scopedThreadKey(activeThreadRef) : null;

  // Keyed on the active thread only: depending on `tabs` would re-add the
  // active tab the moment the user closes it, before navigation lands.
  useEffect(() => {
    const ref = activeKey === null ? null : parseScopedThreadKey(activeKey);
    if (ref) ensureTab(ref);
  }, [activeKey, ensureTab]);

  const navigateToTab = useCallback(
    (ref: ScopedThreadRef) =>
      void router.navigate({
        to: "/$environmentId/$threadId",
        params: buildThreadRouteParams(ref),
      }),
    [router],
  );

  const closeTabAndNavigate = useCallback(
    (ref: ScopedThreadRef) => {
      const closingKey = scopedThreadKey(ref);
      if (closingKey !== activeKey) {
        closeTab(ref);
        return;
      }
      const visibleTabs = readVisibleTabs();
      const nextKey = resolveTabKeyAfterClose(visibleTabs.map(scopedThreadKey), closingKey);
      const nextTab = visibleTabs.find((tab) => scopedThreadKey(tab) === nextKey);
      closeTab(ref);
      if (nextTab) {
        navigateToTab(nextTab);
      } else {
        void router.navigate({ to: "/" });
      }
    },
    [activeKey, closeTab, navigateToTab, router],
  );

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || isCommandPaletteOpen() || isModelPickerOpen())
        return;
      const command = resolveShortcutCommand(event, keybindings, {
        platform: navigator.platform,
        context: {
          terminalFocus: isTerminalFocused(),
          modelPickerOpen: isModelPickerOpen(),
        },
      });
      if (command !== "tabs.next" && command !== "tabs.previous") return;
      const visibleTabs = readVisibleTabs();
      const targetKey = resolveAdjacentTabKey(
        visibleTabs.map(scopedThreadKey),
        activeKey,
        command === "tabs.next" ? "next" : "previous",
      );
      const target = visibleTabs.find((tab) => scopedThreadKey(tab) === targetKey);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      if (targetKey !== activeKey) navigateToTab(target);
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [activeKey, keybindings, navigateToTab]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  // Only tabs with a loaded shell take part in rendering, sorting and the
  // same-folder check, so hidden tabs never shift drag positions.
  const { tabs, tabKeys, conflictKeys } = useMemo(() => {
    const shellByKey = new Map(
      shells.map((shell) => [
        scopedThreadKey({ environmentId: shell.environmentId, threadId: shell.id }),
        shell,
      ]),
    );
    const visible = storedTabs.flatMap((tab) => {
      const key = scopedThreadKey(tab);
      const shell = shellByKey.get(key);
      return shell ? [{ tab, key, shell }] : [];
    });
    const candidates = visible.map(({ key, shell }) => ({
      key,
      projectKey: `${shell.environmentId}\u0000${shell.projectId}`,
      worktreePath: shell.worktreePath,
      isWorking: resolveSidebarThreadStatus(shell) === "working",
    }));
    const visibleKeys = new Set(candidates.map((candidate) => candidate.key));
    const conflicts = new Set(
      candidates
        .filter((self) =>
          hasSameFolderTabConflict({
            self,
            projectThreads: candidates.filter(
              (candidate) => candidate.projectKey === self.projectKey,
            ),
            openTabKeys: visibleKeys,
          }),
        )
        .map((candidate) => candidate.key),
    );
    return {
      tabs: visible.map(({ tab }) => tab),
      tabKeys: visible.map(({ key }) => key),
      conflictKeys: conflicts,
    };
  }, [shells, storedTabs]);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      moveTab(String(active.id), String(over.id));
    },
    [moveTab],
  );

  if (tabs.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tabKeys} strategy={horizontalListSortingStrategy}>
        <div
          role="tablist"
          aria-label={t("Open tabs")}
          className="flex h-8 shrink-0 items-stretch overflow-x-auto overflow-y-hidden border-b border-border bg-muted/30 [-webkit-app-region:no-drag] [scrollbar-width:thin]"
          onKeyDown={onTabListKeyDown}
        >
          {tabs.map((tab, index) => (
            <ThreadTab
              key={tabKeys[index]}
              threadRef={tab}
              isActive={tabKeys[index] === activeKey}
              hasFolderConflict={conflictKeys.has(tabKeys[index] ?? "")}
              onSelect={navigateToTab}
              onClose={closeTabAndNavigate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

const ThreadTab = memo(function ThreadTab({
  threadRef,
  isActive,
  hasFolderConflict,
  onSelect,
  onClose,
}: {
  threadRef: ScopedThreadRef;
  isActive: boolean;
  hasFolderConflict: boolean;
  onSelect: (ref: ScopedThreadRef) => void;
  onClose: (ref: ScopedThreadRef) => void;
}) {
  const threadKey = scopedThreadKey(threadRef);
  const shell = useThreadShell(threadRef);
  const lastVisitedAt = useUiStateStore((state) => state.threadLastVisitedAtById[threadKey]);
  const shellEnvironmentId = shell?.environmentId ?? null;
  const shellProjectId = shell?.projectId ?? null;
  const projectRef = useMemo(
    () =>
      shellEnvironmentId !== null && shellProjectId !== null
        ? scopeProjectRef(shellEnvironmentId, shellProjectId)
        : null,
    [shellEnvironmentId, shellProjectId],
  );
  const project = useProject(projectRef);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: threadKey,
  });

  const handleClose = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onClose(threadRef);
    },
    [onClose, threadRef],
  );

  // The strip only renders loaded tabs; this narrows the type.
  if (!shell) return null;

  const statusPill = resolveThreadStatusPill({ thread: { ...shell, lastVisitedAt } });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/tab relative flex shrink-0 cursor-default select-none items-center gap-1.5 border-r border-border pr-1 pl-2.5 text-xs",
        isActive
          ? "bg-background text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        isDragging && "z-10 opacity-80",
      )}
      onClick={() => onSelect(threadRef)}
      onKeyDown={(event) => {
        // Keys pressed on the close button belong to the button.
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(threadRef);
        }
      }}
      onMouseDown={(event) => {
        // Middle click closes; stop the browser's autoscroll cursor.
        if (event.button === 1) event.preventDefault();
      }}
      onAuxClick={(event) => {
        if (event.button === 1) handleClose(event);
      }}
    >
      {isActive ? <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-primary" /> : null}
      {statusPill ? (
        <span
          role="img"
          aria-label={threadStatusLabelText(statusPill.label)}
          className="inline-flex size-2.5 shrink-0 items-center justify-center"
        >
          <span
            className={cn(
              "size-[7px] rounded-full",
              statusPill.dotClass,
              statusPill.pulse && "motion-safe:animate-status-pulse",
            )}
          />
        </span>
      ) : null}
      <Tooltip>
        <TooltipTrigger render={<span className="block max-w-[180px] truncate" />}>
          {shell.title}
        </TooltipTrigger>
        <TooltipPopup side="bottom">
          <span className="block">{shell.title}</span>
          {project ? <span className="block text-muted-foreground">{project.title}</span> : null}
          {shell.objective?.trim() ? (
            <span className="block max-w-80 whitespace-normal text-muted-foreground">
              {tc("thread objective", "Objective")}: {shell.objective.trim()}
            </span>
          ) : null}
        </TooltipPopup>
      </Tooltip>
      {hasFolderConflict ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                role="img"
                aria-label={t(
                  "Another open tab is changing this project in the same folder. Use a separate worktree to avoid conflicts.",
                )}
                className="inline-flex shrink-0 text-warning"
              />
            }
          >
            <TriangleAlertIcon className="size-3" />
          </TooltipTrigger>
          <TooltipPopup side="bottom">
            {t(
              "Another open tab is changing this project in the same folder. Use a separate worktree to avoid conflicts.",
            )}
          </TooltipPopup>
        </Tooltip>
      ) : null}
      <button
        type="button"
        aria-label={t("Close tab")}
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-sm hover:bg-accent",
          isActive
            ? "opacity-100"
            : "opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100",
        )}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={handleClose}
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );
});
