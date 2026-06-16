import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { activeAgentsForMode, canonicalProjectConfigJson, guidanceConfigHash, projectConfigSchema, slugify } from "../src/config.js";
import { renderProjectRolePrompt, validateBaseAgents } from "../src/agents.js";
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
      "analytics_setup",
      "art_direction",
      "engine_setup",
      "feature_spec",
      "game_feel_tuning",
      "gdd",
      "handoff",
      "market_analysis",
      "playtest_report",
      "production_milestone",
      "project_config",
      "ship_check",
      "ui_ux_review"
    ]);
  });

  test("template selection is bounded", () => {
    expect(selectTemplates("producer", "Create market overview")).toEqual(["market_analysis"]);
    expect(selectTemplates("producer", "Create analytics plan")).toEqual(["analytics_setup"]);
    expect(selectTemplates("qa-playtester", "Review validation readiness")).toEqual(["playtest_report"]);
    expect(selectTemplates("producer", "handoff coordination")).toEqual(["handoff"]);
    expect(selectTemplates("qa-playtester", "Review UI usability")).toEqual(["playtest_report", "ui_ux_review"]);
    expect(selectTemplates("release-manager", "Check package")).toEqual(["ship_check"]);
  });

  test("template show includes discoverability metadata before body", () => {
    const output = formatTemplateShow("gdd");
    expect(output).toContain("ID: gdd");
    expect(output).toContain("Category: design");
    expect(output).toContain("Path: templates/gdd_template.md");
    expect(output).toContain("Roles: game-designer, creative-director");
    expect(output).toContain("# Purpose");
  });

  test("engine reference prompt selection is active-engine scoped", () => {
    const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
    const unity = defaultProjectConfig({ name: "Unity Prompt Game", engine: "unity", mode: "prototype", nonInteractive: true });
    const gameplay = renderProjectRolePrompt("gameplay-programmer", unity, engines);

    expect(gameplay).toContain("docs/engine-reference/unity/VERSION.md");
    expect(gameplay).toContain("docs/engine-reference/unity/gameplay.md");
    expect(gameplay).not.toContain("docs/engine-reference/unreal/");

    expect(studioRoleIds).toContain("godot-specialist");
    const godot = defaultProjectConfig({ name: "Godot Specialist Game", engine: "godot", mode: "prototype", nonInteractive: true });
    const specialist = renderProjectRolePrompt("godot-specialist", godot, engines);
    expect(specialist).toContain("docs/engine-reference/godot/VERSION.md");
    expect(specialist).toContain("docs/engine-reference/godot/specialist.md");
    expect(specialist).not.toContain("docs/engine-reference/unity/");
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
