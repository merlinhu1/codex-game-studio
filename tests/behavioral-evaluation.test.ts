import { describe, expect, test } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { behavioralEvaluationScenarios, evaluateBehavioralScenario, runBehavioralEvaluations } from "../src/behavioral-evaluation.js";
import { initProject } from "../src/projects.js";

const scenarioIds = behavioralEvaluationScenarios.map((scenario) => scenario.id);

describe("behavioral evaluation", () => {
  test("defines deterministic local representative scenarios", () => {
    expect(scenarioIds).toEqual([
      "role.gameplay-programmer.contract",
      "role.qa-playtester.contract",
      "role.release-manager.contract",
      "workflow.ship-check.release-readiness",
      "workflow.playtest.issue-evidence",
      "workflow.market-analysis.positioning"
    ]);
    for (const scenario of behavioralEvaluationScenarios) {
      expect(scenario.requiredPhrases.length).toBeGreaterThan(0);
      expect(scenario.forbiddenPhrases).toEqual(expect.arrayContaining(["CODEX.md", "telemetry", "hidden memory"]));
      expect(scenario.expectedContextCategories.length).toBeGreaterThan(0);
    }
  });

  test("built-in role contract scenarios pass without hosted evaluators", () => {
    const results = runBehavioralEvaluations().filter((result) => result.id.startsWith("role."));
    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.status).toBe("pass");
      expect(result.localDeterministic).toBe(true);
      expect(result.usesHostedEvaluator).toBe(false);
      expect(result.usesLlmCall).toBe(false);
      expect(result.missingRequiredPhrases).toEqual([]);
      expect(result.presentForbiddenPhrases).toEqual([]);
      expect(result.promptLength).toBeGreaterThan(500);
    }
  });

  test("workflow scenarios pass against generated project prompts and selected templates", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-behavioral-"));
    const { projectRoot } = initProject({ name: "Behavioral Game", engine: "godot", mode: "development", nonInteractive: true }, cwd);
    const results = runBehavioralEvaluations({ projectRoot }).filter((result) => result.id.startsWith("workflow."));
    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.status).toBe("pass");
      expect(result.missingRequiredPhrases).toEqual([]);
      expect(result.missingContextCategories).toEqual([]);
      expect(result.missingTemplateIds).toEqual([]);
      expect(result.presentForbiddenTemplateIds).toEqual([]);
      expect(result.presentForbiddenPhrases).toEqual([]);
    }
  });

  test("negative checks fail when required text is missing or forbidden drift appears", () => {
    const scenario = behavioralEvaluationScenarios[0];
    const missing = evaluateBehavioralScenario({ ...scenario, requiredPhrases: ["this phrase is intentionally absent"] });
    expect(missing.status).toBe("fail");
    expect(missing.missingRequiredPhrases).toEqual(["this phrase is intentionally absent"]);

    const forbidden = evaluateBehavioralScenario({ ...scenario, forbiddenPhrases: ["Role: Gameplay Programmer"] });
    expect(forbidden.status).toBe("fail");
    expect(forbidden.presentForbiddenPhrases).toEqual(["Role: Gameplay Programmer"]);
  });
});
