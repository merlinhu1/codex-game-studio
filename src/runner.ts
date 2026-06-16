import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { explainApprovalMismatch, normalizeApprovalScope, readApprovalStore, type ApprovalMismatchDiagnostic } from "./approvals.js";
import { readProjectAgentPrompt } from "./agents.js";
import { buildCodexExecArgs, resolveCodexCommand, type CodexExecutionResult } from "./codex-runtime.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { createCodexStudioSession, type VerificationCommand } from "./codex-session.js";
import { selectContextEntries, type ContextManifestEntry, type ContextRequestEntry } from "./context-manifest.js";
import { renderContextContract } from "./prompt-context.js";
import { readStudioProject } from "./projects.js";
import { isEngineSpecialistRoleId, isStudioRoleId, projectRoleIdsForEngine, unknownStudioRoleMessage, type StudioRoleId } from "./roles.js";
import { resolveProjectRoot } from "./paths.js";
import { evaluateStudioRunEligibility, type CodexSandboxMode, type CodexStudioPhase, type StudioRunEligibility } from "./studio-policy.js";
import { renderSelectedTemplates, selectTemplates } from "./templates.js";
import { runVerificationCommand, type VerificationResult } from "./verification.js";

export type RunOptions = {
  project: string;
  task: string;
  printPrompt?: boolean;
  dryRun?: boolean;
  codexBin?: string;
  includeArtifact?: string[];
  approvalScope?: string[];
  allowBroadContext?: boolean;
  verifyCommand?: VerificationCommand;
  review?: boolean;
  fix?: boolean;
  maxFixPasses?: number;
  approvedByUser?: boolean;
  constrainedSandbox?: boolean;
};

export type PreparedRun = {
  prompt: string;
  promptPath: string;
  metadataPath: string;
  projectRoot: string;
  role: StudioRoleId;
  task: string;
  contextFiles: string[];
  verification?: VerificationCommand;
  codexCommand: { command: string; args: string[]; display: string };
  reviewCodexCommand?: { command: string; args: string[]; display: string };
  output: string;
  reviewPrompt?: string;
  fixPrompt?: string;
  maxFixPasses: number;
  eligibility: StudioRunEligibility;
};

export type ReviewResult = {
  blockers: string[];
  warnings: string[];
  summary: string;
  needsFix: boolean;
};

export type ReviewPassResult = {
  execution: CodexExecutionResult;
  raw: string;
  parsed?: ReviewResult;
  malformed?: string;
};

export type FixPassResult = {
  pass: number;
  execution: CodexExecutionResult;
  verification?: VerificationResult;
  review?: ReviewPassResult;
};

export type RunLifecycleResult = {
  implementation: CodexExecutionResult;
  verification?: VerificationResult;
  review?: ReviewPassResult;
  fixPasses: FixPassResult[];
  finalStatus: "done" | "blocked";
  output: string;
};

function requireTask(task: string): string {
  if (!task || !task.trim()) throw new Error("task is required and must be non-empty");
  return task.trim();
}

export function codexExecInvocation(projectRoot: string, codexBin = resolveCodexCommand(), sandbox: CodexSandboxMode = "danger-full-access"): { command: string; args: string[]; display: string } {
  const args = buildCodexExecArgs({ projectRoot, sandbox });
  return { command: codexBin, args, display: [codexBin, ...args.map((arg) => JSON.stringify(arg))].join(" ") };
}

