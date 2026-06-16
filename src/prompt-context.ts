import type { CodexStudioSession } from "./codex-session.js";
import type { ContextManifestEntry } from "./context-manifest.js";
import type { StudioProjectState } from "./projects.js";

function formatEntries(entries: ContextManifestEntry[]): string[] {
  const selected = entries.filter((entry) => entry.status === "selected");
  if (!selected.length) return ["- None"];
  return selected.map((entry) => `- ${entry.sourcePath} (${entry.required ? "required" : "optional"}; ${entry.reason})`);
}

function formatOmissions(entries: ContextManifestEntry[]): string[] {
  const omitted = entries.filter((entry) => entry.status !== "selected");
  if (!omitted.length) return ["- None"];
  return omitted.map((entry) => `- ${entry.sourcePath}: ${entry.status} (${entry.statusReason})`);
}

export function renderContextContract(args: {
  session: CodexStudioSession;
  projectStage: StudioProjectState["mode"];
  studioMode: StudioProjectState["studioMode"];
  entries: ContextManifestEntry[];
  blockers?: string[];
  readOnlyReview?: boolean;
}): string {
  const blockers = args.blockers?.length ? args.blockers.slice(0, 8) : [];
  return [
    "# Context Contract",
    "",
    `Project Stage: ${args.projectStage}`,
    `Studio Mode: ${args.studioMode}`,
    `Phase: ${args.session.phase}`,
    `Write Policy: ${args.session.writePolicy ?? "read-only"}`,
    `Sandbox: ${args.session.sandbox}`,
    `File Edits: ${args.session.allowFileEdits ? "allowed" : "not allowed"}`,
    "",
    "Selected Context:",
    ...formatEntries(args.entries),
    "",
    "Omissions and Blockers:",
    ...formatOmissions(args.entries),
    ...(args.readOnlyReview ? ["", "Read-only review: inspect diff and verification output; do not edit files."] : []),
    ...(blockers.length ? ["", "Bounded Blockers:", ...blockers.map((blocker) => `- ${blocker}`)] : [])
  ].join("\n");
}
