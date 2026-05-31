import { readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { rolePackages } from "../src/roles.js";

describe("validation", () => {
  test("package exposes opengamestudio as the canonical installed CLI", () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as { bin?: Record<string, string> };
    expect(pkg.bin?.opengamestudio).toBe("./dist/cli.js");
    expect(pkg.bin?.["open-gamestudio"]).toBeUndefined();
  });

  test("fresh initialized projects validate and failures are explicit", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    for (const [name, engine, mode] of [
      ["Godot Val", "godot", "prototype"],
      ["Unity Val", "unity", "design"],
      ["Unreal Val", "ue5", "development"]
    ] as const) {
      const { projectRoot } = initProject({ name, engine, mode, nonInteractive: true }, cwd);
      expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
    }
  });

  test("missing required project artifacts fail", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Broken Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "AGENTS.md"));
    rmSync(path.join(projectRoot, "source", "project-broken-game", "project.godot"));
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
      path.join(projectRoot, "documentation", "production", "timeline.md"),
      "# Timeline\n\nTBD\n\n# Milestones\n\n# Risks\n\n- Scope risk.\n\n# Next Validation Gate\n\nRun validation.\n"
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.timeline.# Milestones");
  });

  test("Unity validation fails when ProjectSettings marker is missing", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Broken Unity", engine: "unity", mode: "design", nonInteractive: true }, cwd);
    rmSync(path.join(projectRoot, "source", "project-broken-unity", "ProjectSettings", "ProjectSettings.asset"));
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.engine_settings");
  });

  test("invalid studio json fails", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Stale Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(path.join(projectRoot, ".codex", "studio.json"), "{ invalid json");
    expect(validateProject(projectRoot)[0].status).toBe("fail");
  });

  test("freeze status-only changes keep project validation green", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Freeze Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    freezeProject(projectRoot, cwd);
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
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

    const { projectRoot: bodyProject } = initProject({ name: "Body Freshness Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const bodyPrompt = path.join(bodyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(bodyPrompt, `${readFileSync(bodyPrompt, "utf8")}\nTampered body.\n`);
    expect(validateProject(bodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: metadataBodyProject } = initProject({ name: "Metadata Body Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const metadataBodyPrompt = path.join(metadataBodyProject, ".codex", "prompts", "market-analyst.md");
    writeFileSync(metadataBodyPrompt, `${readFileSync(metadataBodyPrompt, "utf8")}\n<!-- source-input-sha256: deadbeef -->\n`);
    expect(validateProject(metadataBodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: rendererProject } = initProject({ name: "Renderer Drift Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const rendererPrompt = path.join(rendererProject, ".codex", "prompts", "market-analyst.md");
    const changedBody = readFileSync(rendererPrompt, "utf8").replace("# Market Analyst", "# Market Research Analyst");
    const changedHash = hashGeneratedBody(stripGeneratedMetadata(changedBody));
    writeFileSync(rendererPrompt, changedBody.replace(/rendered-body-sha256: [a-f0-9]+/, `rendered-body-sha256: ${changedHash}`));
    expect(validateProject(rendererProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.role.market-analyst.prompt.body");

    const { projectRoot: workflowProject } = initProject({ name: "Workflow Freshness Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const workflow = path.join(workflowProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(workflow, readFileSync(workflow, "utf8").replace(/source-input-sha256: [a-f0-9]+/, "source-input-sha256: bad"));
    expect(validateProject(workflowProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.workflow.ui-ux-review.freshness");

    const { projectRoot: workflowBodyProject } = initProject({ name: "Workflow Body Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const workflowBody = path.join(workflowBodyProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(workflowBody, `${readFileSync(workflowBody, "utf8")}\nTampered workflow body.\n`);
    expect(validateProject(workflowBodyProject).filter((c) => c.status === "fail").map((c) => c.id)).toContain("codex.workflow.ui-ux-review.body");

    const { projectRoot: legacyProject } = initProject({ name: "Legacy Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
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
    writeFileSync(malformedPrompt, readFileSync(malformedPrompt, "utf8").replace(/^<!-- generated-by: open-gamestudio surface=.* -->\n/m, "<!-- generated-by: open-gamestudio -->\n"));
    const malformedFailures = validateProject(malformedProject).filter((c) => c.status === "fail").map((c) => c.id);
    expect(malformedFailures).toContain("codex.role.market-analyst.prompt.freshness");

    const { projectRoot: partialProject } = initProject({ name: "Partial Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const partialWorkflow = path.join(partialProject, ".codex", "workflows", "ui-ux-review.md");
    writeFileSync(partialWorkflow, readFileSync(partialWorkflow, "utf8").replace(/^<!-- rendered-body-sha256: .* -->\n/m, ""));
    const partialFailures = validateProject(partialProject).filter((c) => c.status === "fail").map((c) => c.id);
    expect(partialFailures).toContain("codex.workflow.ui-ux-review.body");

    const { projectRoot: legacyProject } = initProject({ name: "Commentless Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
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
