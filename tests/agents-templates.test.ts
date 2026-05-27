import { describe, expect, test } from "vitest";
import { activeAgentsForMode, canonicalProjectConfigJson, guidanceConfigHash, projectConfigSchema, slugify } from "../src/config.js";
import { validateBaseAgents } from "../src/agents.js";
import { formatTemplateShow, listTemplates, readTemplate, selectTemplates, validateTemplateFiles } from "../src/templates.js";

describe("config, agents, and templates", () => {
  test("slug, active agents, and canonical hash are deterministic", () => {
    expect(slugify("My Game")).toBe("my-game");
    expect(activeAgentsForMode("prototype")).toContain("qa_agent");
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
      "engine_setup",
      "feature_spec",
      "gdd",
      "handoff",
      "market_analysis",
      "project_config"
    ]);
  });

  test("template selection is bounded", () => {
    expect(selectTemplates("market_analyst", "Create market overview")).toEqual(["market_analysis"]);
    expect(selectTemplates("data_scientist", "Create analytics plan")).toEqual(["analytics_setup"]);
    expect(selectTemplates("qa_agent", "Review validation readiness")).toEqual([]);
    expect(selectTemplates("producer_agent", "handoff coordination")).toEqual(["handoff"]);
  });

  test("template show includes discoverability metadata before body", () => {
    const output = formatTemplateShow("gdd");
    expect(output).toContain("ID: gdd");
    expect(output).toContain("Category: design");
    expect(output).toContain("Path: templates/gdd_template.md");
    expect(output).toContain("Roles: sr_game_designer, mid_game_designer");
    expect(output).toContain("# Purpose");
  });
});
