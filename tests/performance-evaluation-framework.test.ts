import { describe, test } from "node:test";
import { expect } from "expect";
import {
  gradePerformanceEvaluationScenario,
  loadPerformanceEvaluationFramework,
  summarizePerformanceEvaluationCoverage,
  validatePerformanceEvaluationFramework,
  type PerformanceEvaluationFramework,
  type PerformanceEvaluationScenario
} from "../src/performance-evaluation.js";

const scenario: PerformanceEvaluationScenario = {
  id: "skill.cgs-skill-test.behavioral-spec",
  target: "cgs-skill-test",
  kind: "skill",
  priority: "critical",
  manualOnly: true,
  prompt: "eval-framework/scenarios/cgs-skill-test/behavioral-spec/prompt.md",
  expected: {
    mustRead: [".agents/skills/cgs-skill-test/SKILL.md", "eval-framework/rubrics/skill-behavior.json"],
    mustChange: ["production/session-state/eval-report.md"],
    mustNotChange: ["src/**", ".agents/skills/**"],
    mustRunOrExplain: ["npm run validate"],
    report: { required: true }
  },
  grading: {
    deterministic: ["required-read", "write-boundary", "verification-evidence", "report-presence"],
    semanticDimensions: ["triggering", "context-selection", "output-quality", "verification-discipline", "token-discipline"]
  }
};

