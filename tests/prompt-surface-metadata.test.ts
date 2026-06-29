import { describe, test } from "node:test";
import { expect } from "expect";
import { codexModelForComplexity, isCodexModelName, parsePromptSurfaceFrontmatter, validateModelPolicy, type PromptSurfaceComplexity } from "../src/prompt-surface-metadata.js";

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
});
