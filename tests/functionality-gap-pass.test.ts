import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { activeAgentsForMode, activeAgentsForProject } from "../src/config.js";
import { initProject, statusProject } from "../src/projects.js";
import { projectRoleIdsForEngine, rolePackages, studioRoleIds } from "../src/roles.js";
import { readTemplate, templateRegistry } from "../src/templates.js";
import { validateProject } from "../src/validation.js";
import { renderWorkflowPrompt, workflowRegistry } from "../src/workflows.js";

const requiredRoles = [
  "studio-orchestrator",
  "producer",
  "market-analyst",
  "data-scientist",
  "creative-director",
  "senior-game-designer",
  "game-designer",
  "narrative-designer",
  "game-feel-designer",
  "gameplay-programmer",
  "engine-programmer",
  "godot-specialist",
  "unity-specialist",
  "unreal-specialist",
  "tools-programmer",
  "senior-game-artist",
  "technical-artist",
  "ui-ux-designer",
  "qa-playtester",
  "release-manager"
] as const;

describe("functionality gap pass", () => {
  it("exposes Codex-native roles for the full studio function set", () => {
    expect(studioRoleIds).toEqual(requiredRoles);
    for (const role of requiredRoles) {
      expect(rolePackages[role].systemPrompt.length).toBeGreaterThan(80);
      expect(rolePackages[role].expectedOutputs.length).toBeGreaterThanOrEqual(2);
      expect(rolePackages[role].reviewChecklist.length).toBeGreaterThanOrEqual(2);
    }
    expect(studioRoleIds).not.toContain("producer_agent");
    expect(studioRoleIds).not.toContain("qa_agent");
    expect(studioRoleIds).not.toContain("master_orchestrator");
  });

  it("selects market, analytics, orchestration, and mode-specific roles", () => {
    for (const mode of ["design", "prototype", "development"] as const) {
      expect(activeAgentsForMode(mode)).toEqual(
        expect.arrayContaining(["studio-orchestrator", "producer", "market-analyst", "data-scientist"])
      );
    }

    expect(activeAgentsForMode("design")).toEqual(
      expect.arrayContaining(["creative-director", "senior-game-designer", "game-designer", "narrative-designer", "senior-game-artist", "ui-ux-designer"])
    );
    expect(activeAgentsForMode("prototype")).toEqual(
      expect.arrayContaining(["senior-game-designer", "game-feel-designer", "gameplay-programmer", "qa-playtester"])
    );
    expect(activeAgentsForMode("development")).toEqual(
      expect.arrayContaining(["game-feel-designer", "engine-programmer", "tools-programmer", "technical-artist", "ui-ux-designer", "release-manager"])
    );
  });

  it("materializes project-specific prompts, activeRoles, and registry workflows", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-gap-"));
    const { projectRoot } = initProject(
      { name: "Test Studio Game", engine: "godot", mode: "prototype", competitors: ["Mini Metro"], nonInteractive: true },
      cwd
    );

    const studio = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "studio.json"), "utf8"));
    expect(studio.roles).toEqual(projectRoleIdsForEngine("godot"));
    expect(studio.activeRoles).toEqual(activeAgentsForProject("prototype", "godot"));
    expect(studio.workflows).toEqual(Object.keys(workflowRegistry));
    expect(statusProject(projectRoot, cwd)).toContain(`active roles: ${activeAgentsForProject("prototype", "godot").join(", ")}`);

    const promptBody = readFileSync(path.join(projectRoot, ".codex", "prompts", "market-analyst.md"), "utf8");
    expect(promptBody).toContain("Project: Test Studio Game");
    expect(promptBody).toContain("Role: Market Analyst");
    expect(promptBody).toContain("Engine:");
    expect(promptBody).toContain("Current Milestone:");
    expect(promptBody).toContain("Expected Outputs");
    expect(promptBody).toContain("Review Checklist");
    expect(promptBody).toContain("Handoff");
    expect(promptBody).toContain("Competitors: Mini Metro");
    expect(promptBody).toContain("source-input-sha256");
    expect(promptBody).toContain("rendered-body-sha256");

    for (const workflow of Object.keys(workflowRegistry)) {
      expect(existsSync(path.join(projectRoot, workflowRegistry[workflow as keyof typeof workflowRegistry].file))).toBe(true);
      expect(renderWorkflowPrompt(projectRoot, workflow as keyof typeof workflowRegistry)).toContain(workflow);
    }
    const workflowBody = readFileSync(path.join(projectRoot, ".codex", "workflows", "ui-ux-review.md"), "utf8");
    expect(workflowBody).toContain("source-input-sha256");
    expect(workflowBody).toContain("rendered-body-sha256");
    expect(existsSync(path.join(projectRoot, "project_orchestrator.md"))).toBe(false);
    expect(existsSync(path.join(projectRoot, "CODEX.md"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".gamestudio", "runs"))).toBe(false);
  });

  it("inlines only selected package templates into workflow prompts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-gap-"));
    const { projectRoot } = initProject({ name: "Template Game", engine: "godot", mode: "design", nonInteractive: true }, cwd);

    for (const workflow of Object.values(workflowRegistry)) {
      for (const templateId of workflow.templateIds ?? []) {
        expect(templateRegistry[templateId].roles).toContain(workflow.role);
      }
    }

    const market = renderWorkflowPrompt(projectRoot, "market-analysis");
    expect(market).toContain("Template: market_analysis");
    expect(market).toContain("Source: package:templates/market_analysis_template.md");
    expect(market).toContain(readTemplate("market_analysis").trim());
    expect(market).not.toContain("Template: analytics_setup");

    const analytics = renderWorkflowPrompt(projectRoot, "analytics-setup");
    expect(analytics).toContain("Template: analytics_setup");
    expect(analytics).toContain("Source: package:templates/analytics_setup_template.md");
    expect(analytics).toContain(readTemplate("analytics_setup").trim());
    expect(analytics).not.toContain("Template: market_analysis");

    expect(renderWorkflowPrompt(projectRoot, "design-spec")).toContain("Template: feature_spec");
    expect(renderWorkflowPrompt(projectRoot, "handoff")).toContain("Template: handoff");
    expect(renderWorkflowPrompt(projectRoot, "playtest")).toContain("Template: playtest_report");
    expect(renderWorkflowPrompt(projectRoot, "game-feel-tuning")).toContain("Template: game_feel_tuning");
    expect(renderWorkflowPrompt(projectRoot, "art-direction")).toContain("Template: art_direction");
    expect(renderWorkflowPrompt(projectRoot, "ui-ux-review")).toContain("Template: ui_ux_review");
    expect(renderWorkflowPrompt(projectRoot, "production-milestone")).toContain("Template: production_milestone");
    expect(renderWorkflowPrompt(projectRoot, "ship-check")).toContain("Template: ship_check");
    expect(renderWorkflowPrompt(projectRoot, "review")).not.toContain("## Workflow Templates");
    expect(renderWorkflowPrompt(projectRoot, "ui-ux-review")).not.toContain("Template: market_analysis");
    expect(renderWorkflowPrompt(projectRoot, "ship-check")).not.toContain("Template: analytics_setup");
    expect(market).not.toMatch(/- templates\/.*\.md/);
  });

  it("workflow shortcut CLI aliases render prompts only", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-gap-cli-"));
    const { projectRoot } = initProject({ name: "Shortcut Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const cli = path.join(process.cwd(), "src", "cli.ts");
    const tsx = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    const help = execFileSync(tsx, [cli, "--help"], { encoding: "utf8" });
    for (const alias of ["market", "analytics", "design-spec", "feel-review", "art-direction", "ui-review", "milestone", "handoff"]) {
      expect(help).toContain(alias);
    }
    expect(help).not.toMatch(/\bplan\b/);
    expect(help).not.toMatch(/\bnext\b/);
    expect(help).not.toMatch(/\btelemetry\b/);
    expect(help).not.toMatch(/\bparallel\b/);

    process.env.CODEX_BIN = "/missing/codex";
    try {
      for (const workflow of Object.values(workflowRegistry).filter((entry) => entry.cliAlias)) {
        for (const args of [[workflow.cliAlias!], [workflow.cliAlias!, "--dry-run"]]) {
          const before = readdirSync(path.join(projectRoot, ".codex", "runs"));
          const output = execFileSync(tsx, [cli, ...args, "--project", projectRoot], { cwd, encoding: "utf8" });
          expect(output).toContain(`Role: ${rolePackages[workflow.role].displayName}`);
          expect(output).toContain(workflow.objective);
          expect(readdirSync(path.join(projectRoot, ".codex", "runs"))).toEqual(before);
        }
      }
    } finally {
      delete process.env.CODEX_BIN;
    }
  });

  it("validation reports stable IDs for missing expanded prompts and workflows", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-gap-val-"));
    const { projectRoot } = initProject({ name: "Broken Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, ".codex", "prompts", "studio-orchestrator.md"));
    rmSync(path.join(projectRoot, ".codex", "workflows", "market-analysis.md"));
    writeFileSync(path.join(projectRoot, ".codex", "workflows", "ui-ux-review.md"), "# UI UX Review\n");
    const marketPrompt = path.join(projectRoot, ".codex", "prompts", "market-analyst.md");
    writeFileSync(marketPrompt, readFileSync(marketPrompt, "utf8").replace("Project: Broken Gap Game", "Project: Wrong Game").replace("Role: Market Analyst", "Role: Wrong Role"));
    const failures = validateProject(projectRoot).filter((check) => check.status === "fail").map((check) => check.id);
    expect(failures).toContain("codex.role.studio-orchestrator.prompt.exists");
    expect(failures).toContain("codex.role.market-analyst.prompt.project");
    expect(failures).toContain("codex.role.market-analyst.prompt.role");
    expect(failures).toContain("codex.workflow.market-analysis.file.exists");
    expect(failures).toContain("codex.workflow.ui-ux-review.sections");
  });
});
