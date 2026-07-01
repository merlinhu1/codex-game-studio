import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type PerformanceEvaluationPriority = "critical" | "high" | "medium" | "low";

export type PerformanceEvaluationUsage = {
  status: "recorded" | "unavailable" | "invalid";
  model?: string;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  reasoningOutputTokens?: number;
  totalTokens?: number;
};

export type PerformanceEvaluationExpected = {
  mustRead: string[];
  mustChange: string[];
  mustNotChange: string[];
  mustRunOrExplain: string[];
  report: { required: boolean };
};

export type PerformanceEvaluationScenario = {
  id: string;
  target: string;
  kind?: "skill" | "workflow" | "role" | "prompt";
  priority: PerformanceEvaluationPriority;
  manualOnly: boolean;
  prompt: string;
  expected: PerformanceEvaluationExpected;
  grading: {
    deterministic: string[];
    semanticDimensions: string[];
  };
};

export type PerformanceEvaluationTarget = {
  id: string;
  kind: "skill" | "workflow" | "role" | "prompt";
  priority: PerformanceEvaluationPriority;
  manualOnly: boolean;
  surfacePaths: string[];
  rubric: string;
  scenarios: string[];
};

export type PerformanceEvaluationTokenEstimationPolicy = {
  required: boolean;
  fields: string[];
  notes?: string;
};

export type PerformanceEvaluationModelPolicy = {
  defaultEvaluationModel: string;
  allowedEvaluationModels: string[];
  overrideMechanism: string;
  tokenEstimation?: PerformanceEvaluationTokenEstimationPolicy;
};

export type PerformanceEvaluationPlanStage = {
  stage: string;
  purpose: string;
  targetPriorities: PerformanceEvaluationPriority[];
  scenarioKinds: Array<"skill" | "workflow" | "role" | "prompt">;
  recommendedMaxScenarios: number;
};

export type PerformanceEvaluationRunOutputPolicy = {
  repositoryTracked: boolean;
  root: string;
  perRunDirectory: string;
  requiredFiles: string[];
  summaryContract: string[];
  auditContract: string[];
  notes?: string;
};

export type PerformanceEvaluationCatalog = {
  version: number;
  manualOnly: boolean;
  lastReviewed: string;
  targets: PerformanceEvaluationTarget[];
  runners: {
    harnessHosts: string[];
    manualAgentHosts: string[];
    runOutputPolicy?: PerformanceEvaluationRunOutputPolicy;
  };
  modelPolicy?: PerformanceEvaluationModelPolicy;
  evaluationPlan?: PerformanceEvaluationPlanStage[];
};

export type PerformanceEvaluationRubric = {
  id: string;
  manualOnly: boolean;
  deterministicGates: string[];
  semanticDimensions: string[];
};

export type PerformanceEvaluationFramework = {
  catalog: PerformanceEvaluationCatalog;
  scenarios: PerformanceEvaluationScenario[];
  rubrics: PerformanceEvaluationRubric[];
};

export type PerformanceEvaluationObservation = {
  traceEvidence: string;
  changedFiles: string[];
  finalReport?: string;
  usage?: PerformanceEvaluationUsage;
};

export type PerformanceEvaluationFailure = { id: string; message: string };

export type PerformanceEvaluationResult = {
  scenarioId: string;
  status: "pass" | "fail";
  failures: PerformanceEvaluationFailure[];
  usage?: PerformanceEvaluationUsage;
};

export type PerformanceEvaluationValidationCheck = { id: string; status: "pass" | "fail"; message: string; path?: string };

export type PerformanceEvaluationCoverageSummary = {
  targets: number;
  scenarios: number;
  surfacePaths: number;
  byKind: Record<"skill" | "workflow" | "role" | "prompt", number>;
};

const FRAMEWORK_DIR = "eval-framework";
const EXISTENCE_ONLY_PATTERN = /\b(?:skill[-_ ]?exists|file[-_ ]?exists|exists|presence[-_ ]?only|static[-_ ]?presence)\b/iu;

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function pass(id: string, message: string, file?: string): PerformanceEvaluationValidationCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): PerformanceEvaluationValidationCheck {
  return { id, status: "fail", message, path: file };
}

function slashPath(file: string): string {
  return file.split(path.sep).join("/");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function globToRegExp(glob: string): RegExp {
  const normalized = slashPath(glob);
  let source = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }
  source += "$";
  return new RegExp(source, "u");
}

