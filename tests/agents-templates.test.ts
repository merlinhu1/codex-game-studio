import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { activeAgentsForMode, canonicalProjectConfigJson, guidanceConfigHash, projectConfigSchema, slugify } from "../src/config.js";
import { renderProjectCustomAgentToml, renderProjectRolePrompt, validateBaseAgents } from "../src/agents.js";
import { loadEngineConfigs } from "../src/engines.js";
import { packageAssetPath } from "../src/paths.js";
import { defaultProjectConfig, initProject } from "../src/projects.js";
import { studioRoleIds } from "../src/roles.js";
import { formatTemplateShow, listTemplates, readTemplate, selectTemplates, validateTemplateFiles } from "../src/templates.js";

describe("config, agents, and templates", () => {
  test("slug, active agents, and canonical hash are deterministic", () => {
    expect(slugify("My Game")).toBe("my-game");
    expect(activeAgentsForMode("prototype")).toContain("qa-playtester");
    const config = projectConfigSchema.parse(JSON.parse(readTemplate("project_config")));
    const hash = guidanceConfigHash(config);
    config.project.status = "frozen";
    expect(guidanceConfigHash(config)).toBe(hash);
    config.project.genre = "Strategy";
    expect(guidanceConfigHash(config)).not.toBe(hash);
    expect(canonicalProjectConfigJson(config).endsWith("\n")).toBe(true);
  });

  test("all base prompts and templates have required sections", () => {
    expect(validateBaseAgents()).toEqual([]);
    expect(validateTemplateFiles()).toEqual([]);
    expect(listTemplates().map((t) => t.id).sort()).toEqual([
      "accessibility_requirements",
      "adr",
      "analytics_setup",
      "architecture_traceability",
      "art_bible",
      "art_direction",
      "difficulty_curve",
      "economy_model",
      "engine_setup",
      "feature_spec",
      "game_feel_tuning",
      "gdd",
      "handoff",
      "market_analysis",
      "pitch_document",
      "player_journey",
      "playtest_report",
      "postmortem",
      "production_milestone",
      "project_config",
      "release_notes",
      "risk_register",
      "ship_check",
      "sound_bible",
      "sprint_plan",
      "technical_design",
      "test_evidence",
      "test_plan",
      "ui_ux_review",
      "ux_spec",
      "vertical_slice_report"
    ]);
    for (const template of listTemplates()) {
      expect(template.description.length).toBeGreaterThan(20);
      expect(template.roles.length).toBeGreaterThan(0);
      expect(template.workflows.length).toBeGreaterThan(0);
    }
  });

  test("template selection is bounded", () => {
    expect(selectTemplates("producer", "Create market overview")).toEqual(["market_analysis"]);
    expect(selectTemplates("producer", "Create analytics plan")).toEqual(["analytics_setup"]);
    expect(selectTemplates("qa-playtester", "Review validation readiness")).toEqual(["playtest_report"]);
    expect(selectTemplates("producer", "handoff coordination")).toEqual(["handoff"]);
    expect(selectTemplates("qa-playtester", "Review UI usability")).toEqual(["playtest_report", "ui_ux_review"]);
    expect(selectTemplates("release-manager", "Check package")).toEqual(["ship_check", "release_notes"]);
    expect(selectTemplates("technical-director", "Draft architecture decision and technical design")).toEqual(["adr", "technical_design", "architecture_traceability"]);
    expect(selectTemplates("audio-director", "Create sound bible for audio style")).toEqual(["sound_bible"]);
    expect(selectTemplates("accessibility-specialist", "Define accessibility requirements")).toEqual(["accessibility_requirements"]);
    expect(selectTemplates("producer", "Plan sprint risks and release notes")).toEqual(["sprint_plan", "release_notes", "ship_check", "risk_register"]);
  });

  test("template show includes discoverability metadata before body", () => {
    const output = formatTemplateShow("gdd");
    expect(output).toContain("ID: gdd");
    expect(output).toContain("Category: design");
    expect(output).toContain("Path: templates/gdd_template.md");
    expect(output).toContain("Description:");
    expect(output).toContain("Roles: game-designer, creative-director");
    expect(output).toContain("Workflows:");
    expect(output).toContain("# Purpose");
  });

  test("engine reference prompt selection is active-engine scoped", () => {
    const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
    const unity = defaultProjectConfig({ name: "Unity Prompt Game", engine: "unity", mode: "prototype", nonInteractive: true });
    const gameplay = renderProjectRolePrompt("gameplay-programmer", unity, engines);

    expect(gameplay).toContain("docs/engine-reference/unity/VERSION.md");
    expect(gameplay).toContain("docs/engine-reference/unity/current-best-practices.md");
    expect(gameplay).toContain("docs/engine-reference/unity/gameplay.md");
    expect(gameplay).not.toContain("docs/engine-reference/unity/modules/audio.md");
    expect(gameplay).not.toContain("docs/engine-reference/unreal/");

    expect(studioRoleIds).toContain("godot-specialist");
    const godot = defaultProjectConfig({ name: "Godot Specialist Game", engine: "godot", mode: "prototype", nonInteractive: true });
    const specialist = renderProjectRolePrompt("godot-specialist", godot, engines);
    expect(specialist).toContain("docs/engine-reference/godot/VERSION.md");
    expect(specialist).toContain("docs/engine-reference/godot/current-best-practices.md");
    expect(specialist).toContain("docs/engine-reference/godot/specialist.md");
    expect(specialist).not.toContain("docs/engine-reference/godot/modules/audio.md");
    expect(specialist).not.toContain("docs/engine-reference/unity/");
  });

  test("generated project role prompts render structured contracts and stay bounded", () => {
    const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
    const config = defaultProjectConfig({ name: "Prompt Depth Game", engine: "godot", mode: "development", nonInteractive: true });
    const release = renderProjectRolePrompt("release-manager", config, engines);
    const producerToml = renderProjectCustomAgentToml("producer", config, engines);

    for (const section of [
      "## Responsibilities",
      "## Inputs To Inspect",
      "## Output Format",
      "## Quality Gates",
      "## Collaboration Notes",
      "## Stop Conditions"
    ]) {
      expect(release).toContain(section);
      expect(producerToml).toContain(section);
    }
    expect(release).toContain("Release decision");
    expect(release).toContain("Blocking issues");
    expect(release).toContain("Validation evidence");
    expect(producerToml).toContain("Sprint Planning");
    expect(producerToml).toContain("Risk Management");
    expect(producerToml).toContain("Scope Management");
    expect(producerToml).toContain("Validation gate");
    expect(release).toContain("Stop and report a blocker");
    expect(release.length).toBeLessThan(15000);
    expect(producerToml.length).toBeLessThan(15000);
    expect(release).not.toContain("# Gameplay Programmer");
    expect(release).not.toContain("templates/gdd_template.md");
    expect(release).not.toContain("docs/engine-reference/unity/");
  });

  test("generated project prompts and AGENTS.md include only the active engine specialist", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-specialist-"));
    const { projectRoot } = initProject({ name: "Godot Prompt Scope", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const prompts = path.join(projectRoot, ".codex", "prompts");
    const agents = readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");

    expect(existsSync(path.join(prompts, "godot-specialist.md"))).toBe(true);
    expect(existsSync(path.join(prompts, "unity-specialist.md"))).toBe(false);
    expect(existsSync(path.join(prompts, "unreal-specialist.md"))).toBe(false);
    expect(agents).toContain("- godot-specialist: .codex/prompts/godot-specialist.md");
    expect(agents).not.toContain("unity-specialist.md");
    expect(agents).not.toContain("unreal-specialist.md");
  });
});
