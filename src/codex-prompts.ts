import { renderRoleContractSections, rolePackages } from "./roles.js";
import type { CodexStudioSession } from "./codex-session.js";
import { loadEngineConfigs } from "./engines.js";
import { packageAssetPath } from "./paths.js";

function formatList(values: string[]): string {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "- None";
}

function compactContextFirst(roleId: string): string {
  return [
    "## Compact Context First",
    "Before broad file reads, use deterministic context helpers when available:",
    `- npm run ctx:role -- ${roleId}`,
    "- npm run ctx:changed",
    "- npm run ctx:task -- \"<task summary>\"",
    "Then inspect only the files surfaced by the helper or required by the task."
  ].join("\n");
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
    `Context Strategy: ${role.contextStrategy}`,
    `Phase: ${session.phase}`,
    `Project Root: ${session.projectRoot}`,
    `Objective: ${session.objective}`,
    session.engine ? `Engine: ${session.engine}` : "Engine: unspecified",
    `Sandbox: ${session.sandbox}`,
    session.writePolicy ? `Write Policy: ${session.writePolicy}` : undefined,
    `File Edits: ${session.allowFileEdits ? "allowed" : "not allowed"}`,
    "",
    compactContextFirst(session.role),
    "",
    session.contextContract,
    session.contextContract ? "" : undefined,
    "## Role Contract",
    role.systemPrompt,
    "",
    renderRoleContractSections(role),
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
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}
