export type GalleryItemKind = "image" | "page";

export interface GalleryItem {
  /** As the thread wrote it: workspace-relative or an absolute host path. */
  readonly path: string;
  readonly kind: GalleryItemKind;
  /** "changed" when a turn's checkpoint touched it, "mentioned" when only an answer named it. */
  readonly source: "changed" | "mentioned";
  readonly at: string;
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"]);
const PAGE_EXTENSIONS = new Set(["html", "htm"]);
const EXTENSION_PATTERN = "png|jpe?g|gif|webp|svg|avif|bmp|html?";

// Markdown link or image targets: `](path)` and `](<path with spaces>)`.
const MARKDOWN_TARGET = /\]\(\s*<?([^)>\n]+?)>?(?:\s+"[^"]*")?\s*\)/g;
// Inline code spans, which is how answers usually name a file.
const CODE_SPAN = /`([^`\n]+)`/g;
// Web links, so `https://x.com/a.png` is not read as the path `/a.png`.
const WEB_URL = /\b(?!file:)[a-z][a-z\d+.-]*:\/\/\S+/gi;
// A bare path token: no spaces, ends in a gallery extension.
const BARE_PATH = new RegExp(
  String.raw`(?:file:\/\/\/)?(?:[A-Za-z]:[\\/]|~[\\/]|\.{1,2}[\\/]|[\\/])?[\w@.\-+%]+(?:[\\/][\w@.\-+%]+)*\.(?:${EXTENSION_PATTERN})\b`,
  "gi",
);

export function galleryKindForPath(path: string): GalleryItemKind | null {
  const clean = path.split(/[?#]/, 1)[0] ?? "";
  const extension = clean.slice(clean.lastIndexOf(".") + 1).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (PAGE_EXTENSIONS.has(extension)) return "page";
  return null;
}

/** Strip `file:///`, percent-encoding and line suffixes; drop web URLs. */
function normalizeCandidate(raw: string): string | null {
  let candidate = raw.trim().replace(/^["']|["']$/g, "");
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(candidate) && !/^file:\/\//i.test(candidate)) return null;
  candidate = candidate.replace(/^file:\/\/\/?/i, "");
  candidate = candidate.replace(/:\d+(?::\d+)?$/, "");
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    // Keep the raw text when it is not valid percent-encoding.
  }
  // `/C:/x.png` from a file URL is a Windows path.
  if (/^\/[A-Za-z]:[\\/]/.test(candidate)) candidate = candidate.slice(1);
  if (candidate.length === 0 || candidate.length > 1024) return null;
  return galleryKindForPath(candidate) ? candidate : null;
}

export function galleryPathsInText(text: string): string[] {
  const found: string[] = [];
  const push = (raw: string | undefined) => {
    const path = raw ? normalizeCandidate(raw) : null;
    if (path) found.push(path);
  };
  for (const match of text.matchAll(MARKDOWN_TARGET)) push(match[1]);
  for (const match of text.matchAll(CODE_SPAN)) push(match[1]);
  // Bare paths only in the remaining prose, so a quoted path with spaces is
  // not also picked up as its last few segments.
  const prose = text
    .replaceAll(MARKDOWN_TARGET, " ")
    .replaceAll(CODE_SPAN, " ")
    .replaceAll(WEB_URL, " ");
  for (const match of prose.matchAll(BARE_PATH)) push(match[0]);
  return found;
}

const normalizePath = (path: string) =>
  path
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/^[A-Z]:/, (drive) => drive.toLowerCase());

/** Same key for `C:\repo\a.png` and the checkpoint's `a.png` when the repo is the workspace. */
function dedupeKey(path: string, workspaceRoot: string | undefined): string {
  const normalized = normalizePath(path);
  if (!workspaceRoot) return normalized;
  const root = normalizePath(workspaceRoot).replace(/\/+$/, "") + "/";
  return normalized.toLowerCase().startsWith(root.toLowerCase())
    ? normalized.slice(root.length)
    : normalized;
}

// A streaming answer replaces only its own message object, so the finished
// ones keep their scan instead of rerunning the regexes on every token.
const pathsByMessage = new WeakMap<object, ReadonlyArray<string>>();

function pathsInMessage(message: { readonly text: string }): ReadonlyArray<string> {
  const cached = pathsByMessage.get(message);
  if (cached) return cached;
  const paths = [...galleryPathsInText(message.text)];
  pathsByMessage.set(message, paths);
  return paths;
}

/**
 * Every image and HTML page a thread produced or pointed at, newest first.
 * Files a turn changed win over mere mentions of the same path.
 */
export function collectGalleryItems(input: {
  readonly workspaceRoot?: string | undefined;
  readonly messages: ReadonlyArray<{
    readonly role: string;
    readonly text: string;
    readonly createdAt: string;
  }>;
  readonly checkpoints: ReadonlyArray<{
    readonly completedAt: string;
    readonly files: ReadonlyArray<{ readonly path: string; readonly kind: string }>;
  }>;
}): GalleryItem[] {
  const candidates: GalleryItem[] = [];
  for (const checkpoint of input.checkpoints) {
    for (const file of checkpoint.files) {
      const kind = galleryKindForPath(file.path);
      if (kind === null || file.kind === "deleted") continue;
      candidates.push({ path: file.path, kind, source: "changed", at: checkpoint.completedAt });
    }
  }
  for (const message of input.messages) {
    if (message.role !== "assistant") continue;
    for (const path of pathsInMessage(message)) {
      const kind = galleryKindForPath(path);
      if (kind) candidates.push({ path, kind, source: "mentioned", at: message.createdAt });
    }
  }
  candidates.sort((left, right) =>
    left.at === right.at
      ? left.source === right.source
        ? 0
        : left.source === "changed"
          ? -1
          : 1
      : left.at < right.at
        ? 1
        : -1,
  );
  const byKey = new Map<string, GalleryItem>();
  for (const candidate of candidates) {
    const key = dedupeKey(candidate.path, input.workspaceRoot);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, candidate);
    } else if (existing.source === "mentioned" && candidate.source === "changed") {
      byKey.set(key, { ...existing, source: "changed" });
    }
  }
  return [...byKey.values()];
}