describe("performance evaluation framework", () => {
  test("grades skill and prompt behavior from scenario expectations instead of skill existence", () => {
    const passResult = gradePerformanceEvaluationScenario(scenario, {
      traceEvidence: "Read .agents/skills/cgs-skill-test/SKILL.md and eval-framework/rubrics/skill-behavior.json; ran npm run validate",
      changedFiles: ["production/session-state/eval-report.md"],
      finalReport: "## Eval Report\nPASS",
      usage: { status: "recorded", model: "gpt-5.3-codex-spark", inputTokens: 1200, cachedInputTokens: 200, outputTokens: 300, reasoningOutputTokens: 100, totalTokens: 1500 }
    });

    expect(passResult.status).toBe("pass");
    expect(passResult.usage?.model).toBe("gpt-5.3-codex-spark");
    expect(passResult.usage?.totalTokens).toBe(1500);
    expect(passResult.failures).toEqual([]);

    const failResult = gradePerformanceEvaluationScenario(scenario, {
      traceEvidence: "Read only .agents/skills/cgs-skill-test/SKILL.md",
      changedFiles: [".agents/skills/cgs-skill-test/SKILL.md", "src/behavioral-evaluation.ts"],
      finalReport: ""
    });

    expect(failResult.status).toBe("fail");
    expect(failResult.failures.map((failure) => failure.id)).toEqual(expect.arrayContaining([
      "required-read-not-recorded",
      "forbidden-write",
      "missing-required-change",
      "verification-not-recorded",
      "missing-report"
    ]));
    expect(failResult.failures.map((failure) => failure.id)).not.toContain("skill-missing");
  });

  test("fails required-read gate when evidence explicitly says the file was not read", () => {
    const result = gradePerformanceEvaluationScenario(scenario, {
      traceEvidence: "Did not read .agents/skills/cgs-skill-test/SKILL.md; read eval-framework/rubrics/skill-behavior.json; ran npm run validate",
      changedFiles: ["production/session-state/eval-report.md"],
      finalReport: "## Eval Report\nPASS"
    });

    expect(result.status).toBe("fail");
    expect(result.failures.map((failure) => failure.id)).toContain("required-read-explicitly-denied");
  });

  test("counts unique scenario references instead of duplicated target references", () => {
    const duplicatePath = "eval-framework/scenarios/cgs-skill-test/behavioral-spec/scenario.json";
    const duplicateFramework: PerformanceEvaluationFramework = {
      catalog: {
        version: 1,
        manualOnly: true,
        lastReviewed: "2026-07-01",
        targets: [{
          id: "duplicated-target",
          kind: "skill",
          priority: "critical",
          manualOnly: true,
          surfacePaths: [".agents/skills/cgs-skill-test/SKILL.md"],
          rubric: "eval-framework/rubrics/skill-behavior.json",
          scenarios: [duplicatePath, duplicatePath]
        }],
        runners: { harnessHosts: [], manualAgentHosts: [] }
      },
      scenarios: [scenario],
      rubrics: []
    };

    expect(summarizePerformanceEvaluationCoverage(duplicateFramework).scenarios).toBe(1);
  });

  test("loads first-pass coverage across workflow prompts, skills, and role prompts", () => {
    const framework = loadPerformanceEvaluationFramework(process.cwd());
    const summary = summarizePerformanceEvaluationCoverage(framework);

    expect(framework.catalog.manualOnly).toBe(true);
    expect(summary.scenarios).toBeGreaterThanOrEqual(30);
    expect(summary.targets).toBeGreaterThanOrEqual(30);
    expect(summary.byKind.workflow).toBeGreaterThanOrEqual(10);
    expect(summary.byKind.skill).toBeGreaterThanOrEqual(10);
    expect(summary.byKind.role).toBeGreaterThanOrEqual(6);
    expect(summary.surfacePaths).toBeGreaterThanOrEqual(30);
    expect(framework.catalog.targets.every((target) => target.scenarios.length > 0)).toBe(true);
    expect(framework.catalog.modelPolicy?.tokenEstimation?.required).toBe(true);
    expect(framework.catalog.modelPolicy?.tokenEstimation?.fields).toEqual(expect.arrayContaining([
      "inputTokens",
      "cachedInputTokens",
      "outputTokens",
      "reasoningOutputTokens",
      "totalTokens"
    ]));
    expect(framework.catalog.modelPolicy?.defaultEvaluationModel).toBe("gpt-5.3-codex-spark");
    expect(framework.catalog.modelPolicy?.allowedEvaluationModels).toContain("gpt-5.5");
    expect(framework.catalog.runners.runOutputPolicy?.repositoryTracked).toBe(true);
    expect(framework.catalog.runners.runOutputPolicy?.root).toBe("eval-framework/runs");
    expect(framework.catalog.runners.runOutputPolicy?.requiredFiles).toEqual(expect.arrayContaining(["summary.md", "audit.json"]));
    expect(framework.catalog.evaluationPlan?.map((stage) => stage.stage)).toEqual([
      "smoke-critical",
      "workflow-high-risk",
      "skill-maintenance",
      "role-boundary",
      "full-regression"
    ]);
    expect(framework.scenarios.every((loaded) => loaded.grading.semanticDimensions.length >= 4)).toBe(true);
    expect(framework.scenarios.some((loaded) => loaded.expected.mustNotChange.some((pattern) => pattern.includes(".agents/skills")))).toBe(true);
  });

  test("validation rejects existence-only checks and enforces first-pass coverage", () => {
    const checks = validatePerformanceEvaluationFramework(process.cwd());
    const ids = checks.map((check) => check.id);
    const messages = checks.map((check) => check.message.toLowerCase());

    expect(checks.every((check) => check.status === "pass")).toBe(true);
    expect(ids.some((id) => /skill.*exists|exists.*skill|presence-only/i.test(id))).toBe(false);
    expect(messages.some((message) => message.includes("skill exists") || message.includes("existence-only"))).toBe(false);
    expect(ids).toEqual(expect.arrayContaining([
      "performance_eval.catalog.manual_only",
      "performance_eval.scenarios.behavioral_expectations",
      "performance_eval.scenarios.unique_expectations",
      "performance_eval.rubrics.semantic_dimensions",
      "performance_eval.strategy.no_existence_only_checks",
      "performance_eval.token_estimation",
      "performance_eval.model_policy",
      "performance_eval.plan.gradual",
      "performance_eval.template_user_optional",
      "performance_eval.results.repository_saved",
      "performance_eval.coverage.first_pass"
    ]));
  });
});
