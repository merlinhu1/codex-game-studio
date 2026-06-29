import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { stableHash } from "./generated-surfaces.js";
import { sourceRoot, unrealProjectFileName } from "./engines.js";
import { defaultEngineReferenceContextRequests } from "./engine-reference.js";
import type { StudioProjectState } from "./projects.js";

export type ContextEntryStatus = "selected" | "missing" | "omitted" | "rejected";
export type ContextSafety = "safe" | "unsafe" | "secret" | "generated" | "binary";

export type ContextRequestEntry = {
  sourcePath: string;
  reason: string;
  required?: boolean;
};

export type ContextManifestEntry = {
  sourcePath: string;
  reason: string;
  required: boolean;
  status: ContextEntryStatus;
  statusReason: string;
  safety: ContextSafety;
  chars: number;
};

export type ContextSelectionBudget = {
  maxFiles: number;
  maxChars: number;
  maxEntryChars: number;
};

export type ContextSelectionResult = {
  entries: ContextManifestEntry[];
  selected: ContextManifestEntry[];
  budget: ContextSelectionBudget & { usedFiles: number; usedChars: number };
};

export type ContextManifest = {
  schemaVersion: 1;
  product: "codex-game-studio";
  projectStage: StudioProjectState["mode"];
  studioMode: StudioProjectState["studioMode"];
  entries: ContextManifestEntry[];
  budget: ContextSelectionResult["budget"];
};

export type ContextManifestMeta = {
  schemaVersion: 1;
  product: "codex-game-studio";
  projectStage: StudioProjectState["mode"];
  studioMode: StudioProjectState["studioMode"];
  manifestSha256: string;
  inputsSha256: string;
};

export const defaultContextBudget: ContextSelectionBudget = {
  maxFiles: 12,
  maxChars: 48_000,
  maxEntryChars: 16_000
};

const forbiddenPathPattern =
  /(^|\/)(?:\.env(?:\.[^/]*)?|\.npmrc|\.pypirc|id_(?:rsa|dsa|ecdsa|ed25519)|[^/]*(?:secret|credential|token|private[-_]?key|auth(?:entication)?)[^/]*)(\/|$)/i;
const generatedPathPattern = /(^|\/)(dist|build|coverage|node_modules|\.git|\.codex\/runs)(\/|$)/;

function normalizeSourcePath(sourcePath: string): { ok: true; normalized: string } | { ok: false; safety: ContextSafety; reason: string } {
  if (/[\u0000-\u001f\u007f]/.test(sourcePath)) return { ok: false, safety: "unsafe", reason: "path contains control characters" };
  if (path.isAbsolute(sourcePath)) return { ok: false, safety: "unsafe", reason: "absolute paths are not allowed" };
  const normalized = sourcePath.split(path.sep).join("/");
  if (normalized.split("/").includes("..")) return { ok: false, safety: "unsafe", reason: "path traversal is not allowed" };
  if (forbiddenPathPattern.test(normalized)) return { ok: false, safety: "secret", reason: "secret-like paths are not allowed" };
  if (generatedPathPattern.test(normalized)) return { ok: false, safety: "generated", reason: "generated or build output is not context" };
  return { ok: true, normalized };
}

function rejectedEntry(entry: ContextRequestEntry, safety: ContextSafety, reason: string): ContextManifestEntry {
  return {
    sourcePath: entry.sourcePath,
    reason: entry.reason,
    required: entry.required === true,
    status: "rejected",
    statusReason: reason,
    safety,
    chars: 0
  };
}

function classifyExisting(projectRoot: string, entry: ContextRequestEntry): ContextManifestEntry {
  const normalized = normalizeSourcePath(entry.sourcePath);
  if (!normalized.ok) return rejectedEntry(entry, normalized.safety, normalized.reason);

  const full = path.resolve(projectRoot, normalized.normalized);
  const realRoot = realpathSync(projectRoot);
  if (full !== realRoot && !full.startsWith(`${realRoot}${path.sep}`)) return rejectedEntry(entry, "unsafe", "path escapes project root");
  if (!existsSync(full)) {
    return {
      sourcePath: normalized.normalized,
      reason: entry.reason,
      required: entry.required === true,
      status: "missing",
      statusReason: "required context is missing",
      safety: "safe",
      chars: 0
    };
  }
  const realFull = realpathSync(full);
  if (realFull !== realRoot && !realFull.startsWith(`${realRoot}${path.sep}`)) return rejectedEntry({ ...entry, sourcePath: normalized.normalized }, "unsafe", "symlink outside project root");
  if (!statSync(realFull).isFile() || lstatSync(full).isDirectory()) return rejectedEntry({ ...entry, sourcePath: normalized.normalized }, "unsafe", "context entry is not a file");

  const sample = readFileSync(realFull);
  if (sample.includes(0)) return rejectedEntry({ ...entry, sourcePath: normalized.normalized }, "binary", "binary files are not context");
  return {
    sourcePath: normalized.normalized,
    reason: entry.reason,
    required: entry.required === true,
    status: "omitted",
    statusReason: "pending budget selection",
    safety: "safe",
    chars: sample.toString("utf8").length
  };
}

