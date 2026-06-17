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
import { renderWorkflowPrompt, workflowAliases, workflowRegistry } from "../src/workflows.js";

const requiredRoles = [
  "studio-orchestrator",
  "producer",
  "market-analyst",
  "data-scientist",
  "creative-director",
  "senior-game-designer",
  "game-designer",
  "narrative-designer",
  "writer",
  "world-builder",
  "level-designer",
  "game-feel-designer",
  "systems-designer",
  "economy-designer",
  "gameplay-programmer",
  "ai-programmer",
  "network-programmer",
  "ui-programmer",
  "engine-programmer",
  "godot-specialist",
  "unity-specialist",
  "unreal-specialist",
  "tools-programmer",
  "technical-director",
  "devops-engineer",
  "security-engineer",
  "performance-analyst",
  "senior-game-artist",
  "technical-artist",
  "audio-director",
  "sound-designer",
  "ui-ux-designer",
  "accessibility-specialist",
  "qa-playtester",
  "localization-lead",
  "live-ops-designer",
  "community-manager",
  "release-manager"
 ] as const;

const requiredWorkflowIds = [
  "vertical-slice",
  "bugfix",
  "playtest",
  "market-analysis",
  "analytics-setup",
  "design-spec",
  "game-feel-tuning",
  "art-direction",
  "ui-ux-review",
  "production-milestone",
  "handoff",
  "review",
  "ship-check",
  "onboard",
  "brainstorm",
  "prototype",
  "architecture-decision",
  "architecture-review",
  "create-epics",
  "create-stories",
  "sprint-plan",
  "sprint-status",
  "story-readiness",
  "story-done",
  "qa-plan",
  "regression-suite",
  "security-audit",
  "perf-profile",
  "release-checklist",
  "hotfix",
  "localization-plan"
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

  it("exposes a curated prompt-only workflow catalog", () => {
    expect(Object.keys(workflowRegistry)).toEqual(requiredWorkflowIds);
    const categories = new Map(Object.values(workflowRegistry).map((workflow) => [workflow.id, workflow.category]));
    expect(new Set(categories.values())).toEqual(
      new Set(["onboarding-discovery", "design-architecture", "implementation-planning", "qa-testing", "release-hotfix", "localization-accessibility", "team-coordination"])
    );

    for (const workflow of Object.values(workflowRegistry)) {
      expect(workflow.gapCoverage.length).toBeGreaterThan(0);
      expect(workflow.file).toBe(`.codex/workflows/${workflow.id}.md`);
    }

    expect(workflowAliases(workflowRegistry.onboard)).toEqual(expect.arrayContaining(["start", "onboard"]));
    expect(workflowAliases(workflowRegistry["release-checklist"])).toEqual(expect.arrayContaining(["release-checklist"]));
    expect(workflowRegistry.hotfix.phase).toBe("review");
  });

  it("selects market, analytics, orchestration, and mode-specific roles", () => {
    for (const mode of ["design", "prototype", "development"] as const) {
      expect(activeAgentsForMode(mode)).toEqual(
        expect.arrayContaining(["studio-orchestrator", "producer", "market-analyst", "data-scientist"])
      );
    }

    expect(activeAgentsForMode("design")).toEqual(
      expect.arrayContaining([
        "creative-director",
        "senior-game-designer",
        "game-designer",
        "narrative-designer",
        "writer",
        "world-builder",
        "level-designer",
        "systems-designer",
        "economy-designer",
        "audio-director",
        "senior-game-artist",
        "ui-ux-designer",
        "accessibility-specialist"
      ])
    );
    expect(activeAgentsForMode("prototype")).toEqual(
      expect.arrayContaining(["senior-game-designer", "systems-designer", "level-designer", "game-feel-designer", "gameplay-programmer", "ui-programmer", "sound-designer", "qa-playtester", "accessibility-specialist"])
    );
    expect(activeAgentsForMode("development")).toEqual(
      expect.arrayContaining([
        "technical-director",
        "game-feel-designer",
        "engine-programmer",
        "tools-programmer",
        "ai-programmer",
        "network-programmer",
        "ui-programmer",
        "devops-engineer",
        "security-engineer",
        "performance-analyst",
        "technical-artist",
        "localization-lead",
        "live-ops-designer",
        "community-manager",
        "release-manager"
      ])
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

    const networkPromptBody = readFileSync(path.join(projectRoot, ".codex", "prompts", "network-programmer.md"), "utf8");
    expect(networkPromptBody).toContain("Role: Network Programmer");
    expect(networkPromptBody).toContain("Context Strategy: broad");
    expect(networkPromptBody).toContain("Expected Outputs");
    expect(networkPromptBody).toContain("Review Checklist");

    for (const workflow of Object.keys(workflowRegistry)) {
      expect(existsSync(path.join(projectRoot, workflowRegistry[workflow as keyof typeof workflowRegistry].file))).toBe(true);
      expect(renderWorkflowPrompt(projectRoot, workflow as keyof typeof workflowRegistry)).toContain(workflow);
    }
    const workflowBody = readFileSync(path.join(projectRoot, ".codex", "workflows", "ui-ux-review.md"), "utf8");
    expect(workflowBody).toContain("source-input-sha256");
    expect(workflowBody).toContain("rendered-body-sha256");
    expect(workflowBody).toContain("## Taxonomy");
    expect(readFileSync(path.join(projectRoot, ".codex", "workflows", "release-checklist.md"), "utf8")).toContain("release-hotfix");
    expect(readFileSync(path.join(projectRoot, ".codex", "workflows", "localization-plan.md"), "utf8")).toContain("localization-accessibility");
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
    expect(renderWorkflowPrompt(projectRoot, "ship-check")).toContain("Template: release_notes");
    expect(renderWorkflowPrompt(projectRoot, "ship-check")).toContain("Template: risk_register");
    const architectureDecision = renderWorkflowPrompt(projectRoot, "architecture-decision");
    expect(architectureDecision).toContain("Template: adr");
    expect(architectureDecision).toContain("Template: technical_design");
    expect(architectureDecision).toContain("Template: architecture_traceability");
    expect(architectureDecision).not.toContain("Template: art_bible");
    const qaPlan = renderWorkflowPrompt(projectRoot, "qa-plan");
    expect(qaPlan).toContain("Template: test_plan");
    expect(qaPlan).toContain("Template: test_evidence");
    expect(renderWorkflowPrompt(projectRoot, "sprint-plan")).toContain("Template: sprint_plan");
    expect(renderWorkflowPrompt(projectRoot, "art-direction")).toContain("Template: art_bible");
    expect(renderWorkflowPrompt(projectRoot, "localization-plan")).toContain("Template: accessibility_requirements");
    expect(renderWorkflowPrompt(projectRoot, "prototype")).toContain("Template: vertical_slice_report");
    expect(renderWorkflowPrompt(projectRoot, "brainstorm")).toContain("Template: pitch_document");
    expect(renderWorkflowPrompt(projectRoot, "security-audit")).toContain("Security Engineer");
    expect(renderWorkflowPrompt(projectRoot, "security-audit")).not.toContain("## Workflow Templates");
    expect(renderWorkflowPrompt(projectRoot, "localization-plan")).toContain("Localization Lead");
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
    for (const alias of [
      "market",
      "analytics",
      "design-spec",
      "feel-review",
      "art-direction",
      "ui-review",
      "milestone",
      "handoff",
      "start",
      "onboard",
      "brainstorm",
      "prototype",
      "architecture-decision",
      "architecture-review",
      "create-epics",
      "create-stories",
      "sprint-plan",
      "sprint-status",
      "story-readiness",
      "story-done",
      "qa-plan",
      "regression-suite",
      "security-audit",
      "perf-profile",
      "release-checklist",
      "hotfix",
      "localization-plan"
    ]) {
      expect(help).toContain(alias);
    }
    expect(help).not.toMatch(/\bnext\b/);
    expect(help).not.toMatch(/\btelemetry\b/);
    expect(help).not.toMatch(/\bparallel\b/);

    process.env.CODEX_BIN = "/missing/codex";
    try {
      for (const workflow of Object.values(workflowRegistry).filter((entry) => workflowAliases(entry).length > 0)) {
        for (const alias of workflowAliases(workflow)) for (const args of [[alias], [alias, "--dry-run"]]) {
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
