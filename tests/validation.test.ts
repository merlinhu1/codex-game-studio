import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { projectRolePromptSourceInput } from "../src/agents.js";
import { packageAssetPath } from "../src/paths.js";
import { freezeProject, initProject } from "../src/projects.js";
import { workflowSourceInput } from "../src/projects.js";
import { runValidation, validateProject } from "../src/validation.js";
import { hashGeneratedBody, stableHash, stripGeneratedMetadata } from "../src/generated-surfaces.js";
import { loadEngineConfigs } from "../src/engines.js";
import { engineReferenceRegistry } from "../src/engine-reference.js";
import { rolePackages } from "../src/roles.js";
import { behavioralEvaluationScenarios } from "../src/behavioral-evaluation.js";

const validApprovalRecord = {
  id: "appr_test",
  stage: "approved",
  role: "gameplay-programmer",
  objectiveSha256: "0".repeat(64),
  approvedGlobs: ["src/**/*.ts"],
  source: "draft-workflow",
  approvedBy: "designer",
  approvedAt: "2026-06-13T00:00:00.000Z"
};

describe("validation", () => {
  test("package exposes codex-game-studio as the canonical installed CLI", () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as { name?: string; bin?: Record<string, string> };
    expect(pkg.name).toBe("codex-game-studio");
    expect(pkg.bin?.["codex-game-studio"]).toBe("./dist/cli.js");
    expect(Object.keys(pkg.bin ?? {})).toEqual(["codex-game-studio"]);
  });

  test("source checkout wrapper uses built dist output instead of a generated bundle", () => {
    const wrapper = readFileSync(path.join(process.cwd(), "codex-game-studio"), "utf8");
    expect(wrapper).toContain("dist/cli.js");
    expect(wrapper).toContain("npm install && npm run build");
    expect(wrapper).not.toContain("bin/codex-game-studio.mjs");
  });

  test("fresh initialized projects validate and failures are explicit", () => {
    for (const [name, engine, mode] of [
      ["Godot Val", "godot", "prototype"],
      ["Unity Val", "unity", "design"],
      ["Unreal Val", "ue5", "development"]
    ] as const) {
      const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
      const { projectRoot } = initProject({ name, engine, mode, nonInteractive: true }, cwd);
      expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
    }
  });

  test("missing required project artifacts fail", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Broken Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "AGENTS.md"));
    rmSync(path.join(projectRoot, "src", "project.godot"));
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.agents_md");
    expect(failures.map((f) => f.id)).toContain("project.engine_file");
  });

  test("malformed AGENTS contract and prompt files fail validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Prompt Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, "AGENTS.md"), "# Broken\n");
    writeFileSync(path.join(projectRoot, ".codex", "prompts", "producer.md"), "");
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("codex.project.AGENTS.md.## Project Goal");
    expect(failures.map((f) => f.id)).toContain("codex.prompt.producer");
  });

  test("empty timeline sections fail validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Timeline Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      path.join(projectRoot, "production", "timeline.md"),
      "# Timeline\n\nTBD\n\n# Milestones\n\n# Risks\n\n- Scope risk.\n\n# Next Validation Gate\n\nRun validation.\n"
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.timeline.# Milestones");
  });

  test("Unity validation fails when ProjectSettings marker is missing", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Broken Unity", engine: "unity", mode: "design", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "src", "ProjectSettings", "ProjectSettings.asset"));
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.engine_settings");
  });

  test("invalid studio json fails", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Stale Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, ".codex", "studio.json"), "{ invalid json");
    expect(validateProject(projectRoot)[0].status).toBe("fail");
  });

  test("invalid studio mode fails project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Studio Mode Val", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, cwd);
    const studioPath = path.join(projectRoot, ".codex", "studio.json");
    const studio = JSON.parse(readFileSync(studioPath, "utf8"));
    studio.studioMode = "ceremony-platform";
    writeFileSync(studioPath, `${JSON.stringify(studio, null, 2)}\n`);
    expect(validateProject(projectRoot)[0]).toEqual(
      expect.objectContaining({
        id: "codex.project.studio",
        status: "fail",
        message: expect.stringMatching(/studioMode/i)
      })
    );
  });

  test("malformed approval store fails project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Approval Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      path.join(projectRoot, ".codex", "approvals.json"),
      `${JSON.stringify({ schemaVersion: 1, product: "codex-game-studio", records: [{ id: "bad", stage: "approved", approvedGlobs: ["../escape.ts"] }] }, null, 2)}\n`
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures).toContainEqual(
      expect.objectContaining({
        id: "codex.project.approvals",
        message: expect.stringMatching(/approval store invalid/i)
      })
    );
  });

  test("context manifest schema and stale freshness metadata fail project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Manifest Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    writeFileSync(path.join(projectRoot, ".codex", "context-manifest.json"), "{ invalid json");
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.project.context_manifest", message: expect.stringMatching(/invalid JSON/i) })
    );

    const { projectRoot: staleProject } = initProject({ name: "Stale Manifest Val", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const metaPath = path.join(staleProject, ".codex", "context-manifest.meta.json");
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    meta.studioMode = "guided-studio";
    meta.manifestSha256 = "0".repeat(64);
    writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

    const failures = validateProject(staleProject).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("codex.project.context_manifest.freshness");
  });

  test("approval store symlink escape fails project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Approval Symlink Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const outside = mkdtempSync(path.join(tmpdir(), "ogs-outside-"));
    mkdirSync(path.join(projectRoot, "source"), { recursive: true });
    symlinkSync(outside, path.join(projectRoot, "source", "outside-link"));
    writeFileSync(
      path.join(projectRoot, ".codex", "approvals.json"),
      `${JSON.stringify({ schemaVersion: 1, product: "codex-game-studio", records: [{ ...validApprovalRecord, approvedGlobs: ["source/outside-link/file.ts"] }] }, null, 2)}\n`
    );

    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures).toContainEqual(
      expect.objectContaining({
        id: "codex.project.approvals",
        message: expect.stringMatching(/symlink outside project/i)
      })
    );
  });

  test("freeze status-only changes keep project validation green", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Freeze Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    freezeProject(projectRoot, cwd);
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
  });

  test("engine reference validation covers package metadata and project materialization", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-engine-reference-"));
    const { projectRoot } = initProject({ name: "Unity Reference Valid", engine: "unity", mode: "prototype", nonInteractive: true }, cwd);

    for (const file of [...engineReferenceRegistry.unity.requiredFiles, ...engineReferenceRegistry.unity.moduleFiles, ...engineReferenceRegistry.unity.pluginFiles]) {
      expect(existsSync(path.join(projectRoot, engineReferenceRegistry.unity.projectPath(file)))).toBe(true);
    }
    expect(existsSync(path.join(projectRoot, "docs", "engine-reference", "unreal", "VERSION.md"))).toBe(false);

    const checks = validateProject(projectRoot);
    expect(checks.filter((c) => c.id.startsWith("engine_reference.") && c.status === "fail")).toEqual([]);
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.package.unity.VERSION.md.metadata", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.package.unity.modules/networking.md.metadata", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.project.unity.VERSION.md", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.project.unity.modules/networking.md", status: "pass" }));
  });

  test("missing materialized engine reference fails project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-engine-reference-"));
    const { projectRoot } = initProject({ name: "Broken Reference Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "docs", "engine-reference", "godot", "plugins.md"));

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "engine_reference.project.godot.plugins.md" })
    );
  });

  test("wrong-engine specialist prompts are absent and active specialist prompt is validated", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-specialist-"));
    const { projectRoot } = initProject({ name: "Godot Specialist Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
    rmSync(path.join(projectRoot, ".codex", "prompts", "godot-specialist.md"));

    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("codex.role.godot-specialist.prompt.exists");
    expect(failures.map((f) => f.id)).not.toContain("codex.role.unity-specialist.prompt.exists");
  });

  test("validation fails when wrong-engine specialist prompts are materialized", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-specialist-"));
    const { projectRoot } = initProject({ name: "Wrong Specialist Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, ".codex", "prompts", "unity-specialist.md"), "# Wrong specialist\n");

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.role.unity-specialist.prompt.absent" })
    );
  });

  test("generated surface hashes are stable for object key order", () => {
    expect(stableHash({ b: 2, a: { d: 4, c: 3 } })).toBe(stableHash({ a: { c: 3, d: 4 }, b: 2 }));
  });

  test("generated surface validation detects freshness, body tampering, and legacy metadata", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Freshness Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const rolePrompt = path.join(projectRoot, ".codex", "prompts", "market-analyst.md");
    writeFileSync(rolePrompt, readFileSync(rolePrompt, "utf8").replace(/source-input-sha256: [a-f0-9]+/, "source-input-sha256: bad"));
    expect(validateProject(projectRoot).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.freshness");

    const { projectRoot: bodyProject } = initProject({ name: "Body Freshness Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const bodyPrompt = path.join(bodyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(bodyPrompt, `${readFileSync(bodyPrompt, "utf8")}\nTampered body.\n`);
    expect(validateProject(bodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: metadataBodyProject } = initProject({ name: "Metadata Body Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const metadataBodyPrompt = path.join(metadataBodyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(metadataBodyPrompt, `${readFileSync(metadataBodyPrompt, "utf8")}\n<!-- source-input-sha256: deadbeef -->\n`);
    expect(validateProject(metadataBodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: rendererProject } = initProject({ name: "Renderer Drift Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const rendererPrompt = path.join(rendererProject, ".codex", "prompts", "market-analyst.md");
    const changedBody = readFileSync(rendererPrompt, "utf8").replace("# Market Analyst", "# Market Research Analyst");
    const changedHash = hashGeneratedBody(stripGeneratedMetadata(changedBody));
    writeFileSync(rendererPrompt, changedBody.replace(/rendered-body-sha256: [a-f0-9]+/, `rendered-body-sha256: ${changedHash}`));
    expect(validateProject(rendererProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: workflowProject } = initProject({ name: "Workflow Freshness Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const workflow = path.join(workflowProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(workflow, readFileSync(workflow, "utf8").replace(/source-input-sha256: [a-f0-9]+/, "source-input-sha256: bad"));
    expect(validateProject(workflowProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.workflow.ui-ux-review.freshness");

    const { projectRoot: workflowBodyProject } = initProject({ name: "Workflow Body Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const workflowBody = path.join(workflowBodyProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(workflowBody, `${readFileSync(workflowBody, "utf8")}\nTampered workflow body.\n`);
    expect(validateProject(workflowBodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.workflow.ui-ux-review.body");

    const { projectRoot: legacyProject } = initProject({ name: "Legacy Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const legacyPrompt = path.join(legacyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(legacyPrompt, readFileSync(legacyPrompt, "utf8").replace(/^<!-- .* -->\n/gm, ""));
    const legacyChecks = validateProject(legacyProject);
    expect(legacyChecks).toContainEqual(expect.objectContaining({ id: "codex.role.market-analyst.prompt.freshness", status: "skip" }));
    expect(legacyChecks.filter((c) => c.status === "fail").map((c) => c.id)).not.toContain("codex.role.market-analyst.prompt.freshness");
  });

  test("generated surface validation fails malformed metadata without treating it as legacy", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));

    const { projectRoot: malformedProject } = initProject({ name: "Malformed Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const malformedPrompt = path.join(malformedProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(malformedPrompt, readFileSync(malformedPrompt, "utf8").replace(/^<!-- generated-by: codex-game-studio surface=.* -->\n/m, "<!-- generated-by: codex-game-studio -->\n"));
    const malformedFailures = validateProject(malformedProject).filter((c) => c.status === "fail").map((c) => c.id);
    expect(malformedFailures).toContain("codex.role.market-analyst.prompt.freshness");

    const { projectRoot: partialProject } = initProject({ name: "Partial Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const partialWorkflow = path.join(partialProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(partialWorkflow, readFileSync(partialWorkflow, "utf8").replace(/^<!-- rendered-body-sha256: .* -->\n/m, ""));
    const partialFailures = validateProject(partialProject).filter((c) => c.status === "fail").map((c) => c.id);
    expect(partialFailures).toContain("codex.workflow.ui-ux-review.body");

    const { projectRoot: legacyProject } = initProject({ name: "Commentless Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
    const legacyPrompt = path.join(legacyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(legacyPrompt, readFileSync(legacyPrompt, "utf8").replace(/^<!-- .* -->\n/gm, ""));
    expect(validateProject(legacyProject)).toContainEqual(expect.objectContaining({ id: "codex.role.market-analyst.prompt.freshness", status: "skip" }));
  });

  test("generated surface source input covers rendered engine and role display fields", () => {
    const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
    const config = initProject({ name: "Hash Coverage Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-"))).config;
    const baseRoleHash = stableHash(projectRolePromptSourceInput("market-analyst", config, engines));
    const renamedEngines = { ...engines, godot: { ...engines.godot, display_name: "Renamed Godot" } };
    expect(stableHash(projectRolePromptSourceInput("market-analyst", config, renamedEngines))).not.toBe(baseRoleHash);

    const baseWorkflowHash = stableHash(workflowSourceInput("ui-ux-review"));
    const originalName = rolePackages["ui-ux-designer"].displayName;
    rolePackages["ui-ux-designer"].displayName = "Renamed UI UX Designer";
    try {
      expect(stableHash(workflowSourceInput("ui-ux-review"))).not.toBe(baseWorkflowHash);
    } finally {
      rolePackages["ui-ux-designer"].displayName = originalName;
    }
  });

  test("repo validation includes deterministic behavioral evaluation subchecks", async () => {
    const result = await runValidation();
    const checks = result.checks.filter((check) => check.id.startsWith("behavioral.scenario."));

    expect(checks.map((check) => check.id)).toEqual(behavioralEvaluationScenarios.map((scenario) => `behavioral.scenario.${scenario.id}`));
    expect(checks.every((check) => check.status === "pass")).toBe(true);
  });

  test("repo validation reports Codex readiness hard failure when unavailable", async () => {
    const old = process.env.CODEX_BIN;
    process.env.CODEX_BIN = "/missing/codex";
    try {
      const result = await runValidation();
      expect(result.checks.some((c) => c.id === "codex.cli" && c.status === "fail")).toBe(true);
      expect(result.failed).toBe(true);
    } finally {
      if (old === undefined) delete process.env.CODEX_BIN;
      else process.env.CODEX_BIN = old;
    }
  });
});