export function selectContextEntries(projectRoot: string, requested: ContextRequestEntry[], budget: Partial<ContextSelectionBudget> = {}): ContextSelectionResult {
  const limits = { ...defaultContextBudget, ...budget };
  const seen = new Set<string>();
  const classified = requested
    .filter((entry) => {
      if (seen.has(entry.sourcePath)) return false;
      seen.add(entry.sourcePath);
      return true;
    })
    .map((entry) => classifyExisting(projectRoot, entry));
  let usedFiles = 0;
  let usedChars = 0;
  const entries = classified.slice();
  const candidateIndexes = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.status === "omitted")
    .sort((left, right) => Number(right.entry.required) - Number(left.entry.required) || left.index - right.index)
    .map(({ index }) => index);
  for (const index of candidateIndexes) {
    const entry = entries[index];
    if (entry.chars > limits.maxEntryChars) {
      entries[index] = { ...entry, status: "omitted" as const, statusReason: "entry character budget exceeded" };
      continue;
    }
    if (usedFiles >= limits.maxFiles) {
      entries[index] = { ...entry, status: "omitted" as const, statusReason: "file count budget exceeded" };
      continue;
    }
    if (usedChars + entry.chars > limits.maxChars) {
      entries[index] = { ...entry, status: "omitted" as const, statusReason: "total character budget exceeded" };
      continue;
    }
    usedFiles += 1;
    usedChars += entry.chars;
    entries[index] = { ...entry, status: "selected" as const, statusReason: "selected within budget" };
  }
  return {
    entries,
    selected: entries.filter((entry) => entry.status === "selected"),
    budget: { ...limits, usedFiles, usedChars }
  };
}

export function defaultContextRequests(studio: StudioProjectState): ContextRequestEntry[] {
  const engineRoot = sourceRoot("", studio.slug).replace(/^\//, "");
  const engineFile =
    studio.engine === "godot"
      ? path.posix.join(engineRoot, "project.godot")
      : studio.engine === "unity"
        ? path.posix.join(engineRoot, "Packages", "manifest.json")
        : path.posix.join(engineRoot, unrealProjectFileName(studio.name));
  return [
    { sourcePath: "AGENTS.md", reason: "project instructions", required: true },
    { sourcePath: ".codex/studio.json", reason: "project state", required: true },
    { sourcePath: "design/gdd.md", reason: "design reference", required: true },
    { sourcePath: "production/timeline.md", reason: "production reference" },
    { sourcePath: "docs/market-overview.md", reason: "market reference" },
    { sourcePath: engineFile, reason: `${studio.engine} engine reference`, required: true },
    ...defaultEngineReferenceContextRequests(studio)
  ];
}

export function contextManifestInput(studio: StudioProjectState): unknown {
  return {
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    engine: studio.engine,
    engineVersion: studio.engineVersion,
    slug: studio.slug,
    requests: defaultContextRequests(studio)
  };
}

export function createContextManifest(projectRoot: string, studio: StudioProjectState): { manifest: ContextManifest; meta: ContextManifestMeta } {
  const selection = selectContextEntries(projectRoot, defaultContextRequests(studio));
  const manifest: ContextManifest = {
    schemaVersion: 1,
    product: "codex-game-studio",
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    entries: selection.entries,
    budget: selection.budget
  };
  const manifestSha256 = createHash("sha256").update(`${JSON.stringify(manifest, null, 2)}\n`).digest("hex");
  const meta: ContextManifestMeta = {
    schemaVersion: 1,
    product: "codex-game-studio",
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    manifestSha256,
    inputsSha256: stableHash(contextManifestInput(studio))
  };
  return { manifest, meta };
}

export function writeContextManifest(projectRoot: string, studio: StudioProjectState): void {
  const { manifest, meta } = createContextManifest(projectRoot, studio);
  writeFileSync(path.join(projectRoot, ".codex", "context-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(projectRoot, ".codex", "context-manifest.meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
}
