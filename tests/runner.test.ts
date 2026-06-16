import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { initProject } from "../src/projects.js";
import { executeRunLifecycle, prepareRun } from "../src/runner.js";

describe("runner", () => {
  test("inspection modes do not write run cache files", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Inspect Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const runsDir = path.join(projectRoot, ".codex", "runs");
    const before = readdirSync(runsDir);

    const dryRun = prepareRun("gameplay-programmer", { project: projectRoot, task: "Inspect movement", dryRun: true }, cwd);
    const printPrompt = prepareRun("gameplay-programmer", { project: projectRoot, task: "Inspect movement", printPrompt: true }, cwd);

    expect(readdirSync(runsDir)).toEqual(before);
    expect(existsSync(dryRun.promptPath)).toBe(false);
    expect(existsSync(dryRun.metadataPath)).toBe(false);
    expect(existsSync(printPrompt.promptPath)).toBe(false);
    expect(existsSync(printPrompt.metadataPath)).toBe(false);
  });

  test("strict studio blocks unapproved mutating role runs before run metadata writes", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-strict-"));
    const { projectRoot } = initProject({ name: "Strict Game", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, cwd);
    const runsDir = path.join(projectRoot, ".codex", "runs");
    const before = readdirSync(runsDir);

    expect(() => prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", codexBin: path.join(cwd, "missing-codex") }, cwd)).toThrow(
      /matching approval/i
    );

    expect(readdirSync(runsDir)).toEqual(before);
  });

  test("guided override and fast prototype record provenance metadata for allowed runs", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-policy-"));
    const guided = initProject({ name: "Guided Game", engine: "godot", mode: "prototype", studioMode: "guided-studio", nonInteractive: true }, cwd);
    const guidedDryRun = prepareRun("gameplay-programmer", { project: guided.projectRoot, task: "Implement movement", dryRun: true, approvedByUser: true }, cwd);
    expect(guidedDryRun.output).toContain("Write policy: override-write");
    expect(guidedDryRun.output).toContain("Sandbox: danger-full-access");
    expect(guidedDryRun.output).toContain("Provenance: override");
    expect(guidedDryRun.output).toContain("Approved by user: true");

    const guidedRun = prepareRun("gameplay-programmer", { project: guided.projectRoot, task: "Implement movement", approvedByUser: true, codexBin: path.join(cwd, "missing-codex") }, cwd);
    const guidedMetadata = JSON.parse(readFileSync(guidedRun.metadataPath, "utf8")) as { eligibility: { writePolicy: string; codexSandbox: string; metadata: { provenance: string; approvedByUser: boolean } } };
    expect(guidedMetadata.eligibility).toMatchObject({
      writePolicy: "override-write",
      codexSandbox: "danger-full-access",
      metadata: { provenance: "override", approvedByUser: true }
    });

    const fast = initProject({ name: "Fast Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);
    const fastRun = prepareRun("gameplay-programmer", { project: fast.projectRoot, task: "Implement movement", codexBin: path.join(cwd, "missing-codex") }, cwd);
    const fastMetadata = JSON.parse(readFileSync(fastRun.metadataPath, "utf8")) as { eligibility: { writePolicy: string; metadata: { provenance: string } } };
    expect(fastRun.output).toContain("Write policy: advisory-write");
    expect(fastMetadata.eligibility).toMatchObject({ writePolicy: "advisory-write", metadata: { provenance: "advisory" } });
  });

  test("mutating runs default to full access and require explicit constrained sandbox for workspace-write", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-sandbox-"));
    const { projectRoot } = initProject({ name: "Sandbox Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);

    const defaultRun = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", dryRun: true }, cwd);
    expect(defaultRun.codexCommand.args).toEqual(expect.arrayContaining(["--sandbox", "danger-full-access"]));
    expect(defaultRun.prompt).toContain("Sandbox: danger-full-access");
    expect(defaultRun.prompt).toContain("Write Policy: advisory-write");

    const constrainedRun = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", dryRun: true, constrainedSandbox: true }, cwd);
    expect(constrainedRun.codexCommand.args).toEqual(expect.arrayContaining(["--sandbox", "workspace-write"]));
  });

  test("inlines generated project role prompt", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Prompt Game", engine: "godot", mode: "design", nonInteractive: true }, cwd);
    const promptPath = path.join(projectRoot, ".codex", "prompts", "market-analyst.md");
    writeFileSync(promptPath, `${readFileSync(promptPath, "utf8")}\nUNIQUE_PROJECT_PROMPT_SENTINEL\n`);

    const run = prepareRun("market-analyst", { project: projectRoot, task: "Assess competitors", printPrompt: true }, cwd);

    expect(run.prompt).toContain("# Project Role Prompt: .codex/prompts/market-analyst.md");
    expect(run.prompt).toContain("UNIQUE_PROJECT_PROMPT_SENTINEL");
    expect(run.contextFiles).toContain(".codex/prompts/market-analyst.md");
  });

  test("missing generated project role prompt fails clearly", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Missing Prompt Game", engine: "godot", mode: "design", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, ".codex", "prompts", "market-analyst.md"));

    expect(() => prepareRun("market-analyst", { project: projectRoot, task: "Assess competitors", printPrompt: true }, cwd)).toThrow(
      "Missing generated project role prompt: .codex/prompts/market-analyst.md"
    );
  });

  test("wrong-engine specialist run fails clearly before producing a prompt", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-specialist-"));
    const { projectRoot } = initProject({ name: "Godot Specialist Run", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    expect(() => prepareRun("unity-specialist", { project: projectRoot, task: "Review engine setup", printPrompt: true }, cwd)).toThrow(
      /unity-specialist is not available for godot projects/i
    );

    const run = prepareRun("godot-specialist", { project: projectRoot, task: "Review engine setup", printPrompt: true }, cwd);
    expect(run.prompt).toContain("# Project Role Prompt: .codex/prompts/godot-specialist.md");
    expect(run.prompt).toContain("docs/engine-reference/godot/specialist.md");
  });

  test("fix prompt includes project role prompt", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Fix Prompt Game", engine: "godot", mode: "design", nonInteractive: true }, cwd);

    const run = prepareRun("market-analyst", { project: projectRoot, task: "Assess competitors", dryRun: true, fix: true }, cwd);

    expect(run.fixPrompt).toContain("# Project Role Prompt: .codex/prompts/market-analyst.md");
  });

  test("role runs inline selected templates", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-run-template-"));
    const { projectRoot } = initProject({ name: "Template Run Game", engine: "godot", mode: "design", nonInteractive: true }, cwd);

    const market = prepareRun("market-analyst", { project: projectRoot, task: "Assess positioning", printPrompt: true }, cwd);
    expect(market.prompt).toContain("## Selected Templates");
    expect(market.prompt).toContain("Template: market_analysis");
    expect(market.prompt).toContain("Source: package:templates/market_analysis_template.md");
    expect(market.prompt).not.toContain("Template: analytics_setup");

    const analytics = prepareRun("data-scientist", { project: projectRoot, task: "Plan evidence loop", printPrompt: true }, cwd);
    expect(analytics.prompt).toContain("Template: analytics_setup");
    expect(analytics.prompt).not.toContain("Template: market_analysis");

    const gameplay = prepareRun("gameplay-programmer", { project: projectRoot, task: "Tune movement", printPrompt: true }, cwd);
    expect(gameplay.prompt).not.toContain("Template: market_analysis");
    expect(gameplay.prompt).not.toContain("Template: analytics_setup");

    const ui = prepareRun("ui-ux-designer", { project: projectRoot, task: "Review menus", printPrompt: true }, cwd);
    expect(ui.prompt).toContain("Template: ui_ux_review");
    expect(ui.prompt).not.toContain("Template: ship_check");

    const release = prepareRun("release-manager", { project: projectRoot, task: "Assess readiness", dryRun: true, fix: true }, cwd);
    expect(release.prompt).toContain("Template: ship_check");
    expect(release.fixPrompt).toContain("Template: ship_check");
    expect(release.prompt).not.toContain("Template: ui_ux_review");
  });

  test("broad context discovers bounded existing project files", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Broad Context Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const narrow = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", dryRun: true }, cwd);
    expect(narrow.contextFiles).not.toContain("documentation/design/gdd.md");
    expect(narrow.contextFiles).not.toContain("documentation/production/timeline.md");

    const broad = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", dryRun: true, allowBroadContext: true }, cwd);
    expect(broad.contextFiles).toContain("documentation/design/gdd.md");
    expect(broad.contextFiles).toContain("documentation/production/timeline.md");
    expect(broad.contextFiles).toContain("resources/market-research/market-overview.md");
    expect(broad.contextFiles).not.toContain("Broad context explicitly allowed by CLI flag.");
    expect(broad.contextFiles.filter((file) => file.startsWith(".codex/prompts/"))).toHaveLength(1);
  });

  test("broad context ignores directories and realpath escapes", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Bounded Context Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const gdd = path.join(projectRoot, "documentation", "design", "gdd.md");
    rmSync(gdd);
    mkdirSync(gdd);
    const overview = path.join(projectRoot, "resources", "market-research", "market-overview.md");
    const outside = path.join(cwd, "outside.md");
    writeFileSync(outside, "outside");
    rmSync(overview);
    symlinkSync(outside, overview);

    const broad = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", dryRun: true, allowBroadContext: true }, cwd);

    expect(broad.contextFiles).not.toContain("documentation/design/gdd.md");
    expect(broad.contextFiles).not.toContain("resources/market-research/market-overview.md");
  });

  test("include artifact renders canonical project-relative paths", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-"));
    const { projectRoot } = initProject({ name: "Artifact Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const run = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", printPrompt: true, includeArtifact: ["documentation/design/../design/gdd.md"] }, cwd);

    expect(run.contextFiles).toContain("documentation/design/gdd.md");
    expect(run.prompt).toContain("# Included Artifact: documentation/design/gdd.md");
    expect(() => prepareRun("producer", { project: projectRoot, task: "Plan next milestone", printPrompt: true, includeArtifact: ["documentation/design/gdd.md\n# injected"] }, cwd)).toThrow(
      "--include-artifact cannot contain control characters"
    );
  });

  test("rejected included artifacts are not embedded in prompts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-artifact-rejected-"));
    const { projectRoot } = initProject({ name: "Rejected Artifact Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    mkdirSync(path.join(projectRoot, "dist"), { recursive: true });
    writeFileSync(path.join(projectRoot, "dist", "bundle.js"), "REJECTED_BUNDLE_BODY");

    const run = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", printPrompt: true, includeArtifact: ["dist/bundle.js"] }, cwd);

    expect(run.contextFiles).not.toContain("dist/bundle.js");
    expect(run.prompt).toContain("- dist/bundle.js: rejected");
    expect(run.prompt).not.toContain("# Included Artifact: dist/bundle.js");
    expect(run.prompt).not.toContain("REJECTED_BUNDLE_BODY");
  });

  test("oversized included artifacts are not embedded in prompts", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-runner-artifact-oversized-"));
    const { projectRoot } = initProject({ name: "Oversized Artifact Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const artifactPath = path.join(projectRoot, "documentation", "design", "large-artifact.md");
    writeFileSync(artifactPath, `OVERSIZED_ARTIFACT_BODY\n${"x".repeat(20_000)}`);

    const run = prepareRun("producer", { project: projectRoot, task: "Plan next milestone", printPrompt: true, includeArtifact: ["documentation/design/large-artifact.md"] }, cwd);

    expect(run.contextFiles).not.toContain("documentation/design/large-artifact.md");
    expect(run.prompt).toContain("- documentation/design/large-artifact.md: omitted");
    expect(run.prompt).not.toContain("# Included Artifact: documentation/design/large-artifact.md");
    expect(run.prompt).not.toContain("OVERSIZED_ARTIFACT_BODY");
  });

  test("review passes execute Codex with a read-only sandbox", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-review-"));
    const { projectRoot } = initProject({ name: "Review Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);
    const log = path.join(cwd, "codex-invocations.jsonl");
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(
      stub,
      `#!/usr/bin/env node
import { appendFileSync, readFileSync } from "node:fs";
const input = readFileSync(0, "utf8");
appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args: process.argv.slice(2), input }) + "\\n");
console.log(JSON.stringify({ blockers: [], warnings: [], summary: "ok", needsFix: false }));
`
    );
    chmodSync(stub, 0o755);

    const run = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", review: true, codexBin: stub }, cwd);
    await executeRunLifecycle(run);

    const invocations = readFileSync(log, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { args: string[]; input: string });
    expect(invocations).toHaveLength(2);
    expect(invocations[0].args).toEqual(expect.arrayContaining(["--sandbox", "danger-full-access"]));
    expect(invocations[1].args).toEqual(expect.arrayContaining(["--sandbox", "read-only"]));
    expect(invocations[1].input).toContain("# Project Role Prompt: .codex/prompts/qa-playtester.md");
    expect(invocations[1].input).toContain("Template: playtest_report");
  });

  test("implementation, review, and fix prompts share a bounded Context Contract", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-contract-"));
    const { projectRoot } = initProject({ name: "Contract Game", engine: "godot", mode: "prototype", studioMode: "fast-prototype", nonInteractive: true }, cwd);

    const run = prepareRun("gameplay-programmer", { project: projectRoot, task: "Implement movement", dryRun: true, review: true, fix: true }, cwd);

    for (const prompt of [run.prompt, run.reviewPrompt, run.fixPrompt]) {
      expect(prompt).toContain("# Context Contract");
      expect(prompt).toContain("Project Stage: prototype");
      expect(prompt).toContain("Studio Mode: fast-prototype");
      expect(prompt).toMatch(/Phase: (implement|review|fix)/);
      expect(prompt).toContain("Write Policy:");
      expect(prompt).toContain("Sandbox:");
      expect(prompt).toContain("File Edits:");
      expect(prompt).toContain("Selected Context:");
      expect(prompt).toContain("- AGENTS.md (required; project instructions)");
      expect(prompt).toContain("Omissions and Blockers:");
    }
    expect(run.reviewPrompt).toContain("Read-only review: inspect diff and verification output; do not edit files.");
    expect(run.reviewPrompt).toContain(".codex/prompts/qa-playtester.md");
    expect(run.fixPrompt).toContain("Bounded Blockers:");
    expect(run.fixPrompt).toContain("- Review and verification blockers will be supplied at execution time.");
  });
});
