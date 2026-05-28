import { rolePackages } from "./roles.js";
import type { CodexStudioSession } from "./codex-session.js";
import { loadEngineConfigs } from "./engines.js";
import { packageAssetPath } from "./paths.js";

function formatList(values: string[]): string {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "- None";
}

export function renderCodexPrompt(session: CodexStudioSession): string {
  const role = rolePackages[session.role];
  const verification = session.verification ? `${session.verification.command} ${session.verification.args.join(" ")}`.trim() : "No verification command provided.";
  const engine = session.engine ? loadEngineConfigs(packageAssetPath("engine_configs"))[session.engine] : undefined;
  const engineSection = engine
    ? [
        `Display Name: ${engine.display_name}`,
        "Project Files:",
        formatList(engine.project_files),
        `Run Command: ${engine.run_command}`,
        `Test Command: ${engine.test_command}`,
        "Codex Hints:",
        formatList(engine.codex_hints)
      ].join("\n")
    : session.engine
      ? `Warning: engine config for ${session.engine} was not found.`
      : "Engine: unspecified";
  return [
    "# Codex Game Studio Session",
    "",
    `Role: ${role.displayName}`,
    `Role ID: ${role.id}`,
    `Phase: ${session.phase}`,
    `Project Root: ${session.projectRoot}`,
    `Objective: ${session.objective}`,
    session.engine ? `Engine: ${session.engine}` : "Engine: unspecified",
    `Sandbox: ${session.sandbox}`,
    `File Edits: ${session.allowFileEdits ? "allowed" : "not allowed"}`,
    "",
    "## Role Contract",
    role.systemPrompt,
    "",
    "## Engine Context",
    engineSection,
    "",
    "## Context Files",
    formatList(session.contextFiles),
    "",
    "## Expected Outputs",
    formatList(session.expectedOutputs),
    "",
    "## Verification",
    verification,
    "",
    "## Review Checklist",
    formatList(role.reviewChecklist),
    "",
    "## Completion Report",
    "Report changed files, verification results, decisions made, and remaining risks."
  ].join("\n");
}
