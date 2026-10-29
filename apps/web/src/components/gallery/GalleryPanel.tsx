import type { AssetResource, EnvironmentId, ScopedThreadRef } from "@t3tools/contracts";
import { ExternalLinkIcon, FileCodeIcon, ImageOffIcon, ImagesIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { useAssetUrls } from "~/assets/assetUrls";
import { openFileInPreview } from "~/browser/openFileInPreview";
import { t } from "~/i18n";
import { cn } from "~/lib/utils";
import { isPreviewSupportedInRuntime } from "~/previewStateStore";
import { assetEnvironment } from "~/state/assets";
import { previewEnvironment } from "~/state/preview";
import { usePreparedConnection } from "~/state/session";
import { useAtomCommand } from "~/state/use-atom-command";
import { useAtomQueryRunner } from "~/state/use-atom-query-runner";
import type { ChatMessage, TurnDiffSummary } from "~/types";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { collectGalleryItems, type GalleryItem, type GalleryItemKind } from "./galleryItems";

// Thumbnails and page previews cost a request each; older items stay listed.
const MAX_ITEMS = 60;
// Page previews render at 4x size and scale down, so the layout reads like a screenshot.
const PAGE_PREVIEW_SCALE = 0.25;

type Filter = "all" | GalleryItemKind;

const fileName = (path: string) =>
  path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
const folderName = (path: string) => {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return cut > 0 ? path.slice(0, cut) : "";
};

/**
 * Every image and HTML page the thread produced or pointed at, so a print or a
 * generated page is one click away instead of buried in the transcript.
 */
export function GalleryPanel({
  threadRef,
  workspaceRoot,
  messages,
  checkpoints,
}: {
  threadRef: ScopedThreadRef;
  workspaceRoot: string | undefined;
  messages: ReadonlyArray<ChatMessage>;
  checkpoints: ReadonlyArray<TurnDiffSummary>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const allItems = useMemo(
    () => collectGalleryItems({ workspaceRoot, messages, checkpoints }).slice(0, MAX_ITEMS),
    [workspaceRoot, messages, checkpoints],
  );
  const items = filter === "all" ? allItems : allItems.filter((item) => item.kind === filter);
  // Streaming answers rebuild the item list on every token; key the URL
  // requests on the paths so they only change when a new file shows up.
  const pathsKey = items.map((item) => item.path).join("\n");
  const resources = useMemo<ReadonlyArray<AssetResource>>(
    () =>
      pathsKey.length === 0
        ? []
        : pathsKey
            .split("\n")
            .map((path) => ({ _tag: "media-file", threadId: threadRef.threadId, path })),
    [pathsKey, threadRef.threadId],
  );
  const urls = useAssetUrls(threadRef.environmentId, resources);
  const imageCount = allItems.filter((item) => item.kind === "image").length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          {t("All")} · {allItems.length}
        </FilterButton>
        <FilterButton active={filter === "image"} onClick={() => setFilter("image")}>
          {t("Images")} · {imageCount}
        </FilterButton>
        <FilterButton active={filter === "page"} onClick={() => setFilter("page")}>
          {t("Pages")} · {allItems.length - imageCount}
        </FilterButton>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <ImagesIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {t("No images or pages in this conversation yet")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "When the agent creates or mentions a .png, .jpg, .svg or .html file, it shows up here.",
            )}
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="grid grid-cols-2 gap-3 p-3">
            {items.map((item, index) => (
              <GalleryCard
                key={item.path}
                item={item}
                url={urls[index] ?? null}
                threadRef={threadRef}
                workspaceRoot={workspaceRoot}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "secondary" : "ghost-muted"}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function GalleryCard({
  item,
  url,
  threadRef,
  workspaceRoot,
}: {
  item: GalleryItem;
  url: string | null;
  threadRef: ScopedThreadRef;
  workspaceRoot: string | undefined;
}) {
  const [broken, setBroken] = useState(false);
  const preparedConnection = usePreparedConnection(threadRef.environmentId);
  const createAssetUrl = useAtomQueryRunner(assetEnvironment.createUrl, {
    reportFailure: false,
    refresh: true,
  });
  const openPreview = useAtomCommand(previewEnvironment.open, { reportFailure: false });

  const openInNewWindow = () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  const open = async () => {
    if (!isPreviewSupportedInRuntime() || preparedConnection._tag === "None") {
      openInNewWindow();
      return;
    }
    const result = await openFileInPreview({
      threadRef,
      filePath: item.path,
      workspaceRoot,
      httpBaseUrl: preparedConnection.value.httpBaseUrl,
      createAssetUrl,
      openPreview,
    });
    if (result._tag === "Failure") {
      toastManager.add({
        type: "error",
        title: t("Could not open the file"),
        description: item.path,
      });
    }
  };

  return (
    <div className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        className="relative aspect-video w-full overflow-hidden bg-muted text-left"
        aria-label={`${t("Open")} ${fileName(item.path)}`}
        onClick={() => void open()}
      >
        {url === null || broken ? (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            {broken ? <ImageOffIcon className="size-5" /> : null}
            {broken ? <span className="text-xs">{t("File not found")}</span> : null}
          </span>
        ) : item.kind === "image" ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            className="size-full object-contain"
            onError={() => setBroken(true)}
          />
        ) : (
          <>
            <iframe
              src={url}
              title={fileName(item.path)}
              loading="lazy"
              // No scripts and an opaque origin: a generated page can draw, never act.
              sandbox=""
              tabIndex={-1}
              className="pointer-events-none origin-top-left border-0 bg-white"
              style={{
                width: `${100 / PAGE_PREVIEW_SCALE}%`,
                height: `${100 / PAGE_PREVIEW_SCALE}%`,
                transform: `scale(${PAGE_PREVIEW_SCALE})`,
              }}
            />
            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-xs font-medium text-foreground">
              <FileCodeIcon className="size-3" />
              HTML
            </span>
          </>
        )}
      </button>
      <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{fileName(item.path)}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span
              className={cn(
                "mr-1 font-medium",
                item.source === "changed" ? "text-success-foreground" : "",
              )}
            >
              {item.source === "changed" ? t("Changed") : t("Mentioned")}
            </span>
            {folderName(item.path)}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon-xs"
                variant="ghost-muted"
                aria-label={t("Open in a new window")}
                disabled={url === null}
                onClick={openInNewWindow}
              />
            }
          >
            <ExternalLinkIcon />
          </TooltipTrigger>
          <TooltipPopup>{t("Open in a new window")}</TooltipPopup>
        </Tooltip>
      </div>
    </div>
  );
}
