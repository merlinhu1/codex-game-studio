import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { customizationConfigPath, readProjectCustomization } from "../src/customization.js";
import { initProject, statusProject } from "../src/projects.js";
import { prepareRun } from "../src/runner.js";
import { formatTemplateShow, listTemplates } from "../src/templates.js";
import { validateProject } from "../src/validation.js";
import { renderWorkflowPrompt } from "../src/workflows.js";

function writeValidCustomPack(projectRoot: string): void {
  mkdirSync(path.join(projectRoot, ".codex", "custom", "roles"), { recursive: true });
  mkdirSync(path.join(projectRoot, ".codex", "workflows"), { recursive: true });
  mkdirSync(path.join(projectRoot, "documentation", "templates"), { recursive: true });
  writeFileSync(path.join(projectRoot, ".codex", "custom", "roles", "boss-designer.md"), "# Boss Designer Prompt\n\nDesign readable boss fights with phases, tells, counters, accessibility notes, and verification gates.\n");
  writeFileSync(path.join(projectRoot, ".codex", "workflows", "custom-boss-review.md"), "# Boss Review Workflow\n\nUse phase readability, counterplay, accessibility, and test evidence to review the encounter.\n");
  writeFileSync(path.join(projectRoot, "documentation", "templates", "boss-brief.md"), "# Purpose\n\nCapture a boss encounter brief.\n\n# Inputs\n\nProject fantasy and combat constraints.\n\n# Outputs\n\nPhases, tells, counters, risks, and tests.\n\n# Validation\n\nPlaytest the encounter for readability.\n");
  writeFileSync(
    customizationConfigPath(projectRoot),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        policy: { merge: "extend-only" },
        roles: [
          {
            id: "custom-boss-designer",
            displayName: "Boss Designer",
            promptFile: ".codex/custom/roles/boss-designer.md",
            contextStrategy: "focused",
            phase: "plan",
            expectedOutputs: ["Boss encounter brief", "Readability risks", "Playtest checks"],
            reviewChecklist: ["Boss phases are readable", "Counterplay is explicit", "Verification is concrete"]
          }
        ],
        templates: [
          {
            id: "custom-boss-brief",
            category: "design",
            path: "documentation/templates/boss-brief.md",
            description: "Project-local boss encounter brief template.",
            roles: ["custom-boss-designer"],
            workflows: ["custom-boss-review"],
            tags: ["boss", "encounter", "custom"],
            requiredSections: ["# Purpose", "# Inputs", "# Outputs", "# Validation"]
          }
        ],
        workflows: [
          {
            id: "custom-boss-review",
            role: "custom-boss-designer",
            phase: "plan",
            objective: "Draft or review a boss encounter for readable phases, counterplay, accessibility, and test evidence.",
            file: ".codex/workflows/custom-boss-review.md",
            contextFiles: ["AGENTS.md", ".codex/studio.json", ".codex/custom/roles/boss-designer.md"],
            templateIds: ["custom-boss-brief"],
            aliases: ["boss-review"]
          }
        ]
      },
      null,
      2
    )}\n`
  );
}

describe("project-local customization packs", () => {
  test("init seeds a reviewable customization config and status summarizes it", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-custom-init-"));
    const { projectRoot } = initProject({ name: "Custom Seed", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(existsSync(customizationConfigPath(projectRoot))).toBe(true);
    expect(readProjectCustomization(projectRoot)).toMatchObject({ schemaVersion: 1, roles: [], workflows: [], templates: [], policy: { merge: "extend-only" } });
    expect(statusProject(projectRoot, cwd)).toContain("custom roles: 0, workflows: 0, templates: 0");
    expect(validateProject(projectRoot)).toContainEqual(expect.objectContaining({ id: "codex.customization.config", status: "pass" }));
  });

  test("valid local role workflow and template packs merge with built-ins without loading broad context", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-custom-valid-"));
    const { projectRoot } = initProject({ name: "Boss Game", engine: "godot", mode: "development", nonInteractive: true }, cwd);
    writeValidCustomPack(projectRoot);
    const checks = validateProject(projectRoot);
    expect(checks).toContainEqual(expect.objectContaining({ id: "codex.customization.role.custom-boss-designer", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "codex.customization.workflow.custom-boss-review", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "codex.customization.template.custom-boss-brief", status: "pass" }));
    expect(checks.filter((check) => check.id.startsWith("codex.customization") && check.status === "fail")).toEqual([]);
    expect(listTemplates(projectRoot).map((template) => template.id)).toContain("custom-boss-brief");
    expect(formatTemplateShow("custom-boss-brief", { projectRoot })).toContain("Project-local boss encounter brief template");
    const workflowPrompt = renderWorkflowPrompt(projectRoot, "custom-boss-review");
    expect(workflowPrompt).toContain("Boss Designer");
    expect(workflowPrompt).toContain("Draft or review a boss encounter");
    expect(workflowPrompt).toContain("Boss Review Workflow");
    expect(workflowPrompt).toContain("Use phase readability, counterplay, accessibility, and test evidence");
    expect(workflowPrompt).toContain("Template: custom-boss-brief");
    expect(workflowPrompt).not.toContain("Template: market_analysis");
    const run = prepareRun("custom-boss-designer", { project: projectRoot, task: "Draft a boss fight brief with phase readability", printPrompt: true }, cwd);
    expect(run.output).toContain("Role: Boss Designer");
    expect(run.output).toContain("Role ID: custom-boss-designer");
    expect(run.output).toContain("Boss Designer Prompt");
    expect(run.output).toContain("Template: custom-boss-brief");
  });

  test("customization validation rejects a custom workflow with a missing file", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-custom-missing-workflow-"));
    const { projectRoot } = initProject({ name: "Missing Workflow", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeValidCustomPack(projectRoot);
    const workflowFile = path.join(projectRoot, ".codex", "workflows", "custom-boss-review.md");
    expect(existsSync(workflowFile)).toBe(true);
    unlinkSync(workflowFile);

    const workflowCheck = validateProject(projectRoot).find((check) => check.id === "codex.customization.workflow.custom-boss-review");
    expect(workflowCheck).toMatchObject({ status: "fail" });
    expect(workflowCheck?.message).toContain("workflow file missing: .codex/workflows/custom-boss-review.md");
  });

  test("customization validation rejects unsafe paths and built-in id conflicts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-custom-invalid-"));
    const { projectRoot } = initProject({ name: "Invalid Custom", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      customizationConfigPath(projectRoot),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          policy: { merge: "extend-only" },
          roles: [{ id: "producer", displayName: "Producer Override", promptFile: ".codex/custom/roles/producer.md", contextStrategy: "focused", phase: "plan", expectedOutputs: ["Override"], reviewChecklist: ["Override"] }],
          templates: [{ id: "custom-escape-template", category: "design", path: "../escape.md", description: "Unsafe template path.", roles: ["producer"], workflows: ["vertical-slice"], tags: ["unsafe"], requiredSections: ["# Purpose"] }],
          workflows: []
        },
        null,
        2
      )}\n`
    );
    const failures = validateProject(projectRoot).filter((check) => check.id.startsWith("codex.customization") && check.status === "fail");
    expect(failures.map((failure) => failure.id)).toEqual(expect.arrayContaining(["codex.customization.role.producer", "codex.customization.template.custom-escape-template"]));
    expect(failures.map((failure) => failure.message).join("\n")).toMatch(/built-in|escape|project root/i);
  });

  test("CLI templates and workflow commands can inspect project-local packs", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-custom-cli-"));
    const { projectRoot } = initProject({ name: "CLI Custom", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeValidCustomPack(projectRoot);
    const cli = path.join(process.cwd(), "src", "cli.ts");
    const tsx = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    const templates = execFileSync(tsx, [cli, "templates", "list", "--project", projectRoot], { cwd, encoding: "utf8" });
    expect(templates).toContain("custom-boss-brief");
    const workflow = execFileSync(tsx, [cli, "workflow", "custom-boss-review", "--project", projectRoot, "--dry-run"], { cwd, encoding: "utf8" });
    expect(workflow).toContain("Boss Designer");
    expect(workflow).toContain("Template: custom-boss-brief");
  });
});
