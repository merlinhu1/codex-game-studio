import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { projectRolePromptSourceInput } from "../src/agents.js";
import { packageAssetPath } from "../src/paths.js";
import { freezeProject, initProject } from "../src/projects.js";
import { workflowSourceInput } from "../src/projects.js";
import { runValidation, validateProject } from "../src/validation.js";
import { stableHash } from "../src/generated-surfaces.js";
import { loadEngineConfigs } from "../src/engines.js";
import { engineReferenceRegistry } from "../src/engine-reference.js";
import { rolePackages } from "../src/roles.js";
import { behavioralEvaluationScenarios } from "../src/behavioral-evaluation.js";


function seedTemplateRoot(root: string): void {
  for (const entry of ["AGENTS.md", ".codex/agents", ".codex/workflows", ".agents/skills"]) {
    cpSync(path.join(process.cwd(), entry), path.join(root, entry), { recursive: true });
  }
}

function initTemplateProject(options: Parameters<typeof initProject>[0], cwd = mkdtempSync(path.join(tmpdir(), "ogs-template-project-"))): ReturnType<typeof initProject> {
  seedTemplateRoot(cwd);
  return initProject(options, cwd);
}

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
      const { projectRoot } = initTemplateProject({ name, engine, mode, nonInteractive: true }, cwd);
      expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
    }
  });

  test("missing required project artifacts fail", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Broken Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "AGENTS.md"));
    rmSync(path.join(projectRoot, "src", "project.godot"));
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.agents_md");
    expect(failures.map((f) => f.id)).toContain("project.engine_file");
  });

  test("malformed AGENTS contract and custom agent files fail validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Prompt Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, "AGENTS.md"), "# Broken\n");
    writeFileSync(path.join(projectRoot, ".codex", "agents", "producer.toml"), "");
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("codex.project.AGENTS.md.## Project Goal");
    expect(failures.map((f) => f.id)).toContain("codex.agent.producer.name");
  });

  test("empty timeline sections fail validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Timeline Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      path.join(projectRoot, "production", "timeline.md"),
      "# Timeline\n\nTBD\n\n# Milestones\n\n# Risks\n\n- Scope risk.\n\n# Next Validation Gate\n\nRun validation.\n"
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.timeline.# Milestones");
  });

  test("Unity validation fails when ProjectSettings marker is missing", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Broken Unity", engine: "unity", mode: "design", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "src", "ProjectSettings", "ProjectSettings.asset"));
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.engine_settings");
  });

  test("invalid studio json fails", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Stale Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, ".codex", "studio.json"), "{ invalid json");
    expect(validateProject(projectRoot)[0].status).toBe("fail");
  });

  test("invalid studio mode fails project validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initTemplateProject({ name: "Studio Mode Val", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, cwd);
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
    const { projectRoot } = initTemplateProject({ name: "Approval Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
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
    const { projectRoot } = initTemplateProject({ name: "Manifest Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    writeFileSync(path.join(projectRoot, ".codex", "context-manifest.json"), "{ invalid json");
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.project.context_manifest", message: expect.stringMatching(/invalid JSON/i) })
    );

    const { projectRoot: staleProject } = initTemplateProject({ name: "Stale Manifest Val", engine: "godot", mode: "prototype", studioMode: "strict-studio", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-")));
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
    const { projectRoot } = initTemplateProject({ name: "Approval Symlink Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
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
    const { projectRoot } = initTemplateProject({ name: "Freeze Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    freezeProject(projectRoot, cwd);
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
  });

  test("engine reference validation covers package metadata and project materialization", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-engine-reference-"));
    const { projectRoot } = initTemplateProject({ name: "Unity Reference Valid", engine: "unity", mode: "prototype", nonInteractive: true }, cwd);

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
    const { projectRoot } = initTemplateProject({ name: "Broken Reference Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "docs", "engine-reference", "godot", "plugins.md"));

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "engine_reference.project.godot.plugins.md" })
    );
  });

  test("tracked template custom agents are validated across engine specialists", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-specialist-"));
    const { projectRoot } = initTemplateProject({ name: "Godot Specialist Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
    rmSync(path.join(projectRoot, ".codex", "agents", "godot-specialist.toml"));

    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("codex.agent.godot-specialist.exists");
    expect(failures.map((f) => f.id)).not.toContain("codex.agent.unity-specialist.absent");
  });

  test("template surface validation detects malformed tracked agents and workflows", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-template-shape-"));
    const { projectRoot } = initTemplateProject({ name: "Template Shape Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);

    const agent = path.join(projectRoot, ".codex", "agents", "producer.toml");
    writeFileSync(agent, readFileSync(agent, "utf8").replace(/developer_instructions\s*=\s*"""[\s\S]*?"""/, "developer_instructions_missing = true"));
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.agent.producer.developer_instructions" })
    );

    const workflowProject = initTemplateProject({ name: "Template Workflow Shape Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-template-shape-"))).projectRoot;
    const workflow = path.join(workflowProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(workflow, readFileSync(workflow, "utf8").replace("## Purpose", "## Removed Purpose"));
    expect(validateProject(workflowProject).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.workflow.ui-ux-review.sections" })
    );
  });

  test("template bodies do not require generated freshness metadata", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-template-metadata-"));
    const { projectRoot } = initTemplateProject({ name: "Template Metadata Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail").map((c) => c.id);

    expect(failures).not.toContain("codex.role.market-analyst.prompt.freshness");
    expect(failures).not.toContain("codex.workflow.ui-ux-review.freshness");
    expect(failures).not.toContain("codex.workflow.ui-ux-review.body");
  });

  test("template skill content markers are validated", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-skill-depth-"));
    const { projectRoot } = initTemplateProject({ name: "Skill Marker Val", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const file = path.join(projectRoot, ".agents", "skills", "cgs-vertical-slice", "SKILL.md");
    const body = readFileSync(file, "utf8");
    const qualityGateStart = body.indexOf("## Quality Gates");
    writeFileSync(file, body.slice(0, qualityGateStart) + body.slice(qualityGateStart).replace("- Validation Question", "- Removed Question"));

    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toContainEqual(
      expect.objectContaining({ id: "codex.skill.cgs-vertical-slice.marker.validation-question" })
    );
  });

  test("template helper source input covers rendered engine and role display fields", () => {
    const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
    const config = initTemplateProject({ name: "Hash Coverage Game", engine: "godot", mode: "prototype", nonInteractive: true }, mkdtempSync(path.join(tmpdir(), "ogs-val-"))).config;
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