export function executeCodexPromptSync(run: PreparedRun, prompt: string, command = run.codexCommand): CodexExecutionResult {
  const result = spawnSync(command.command, command.args, {
    cwd: run.projectRoot,
    encoding: "utf8",
    input: prompt,
    shell: false
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error
  };
}

export function executeCodexRun(run: PreparedRun): CodexExecutionResult {
  return executeCodexPromptSync(run, run.prompt);
}

function safeArtifact(projectRoot: string, artifact: string): { full: string; display: string } {
  if (/[\u0000-\u001f\u007f]/.test(artifact)) throw new Error("--include-artifact cannot contain control characters");
  if (path.isAbsolute(artifact)) throw new Error("--include-artifact must be relative");
  const full = path.resolve(projectRoot, artifact);
  if (!full.startsWith(`${projectRoot}${path.sep}`)) throw new Error("--include-artifact cannot escape the project root");
  const realRoot = realpathSync(projectRoot);
  const realFull = realpathSync(full);
  if (realFull !== realRoot && !realFull.startsWith(`${realRoot}${path.sep}`)) throw new Error("--include-artifact cannot escape the project root");
  return { full: realFull, display: path.relative(realRoot, realFull).split(path.sep).join("/") };
}

function renderRuntimeContextBlock(role: StudioRoleId, projectRoot: string, task: string): string {
  const projectRolePrompt = readProjectAgentPrompt(role, projectRoot);
  const templateBodies = renderSelectedTemplates(selectTemplates(role, task));
  return ["", `# Project Role Prompt: .codex/prompts/${role}.md`, "", projectRolePrompt.trim(), templateBodies, ""].join("\n");
}

function broadContextRequests(): ContextRequestEntry[] {
  return [
    { sourcePath: "documentation/design/gdd.md", reason: "design reference" },
    { sourcePath: "documentation/production/timeline.md", reason: "production reference" },
    { sourcePath: "resources/market-research/market-overview.md", reason: "market reference" }
  ];
}

function contextFiles(entries: ContextManifestEntry[]): string[] {
  return entries.filter((entry) => entry.status === "selected").map((entry) => entry.sourcePath);
}

function formatApprovalDiagnostic(diagnostic: ApprovalMismatchDiagnostic, args: { projectStage: string; studioMode: string; approvalScopes: string[] }): string {
  const lines = [
    "Approval diagnostic:",
    `project stage: ${args.projectStage}`,
    `studio mode: ${args.studioMode}`,
    `approval scopes: ${args.approvalScopes.length ? args.approvalScopes.join(", ") : "none"}`,
    `current objective hash: ${diagnostic.objectiveSha256}`,
    diagnostic.matched ? "matching approval found" : "no matching approval"
  ];
  if (diagnostic.records.length === 0) {
    lines.push("records: none");
    return lines.join("\n");
  }
  lines.push("records:");
  for (const record of diagnostic.records) {
    lines.push(`${record.id}: ${record.authorizing ? "authorizing" : `non-authorizing (${record.reasons.join(", ")})`}`);
  }
  return lines.join("\n");
}

function phaseForRun(role: StudioRoleId): CodexStudioPhase {
  if (role === "producer") return "plan";
  if (role === "qa-playtester") return "review";
  return "implement";
}

function formatEligibility(eligibility: StudioRunEligibility): string {
  const lines = [
    `Eligibility: ${eligibility.allowed ? "allowed" : "blocked"}`,
    `Write policy: ${eligibility.writePolicy}`,
    `Sandbox: ${eligibility.codexSandbox}`,
    `File edits: ${eligibility.allowFileEdits ? "allowed" : "not allowed"}`,
    `Reason: ${eligibility.reason}`,
    `Provenance: ${String(eligibility.metadata.provenance)}`,
    `Approved by user: ${eligibility.metadata.approvedByUser === true}`,
    `Matching approval: ${eligibility.metadata.hasMatchingApproval === true}`,
    `Constrained sandbox: ${eligibility.metadata.constrainedSandbox === true}`
  ];
  if (eligibility.requiredApproval) {
    lines.push(
      "Required approval:",
      `- project stage: ${eligibility.requiredApproval.projectStage}`,
      `- studio mode: ${eligibility.requiredApproval.studioMode}`,
      `- phase: ${eligibility.requiredApproval.phase}`,
      `- approval policy: ${eligibility.requiredApproval.approvalPolicy}`
    );
  }
  return lines.join("\n");
}

function executionFailed(result: CodexExecutionResult): boolean {
  return Boolean(result.error) || result.status !== 0;
}

function verificationFailed(result: VerificationResult): boolean {
  return result.timedOut || result.exitCode !== 0;
}

export function parseReviewJson(raw: string): ReviewResult {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("review output did not contain a JSON object");
  const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<ReviewResult>;
  if (!Array.isArray(parsed.blockers) || !parsed.blockers.every((item) => typeof item === "string")) throw new Error("review JSON blockers must be string[]");
  if (!Array.isArray(parsed.warnings) || !parsed.warnings.every((item) => typeof item === "string")) throw new Error("review JSON warnings must be string[]");
  if (typeof parsed.summary !== "string") throw new Error("review JSON summary must be a string");
  if (typeof parsed.needsFix !== "boolean") throw new Error("review JSON needsFix must be boolean");
  return { blockers: parsed.blockers, warnings: parsed.warnings, summary: parsed.summary, needsFix: parsed.needsFix };
}

function runReviewPass(run: PreparedRun, previousSummary = ""): ReviewPassResult | undefined {
  if (!run.reviewPrompt) return undefined;
  const prompt = `${run.reviewPrompt}\n\n# Implementation and verification output\n\n${previousSummary}\n`;
  const execution = executeCodexPromptSync(run, prompt, run.reviewCodexCommand ?? run.codexCommand);
  const raw = execution.stdout.trim() || execution.stderr.trim();
  if (executionFailed(execution)) return { execution, raw, malformed: execution.error?.message ?? `review exited with status ${execution.status}` };
  try {
    return { execution, raw, parsed: parseReviewJson(raw) };
  } catch (error) {
    return { execution, raw, malformed: (error as Error).message };
  }
}

function reviewFailed(review: ReviewPassResult | undefined): boolean {
  if (!review) return false;
  if (review.malformed) return true;
  return Boolean(review.parsed?.needsFix || review.parsed?.blockers.length);
}

function formatCodex(label: string, result: CodexExecutionResult): string[] {
  const lines = [`${label}: exit=${result.status ?? "null"}${result.signal ? ` signal=${result.signal}` : ""}${result.error ? ` error=${result.error.message}` : ""}`];
  if (result.stdout.trim()) lines.push(`${label} stdout:\n${result.stdout.trim()}`);
  if (result.stderr.trim()) lines.push(`${label} stderr:\n${result.stderr.trim()}`);
  return lines;
}

function formatVerification(result: VerificationResult): string[] {
  const lines = [`verification: ${result.command} ${result.args.join(" ")} exit=${result.exitCode ?? "null"}${result.signal ? ` signal=${result.signal}` : ""}${result.timedOut ? " timedOut=true" : ""}`];
  if (result.stdout.trim()) lines.push(`verification stdout:\n${result.stdout.trim()}`);
  if (result.stderr.trim()) lines.push(`verification stderr:\n${result.stderr.trim()}`);
  return lines;
}

function formatReview(review: ReviewPassResult | undefined): string[] {
  if (!review) return [];
  const lines = formatCodex("review", review.execution);
  if (review.malformed) lines.push(`review blocked: malformed review JSON (${review.malformed})`);
  if (review.parsed) {
    lines.push(`review summary: ${review.parsed.summary}`);
    lines.push(`review needsFix: ${review.parsed.needsFix}`);
    if (review.parsed.blockers.length) lines.push(`review blockers:\n${review.parsed.blockers.map((b) => `- ${b}`).join("\n")}`);
    if (review.parsed.warnings.length) lines.push(`review warnings:\n${review.parsed.warnings.map((w) => `- ${w}`).join("\n")}`);
  }
  return lines;
}

async function runVerificationIfConfigured(run: PreparedRun): Promise<VerificationResult | undefined> {
  if (!run.verification) return undefined;
  return await runVerificationCommand(run.verification, { cwd: run.projectRoot });
}

function blockedAfter(implementation: CodexExecutionResult, verification?: VerificationResult, review?: ReviewPassResult): boolean {
  return executionFailed(implementation) || Boolean(verification && verificationFailed(verification)) || reviewFailed(review);
}

export async function executeRunLifecycle(run: PreparedRun): Promise<RunLifecycleResult> {
  const output: string[] = [];
  const implementation = executeCodexRun(run);
  output.push(...formatCodex("implementation", implementation));

  let verification: VerificationResult | undefined;
  let review: ReviewPassResult | undefined;
  if (!executionFailed(implementation)) {
    verification = await runVerificationIfConfigured(run);
    if (verification) output.push(...formatVerification(verification));
    if (!verification || !verificationFailed(verification)) {
      review = runReviewPass(run, output.join("\n\n"));
      output.push(...formatReview(review));
    }
  }

  const fixPasses: FixPassResult[] = [];
  let blocked = blockedAfter(implementation, verification, review);
  while (blocked && run.fixPrompt && fixPasses.length < run.maxFixPasses) {
    const pass = fixPasses.length + 1;
    const fixExecution = executeCodexPromptSync(run, `${run.fixPrompt}\n\n# Previous run summary\n\n${output.join("\n\n")}\n`);
    output.push(...formatCodex(`fix pass ${pass}`, fixExecution));
    let fixVerification: VerificationResult | undefined;
    let fixReview: ReviewPassResult | undefined;
    if (!executionFailed(fixExecution)) {
      fixVerification = await runVerificationIfConfigured(run);
      if (fixVerification) output.push(...formatVerification(fixVerification));
      if (!fixVerification || !verificationFailed(fixVerification)) {
        fixReview = runReviewPass(run, output.join("\n\n"));
        output.push(...formatReview(fixReview));
      }
    }
    fixPasses.push({ pass, execution: fixExecution, verification: fixVerification, review: fixReview });
    blocked = executionFailed(fixExecution) || Boolean(fixVerification && verificationFailed(fixVerification)) || reviewFailed(fixReview);
  }

  if (blocked && run.fixPrompt && fixPasses.length >= run.maxFixPasses) output.push(`blocked: reached max fix passes (${run.maxFixPasses})`);
  const finalStatus: "done" | "blocked" = blocked ? "blocked" : "done";
  output.push(`final status: ${finalStatus}`);
  return { implementation, verification, review, fixPasses, finalStatus, output: output.join("\n\n") };
}

let runSequence = 0;

export function prepareRun(roleInput: string, options: RunOptions, cwd = process.cwd()): PreparedRun {
  if (!isStudioRoleId(roleInput)) throw new Error(unknownStudioRoleMessage(roleInput));
  const role = roleInput as StudioRoleId;
  const task = requireTask(options.task);
  const projectRoot = resolveProjectRoot(options.project, cwd);
  const studio = readStudioProject(projectRoot);
  if (isEngineSpecialistRoleId(role) && !projectRoleIdsForEngine(studio.engine).includes(role)) {
    throw new Error(`${role} is not available for ${studio.engine} projects; use ${studio.engine}-specialist for this project.`);
  }
  const artifactRefs = (options.includeArtifact ?? []).map((artifact) => {
    const { full, display } = safeArtifact(projectRoot, artifact);
    return { full, display };
  });
  const artifactDisplays = artifactRefs.map((artifact) => artifact.display);
  const contextRequests: ContextRequestEntry[] = [
    { sourcePath: "AGENTS.md", reason: "project instructions", required: true },
    { sourcePath: ".codex/studio.json", reason: "project state", required: true },
    { sourcePath: `.codex/prompts/${role}.md`, reason: "selected role prompt", required: true },
    ...artifactDisplays.map((display) => ({ sourcePath: display, reason: "included artifact", required: true })),
    ...(options.allowBroadContext ? broadContextRequests() : [])
  ];
  const contextSelection = selectContextEntries(projectRoot, contextRequests);
  const contextFilesForRun = contextFiles(contextSelection.entries);
  const selectedContextFiles = new Set(contextFilesForRun);
  const artifactBodies = artifactRefs
    .filter((artifact) => selectedContextFiles.has(artifact.display))
    .map((artifact) => `\n\n# Included Artifact: ${artifact.display}\n\n${readFileSync(artifact.full, "utf8")}`);
  const maxFixPasses = options.maxFixPasses ?? 1;
  if (!Number.isFinite(maxFixPasses) || maxFixPasses < 0) throw new Error("--max-fix-passes must be a finite non-negative number");
  const phase = phaseForRun(role);
  const approvalScopes = normalizeApprovalScope(options.approvalScope ?? [], { projectRoot });
  const approvalDiagnosticResult = explainApprovalMismatch(readApprovalStore(projectRoot), {
    role,
    objective: task,
    approvedGlobs: approvalScopes,
    approvedFiles: artifactDisplays.length ? artifactDisplays : undefined,
    projectStage: studio.mode,
    studioMode: studio.studioMode
  });
  const eligibility = evaluateStudioRunEligibility({
    projectStage: studio.mode,
    studioMode: studio.studioMode,
    phase,
    hasMatchingApproval: approvalDiagnosticResult.matched,
    approvedByUser: options.approvedByUser,
    constrainedSandbox: options.constrainedSandbox
  });
  if (!eligibility.allowed && !options.printPrompt && !options.dryRun) {
    throw new Error(eligibility.reason);
  }
  const session = createCodexStudioSession({
    projectRoot,
    role,
    objective: task,
    phase,
    engine: studio.engine,
    contextFiles: contextFilesForRun,
    verification: options.verifyCommand,
    allowFileEdits: eligibility.allowFileEdits,
    sandbox: eligibility.codexSandbox,
    writePolicy: eligibility.writePolicy,
    eligibility
  });
  const runtimeContextBlock = renderRuntimeContextBlock(role, projectRoot, task);
  const prompt = `${renderCodexPrompt({
    ...session,
    contextContract: renderContextContract({
      session,
      projectStage: studio.mode,
      studioMode: studio.studioMode,
      entries: contextSelection.entries
    })
  })}${runtimeContextBlock}${artifactBodies.join("")}`;
  const reviewObjective = `Review the implementation for: ${task}. Inspect the diff and verification output. Return only JSON with blockers, warnings, summary, and needsFix.`;
  const reviewSelection = selectContextEntries(projectRoot, [
    { sourcePath: "AGENTS.md", reason: "project instructions", required: true },
    { sourcePath: ".codex/studio.json", reason: "project state", required: true },
    { sourcePath: ".codex/prompts/qa-playtester.md", reason: "review role prompt", required: true },
    ...contextSelection.selected.map((entry) => ({ sourcePath: entry.sourcePath, reason: `implementation context: ${entry.reason}`, required: entry.required }))
  ]);
  const reviewSession = createCodexStudioSession({
    projectRoot,
    role: "qa-playtester",
    objective: reviewObjective,
    phase: "review",
    engine: studio.engine,
    contextFiles: contextFiles(reviewSelection.entries),
    expectedOutputs: ["Review JSON", "Blockers", "Warnings"],
    allowFileEdits: false,
    sandbox: "read-only",
    writePolicy: "read-only",
    reviewMode: "diff"
  });
  const reviewPrompt = options.review
    ? `${renderCodexPrompt({
        ...reviewSession,
        contextContract: renderContextContract({
          session: reviewSession,
          projectStage: studio.mode,
          studioMode: studio.studioMode,
          entries: reviewSelection.entries,
          readOnlyReview: true
        })
      })}${renderRuntimeContextBlock("qa-playtester", projectRoot, reviewObjective)}`
    : undefined;
  const fixSession = createCodexStudioSession({
    projectRoot,
    role,
    objective: `Fix verification failures or review blockers for: ${task}`,
    phase: "fix",
    engine: studio.engine,
    contextFiles: contextFilesForRun,
    verification: options.verifyCommand,
    expectedOutputs: ["Fix changes", "Verification results", "Remaining blockers"],
    allowFileEdits: eligibility.allowFileEdits,
    sandbox: eligibility.codexSandbox,
    writePolicy: eligibility.writePolicy,
    eligibility
  });
  const fixPrompt =
    options.fix && maxFixPasses > 0
      ? `${renderCodexPrompt({
          ...fixSession,
          contextContract: renderContextContract({
            session: fixSession,
            projectStage: studio.mode,
            studioMode: studio.studioMode,
            entries: contextSelection.entries,
            blockers: ["Review and verification blockers will be supplied at execution time."]
          })
        })}${runtimeContextBlock}`
      : undefined;
  const runId = `${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17)}-${process.pid}-${++runSequence}`;
  const runDir = path.join(projectRoot, ".codex", "runs", `${runId}-${role}`);
  const promptPath = path.join(runDir, "prompt.md");
  const metadataPath = path.join(runDir, "metadata.json");
  if (!options.printPrompt && !options.dryRun) {
    mkdirSync(runDir, { recursive: true });
    writeFileSync(promptPath, prompt);
    writeFileSync(
      metadataPath,
      `${JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          product: "codex-game-studio",
          project: path.relative(cwd, projectRoot) || ".",
          role,
          task,
          prompt_chars: prompt.length,
          prompt_cache_path: path.relative(cwd, promptPath),
          review: Boolean(reviewPrompt),
          fix: Boolean(fixPrompt),
          max_fix_passes: maxFixPasses,
          writePolicy: eligibility.writePolicy,
          allowFileEdits: eligibility.allowFileEdits,
          codexSandbox: eligibility.codexSandbox,
          eligibility
        },
        null,
        2
      )}\n`
    );
  }
  const codexBin = options.codexBin ?? resolveCodexCommand();
  const codexCommand = codexExecInvocation(projectRoot, codexBin, eligibility.codexSandbox);
  const reviewCodexCommand = reviewPrompt ? codexExecInvocation(projectRoot, codexBin, "read-only") : undefined;
  const dryRunExtra = [
    reviewPrompt ? `\n\nReview Codex command: ${reviewCodexCommand?.display}\n\nReview prompt:\n${reviewPrompt}\n\nExpected review JSON schema: {"blockers":[],"warnings":[],"summary":"","needsFix":false}` : "",
    fixPrompt ? `\n\nFix prompt (max passes: ${maxFixPasses}):\n${fixPrompt}` : ""
  ].join("");
  const approvalDiagnostic =
    options.dryRun && studio.studioMode !== "fast-prototype"
      ? formatApprovalDiagnostic(
          approvalDiagnosticResult,
          { projectStage: studio.mode, studioMode: studio.studioMode, approvalScopes }
        )
      : "";
  const eligibilitySummary = formatEligibility(eligibility);
  const output = options.printPrompt
    ? prompt
    : options.dryRun
      ? `Prompt cache (not written): ${promptPath}\nMetadata (not written): ${metadataPath}\n${eligibilitySummary}\nContext files:\n${contextFilesForRun.map((f) => `- ${f}`).join("\n")}\nCodex command: ${codexCommand.display}${approvalDiagnostic ? `\n\n${approvalDiagnostic}` : ""}${dryRunExtra}`
      : `Prompt cache written: ${promptPath}\n${eligibilitySummary}\nExecuting Codex: ${codexCommand.display}`;
  return { prompt, promptPath, metadataPath, projectRoot, role, task, contextFiles: contextFilesForRun, verification: options.verifyCommand, codexCommand, reviewCodexCommand, output, reviewPrompt, fixPrompt, maxFixPasses, eligibility };
}