function matchesPattern(file: string, pattern: string): boolean {
  return globToRegExp(pattern).test(slashPath(file));
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function hasExplicitReadDenial(evidence: string, required: string): boolean {
  const escaped = escapeRegExp(required);
  const denialBeforePath = new RegExp(
    `(?:did\\s+not|didn't|never|not|no|failed\\s+to|unable\\s+to|could\\s+not|couldn't|skipped|without)\\s+(?:explicitly\\s+)?(?:read|reading|inspect|inspecting|open|opening|load|loading)[\\s\\S]{0,120}${escaped}`,
    "iu"
  );
  const pathBeforeDenial = new RegExp(
    `${escaped}[\\s\\S]{0,120}(?:was|were)?\\s*(?:not|never)\\s+(?:read|inspected|opened|loaded)`,
    "iu"
  );
  return denialBeforePath.test(evidence) || pathBeforeDenial.test(evidence);
}

function includesRequiredEvidence(evidence: string, required: string): boolean {
  return evidence.includes(required) && !hasExplicitReadDenial(evidence, required);
}

function commandWasRunOrExplained(evidence: string, command: string): boolean {
  if (evidence.includes(command)) return true;
  const escaped = escapeRegExp(command);
  const explanationPattern = new RegExp(
    `(?:skip|skipped|cannot|can't|unable|did not run|not run|not available|would fail|missing dependency)[\\s\\S]{0,200}${escaped}|${escaped}[\\s\\S]{0,200}(?:skip|skipped|cannot|can't|unable|did not run|not run|not available|would fail|missing dependency)`,
    "iu"
  );
  return explanationPattern.test(evidence);
}

export function gradePerformanceEvaluationScenario(
  scenario: PerformanceEvaluationScenario,
  observation: PerformanceEvaluationObservation
): PerformanceEvaluationResult {
  const failures: PerformanceEvaluationFailure[] = [];
  const evidence = `${observation.traceEvidence}\n${observation.finalReport ?? ""}`;

  for (const file of scenario.expected.mustRead) {
    if (hasExplicitReadDenial(evidence, file)) {
      failures.push({ id: "required-read-explicitly-denied", message: `${file} was explicitly reported as not read` });
    } else if (!includesRequiredEvidence(evidence, file)) {
      failures.push({ id: "required-read-not-recorded", message: `${file} was not recorded in trace evidence` });
    }
  }

  for (const changedFile of observation.changedFiles) {
    for (const pattern of scenario.expected.mustNotChange) {
      if (matchesPattern(changedFile, pattern)) {
        failures.push({ id: "forbidden-write", message: `${changedFile} matched forbidden write pattern ${pattern}` });
      }
    }
  }

  for (const pattern of scenario.expected.mustChange) {
    if (!observation.changedFiles.some((changedFile) => matchesPattern(changedFile, pattern))) {
      failures.push({ id: "missing-required-change", message: `${pattern} was not changed` });
    }
  }

  for (const command of scenario.expected.mustRunOrExplain) {
    if (!commandWasRunOrExplained(evidence, command)) {
      failures.push({ id: "verification-not-recorded", message: `${command} was not run or specifically explained` });
    }
  }

  if (scenario.expected.report.required && !(observation.finalReport ?? "").trim()) {
    failures.push({ id: "missing-report", message: "expected evaluation report was not produced" });
  }

  return {
    scenarioId: scenario.id,
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    usage: observation.usage
  };
}

export function loadPerformanceEvaluationFramework(root: string): PerformanceEvaluationFramework {
  const frameworkRoot = path.join(root, FRAMEWORK_DIR);
  const catalogPath = path.join(frameworkRoot, "catalog.json");
  const catalog = readJson<PerformanceEvaluationCatalog>(catalogPath);
  const scenarioPaths = [...new Set(catalog.targets.flatMap((target) => target.scenarios))];
  const rubricPaths = [...new Set(catalog.targets.map((target) => target.rubric))];

  return {
    catalog,
    scenarios: scenarioPaths.map((scenarioPath) => readJson<PerformanceEvaluationScenario>(path.join(root, scenarioPath))),
    rubrics: rubricPaths.map((rubricPath) => readJson<PerformanceEvaluationRubric>(path.join(root, rubricPath)))
  };
}

export function summarizePerformanceEvaluationCoverage(framework: PerformanceEvaluationFramework): PerformanceEvaluationCoverageSummary {
  const byKind: PerformanceEvaluationCoverageSummary["byKind"] = { skill: 0, workflow: 0, role: 0, prompt: 0 };
  for (const target of framework.catalog.targets) {
    byKind[target.kind] += 1;
  }
  return {
    targets: framework.catalog.targets.length,
    scenarios: framework.catalog.targets.reduce((total, target) => total + target.scenarios.length, 0),
    surfacePaths: framework.catalog.targets.reduce((total, target) => total + target.surfacePaths.length, 0),
    byKind
  };
}

export function validatePerformanceEvaluationFramework(root: string): PerformanceEvaluationValidationCheck[] {
  const checks: PerformanceEvaluationValidationCheck[] = [];
  const catalogPath = path.join(root, FRAMEWORK_DIR, "catalog.json");
  if (!existsSync(catalogPath)) {
    return [fail("performance_eval.catalog.manual_only", "performance evaluation catalog is missing", catalogPath)];
  }

  let framework: PerformanceEvaluationFramework;
  try {
    framework = loadPerformanceEvaluationFramework(root);
  } catch (error) {
    return [fail("performance_eval.catalog.manual_only", `performance evaluation framework could not be loaded: ${(error as Error).message}`, catalogPath)];
  }

  checks.push(
    framework.catalog.manualOnly === true
      ? pass("performance_eval.catalog.manual_only", "performance evaluation catalog is manual and behavior-focused", catalogPath)
      : fail("performance_eval.catalog.manual_only", "performance evaluation catalog must be manual-only", catalogPath)
  );

  const targetProblems = framework.catalog.targets.flatMap((target) => {
    const problems: string[] = [];
    if (target.manualOnly !== true) problems.push(`${target.id} is not manual-only`);
    if (!target.rubric) problems.push(`${target.id} has no rubric`);
    if (target.scenarios.length === 0) problems.push(`${target.id} has no behavioral scenarios`);
    if (target.surfacePaths.length === 0) problems.push(`${target.id} has no prompt/skill surface path`);
    return problems;
  });
  checks.push(
    targetProblems.length === 0
      ? pass("performance_eval.catalog.targets", "catalog targets map surfaces to rubrics and scenarios", catalogPath)
      : fail("performance_eval.catalog.targets", targetProblems.join("; "), catalogPath)
  );

  const scenarioProblems = framework.scenarios.flatMap((scenario) => {
    const problems: string[] = [];
    const hasBehaviorExpectation =
      scenario.expected.mustRead.length > 0 ||
      scenario.expected.mustChange.length > 0 ||
      scenario.expected.mustNotChange.length > 0 ||
      scenario.expected.mustRunOrExplain.length > 0 ||
      scenario.expected.report.required;
    if (scenario.manualOnly !== true) problems.push(`${scenario.id} is not manual-only`);
    if (!scenario.prompt) problems.push(`${scenario.id} has no scenario prompt`);
    if (!hasBehaviorExpectation) problems.push(`${scenario.id} has no behavior expectation`);
    if (scenario.grading.semanticDimensions.length < 4) problems.push(`${scenario.id} has too few semantic dimensions`);
    if (scenario.grading.deterministic.some((gate) => EXISTENCE_ONLY_PATTERN.test(gate))) {
      problems.push(`${scenario.id} uses a presence-only deterministic gate`);
    }
    return problems;
  });
  checks.push(
    scenarioProblems.length === 0
      ? pass("performance_eval.scenarios.behavioral_expectations", "scenarios require reads, write boundaries, reports, verification, or semantic grading")
      : fail("performance_eval.scenarios.behavioral_expectations", scenarioProblems.join("; "))
  );

  const rubricProblems = framework.rubrics.flatMap((rubric) => {
    const problems: string[] = [];
    if (rubric.manualOnly !== true) problems.push(`${rubric.id} is not manual-only`);
    if (rubric.semanticDimensions.length < 4) problems.push(`${rubric.id} has too few semantic dimensions`);
    if (rubric.deterministicGates.some((gate) => EXISTENCE_ONLY_PATTERN.test(gate))) {
      problems.push(`${rubric.id} uses a presence-only gate`);
    }
    return problems;
  });
  checks.push(
    rubricProblems.length === 0
      ? pass("performance_eval.rubrics.semantic_dimensions", "rubrics define semantic performance dimensions and deterministic boundaries")
      : fail("performance_eval.rubrics.semantic_dimensions", rubricProblems.join("; "))
  );

  const frameworkText = [
    JSON.stringify(framework.catalog),
    ...framework.scenarios.map((scenario) => JSON.stringify(scenario.grading.deterministic)),
    ...framework.rubrics.map((rubric) => JSON.stringify(rubric.deterministicGates))
  ].join("\n");
  checks.push(
    EXISTENCE_ONLY_PATTERN.test(frameworkText)
      ? fail("performance_eval.strategy.no_existence_only_checks", "performance evaluation strategy must not use presence-only checks as success criteria")
      : pass("performance_eval.strategy.no_existence_only_checks", "evaluation strategy grades behavior, boundaries, reports, verification, and semantic quality")
  );

  const modelPolicy = framework.catalog.modelPolicy;
  const allowedModels = modelPolicy?.allowedEvaluationModels ?? [];
  const uniqueAllowedModels = new Set(allowedModels);
  checks.push(
    !!modelPolicy?.defaultEvaluationModel &&
      allowedModels.length > 0 &&
      uniqueAllowedModels.size === allowedModels.length &&
      allowedModels.includes(modelPolicy.defaultEvaluationModel) &&
      !!modelPolicy.overrideMechanism
      ? pass("performance_eval.model_policy", `default evaluation model is ${modelPolicy.defaultEvaluationModel} with per-run override guidance`, catalogPath)
      : fail("performance_eval.model_policy", "catalog must define a default evaluation model that is included in the unique allowed model list plus an override mechanism", catalogPath)
  );

  const requiredTokenFields = ["inputTokens", "cachedInputTokens", "outputTokens", "reasoningOutputTokens", "totalTokens"];
  const tokenFields = modelPolicy?.tokenEstimation?.fields ?? [];
  checks.push(
    modelPolicy?.tokenEstimation?.required === true && requiredTokenFields.every((field) => tokenFields.includes(field))
      ? pass("performance_eval.token_estimation", "evaluation runs record selected model and raw token usage as normal run-estimation metadata", catalogPath)
      : fail("performance_eval.token_estimation", "model policy must include required token estimation fields for normal run estimation", catalogPath)
  );

  const plan = framework.catalog.evaluationPlan ?? [];
  const hasGradualPlan =
    plan.length >= 3 &&
    plan[0]?.targetPriorities.includes("critical") &&
    plan.some((stage) => stage.stage === "full-regression") &&
    plan.every((stage) => stage.scenarioKinds.length > 0 && stage.recommendedMaxScenarios > 0);
  checks.push(
    hasGradualPlan
      ? pass("performance_eval.plan.gradual", "catalog defines staged evaluation so maintainers can run critical smoke, focused subsets, or full regression", catalogPath)
      : fail("performance_eval.plan.gradual", "catalog must define a staged evaluation plan before full regression", catalogPath)
  );

  const readmePath = path.join(root, FRAMEWORK_DIR, "README.md");
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8").toLowerCase() : "";
  checks.push(
    readme.includes("normal game-project users") && readme.includes("delete") && readme.includes("eval-framework")
      ? pass("performance_eval.template_user_optional", "README tells downstream game-project users the eval framework is optional and deletable", readmePath)
      : fail("performance_eval.template_user_optional", "README must tell downstream game-project users they may delete eval-framework/", readmePath)
  );

  const runOutputPolicy = framework.catalog.runners.runOutputPolicy;
  const outputRequiredFiles = runOutputPolicy?.requiredFiles ?? [];
  const outputSummary = runOutputPolicy?.summaryContract ?? [];
  const outputAudit = runOutputPolicy?.auditContract ?? [];
  checks.push(
    runOutputPolicy?.repositoryTracked === true &&
      runOutputPolicy.root === "eval-framework/runs" &&
      outputRequiredFiles.includes("summary.md") &&
      outputRequiredFiles.includes("audit.json") &&
      outputSummary.length >= 5 &&
      outputAudit.length >= 5 &&
      readme.includes("summary.md") &&
      readme.includes("audit.json") &&
      readme.includes("repository artifacts")
      ? pass("performance_eval.results.repository_saved", "evaluation results are summarized and saved as repository artifacts under eval-framework/runs", catalogPath)
      : fail("performance_eval.results.repository_saved", "catalog and README must require summary.md and audit.json under eval-framework/runs for saved evaluation results", catalogPath)
  );

  const coverage = summarizePerformanceEvaluationCoverage(framework);
  const coverageProblems = [
    coverage.scenarios >= 30 ? undefined : `expected at least 30 scenarios, found ${coverage.scenarios}`,
    coverage.targets >= 30 ? undefined : `expected at least 30 targets, found ${coverage.targets}`,
    coverage.byKind.workflow >= 10 ? undefined : `expected at least 10 workflow targets, found ${coverage.byKind.workflow}`,
    coverage.byKind.skill >= 10 ? undefined : `expected at least 10 skill targets, found ${coverage.byKind.skill}`,
    coverage.byKind.role >= 6 ? undefined : `expected at least 6 role targets, found ${coverage.byKind.role}`
  ].filter((problem): problem is string => Boolean(problem));
  checks.push(
    coverageProblems.length === 0
      ? pass("performance_eval.coverage.first_pass", `first-pass coverage includes ${coverage.scenarios} scenarios across ${coverage.byKind.workflow} workflows, ${coverage.byKind.skill} skills, and ${coverage.byKind.role} roles`)
      : fail("performance_eval.coverage.first_pass", coverageProblems.join("; "))
  );

  return checks;
}
