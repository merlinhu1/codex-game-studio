import { describe, test } from "node:test";
import { expect } from "expect";
import {
  codexModelForComplexity,
  isCodexModelName,
  parsePromptSurfaceFrontmatter,
  validateAgentDescriptionQuality,
  validateModelPolicy,
  validateSkillDescriptionQuality,
  validateWorkflowArgumentHintQuality,
  type PromptSurfaceComplexity
} from "../src/prompt-surface-metadata.js";

describe("prompt surface metadata", () => {
  test("maps complexity to exact Codex model names", () => {
    const cases: Array<[PromptSurfaceComplexity, string]> = [["complex", "gpt-5.5"], ["moderate", "gpt-5.4"], ["simple", "gpt-5.4-mini"]];
    for (const [complexity, model] of cases) expect(codexModelForComplexity(complexity)).toBe(model);
  });

  test("rejects Claude and abstract model names", () => {
    for (const valid of ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini"]) expect(isCodexModelName(valid)).toBe(true);
    for (const invalid of ["sonnet", "haiku", "opus", "claude-3.5-sonnet", "complex", "moderate", "simple", "gpt5.5"]) {
      expect(isCodexModelName(invalid)).toBe(false);
      expect(validateModelPolicy({ model: invalid, model_reasoning_effort: "medium" }).valid).toBe(false);
    }
  });

  test("parses markdown frontmatter", () => {
    const parsed = parsePromptSurfaceFrontmatter(`---\nname: cgs-prototype\nmodel: gpt-5.5\nmodel_reasoning_effort: high\nrelated-agents: [producer, qa-playtester]\n---\n\n# Body`);
    expect(parsed.frontmatter.model).toBe("gpt-5.5");
    expect(parsed.frontmatter.model_reasoning_effort).toBe("high");
    expect(parsed.body).toContain("# Body");
  });

  test("flags generic agent descriptions and accepts selection-oriented ownership metadata", () => {
    const generic = validateAgentDescriptionQuality("Game development Game Designer agent for game-designer tasks in this template repository.", "game-designer");
    expect(generic.valid).toBe(false);
    expect(generic.diagnostics.map((diagnostic) => diagnostic.id)).toContain("prompt.discovery.agent.generic_description");

    const specific = validateAgentDescriptionQuality(
      "Owns implementable gameplay mechanics, tuning values, edge cases, and player-facing acceptance criteria for bounded feature design; hand off production scope or QA evidence decisions.",
      "game-designer"
    );
    expect(specific.valid).toBe(true);
  });

  test("flags non-actionable skill descriptions and accepts trigger/outcome metadata", () => {
    const generic = validateSkillDescriptionQuality("Use for Codex Game Studio prototype work.", "cgs-prototype");
    expect(generic.valid).toBe(false);
    expect(generic.diagnostics.map((diagnostic) => diagnostic.id)).toContain("prompt.discovery.skill.vague_description");

    const specific = validateSkillDescriptionQuality(
      "Use for prototype experiments: define a falsifiable gameplay hypothesis, throwaway boundary, success signal, cleanup plan, and verification evidence.",
      "cgs-prototype"
    );
    expect(specific.valid).toBe(true);
  });

  test("flags generic workflow argument hints and accepts workflow-specific input guidance", () => {
    const generic = validateWorkflowArgumentHintQuality("Describe the vertical-slice goal, target milestone/files, constraints, and required evidence.", "vertical-slice");
    expect(generic.valid).toBe(false);
    expect(generic.diagnostics.map((diagnostic) => diagnostic.id)).toContain("prompt.discovery.workflow.generic_argument_hint");

    const specific = validateWorkflowArgumentHintQuality(
      "Provide the playable slice goal, milestone target, involved scenes/assets/code paths, scope constraints, acceptance gates, and required build or playtest evidence.",
      "vertical-slice"
    );
    expect(specific.valid).toBe(true);
  });
});
