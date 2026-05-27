import { rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { guidanceConfigHash, readProjectConfig, writeProjectConfig } from "../src/config.js";
import { freezeProject, initProject } from "../src/projects.js";
import { runValidation, validateProject } from "../src/validation.js";

describe("validation", () => {
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

  test("malformed materialized agent prompts fail validation", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot, config } = initProject({ name: "Prompt Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      path.join(projectRoot, ".gamestudio", "agents", "master_orchestrator.md"),
      `# Role\n\n# Inputs\n\n# Outputs\n\n# Validation\n\n# Engine Notes\n\n# Rules\n\n# Project Context\n\n- Name: ${config.project.name}\n- Engine: Godot ${config.project.engine_version}\n\n# Engine Overlay\n\nUse Godot.\n`
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.agent.master_orchestrator");
  });

  test("materialized agent prompts fail validation when engine overlay is empty", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot, config } = initProject({ name: "Overlay Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    writeFileSync(
      path.join(projectRoot, ".gamestudio", "agents", "master_orchestrator.md"),
      `# Role\n\nCoordinate the team.\n\n# Inputs\n\n- Project brief.\n\n# Outputs\n\n- Production direction.\n\n# Validation\n\n- Check generated artifacts.\n\n# Engine Notes\n\n- Use engine-specific guidance.\n\n# Rules\n\n- Keep work scoped.\n\n# Project Context\n\n- Name: ${config.project.name}\n- Engine: Godot ${config.project.engine_version}\n\n# Engine Overlay\n\n`
    );
    const failures = validateProject(projectRoot).filter((c) => c.status === "fail");
    expect(failures.map((f) => f.id)).toContain("project.agent.master_orchestrator");
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

  test("invalid config and stale AGENTS hash fail", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Stale Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const configPath = path.join(projectRoot, "project-config.json");
    const config = readProjectConfig(configPath);
    const hash = guidanceConfigHash(config);
    config.project.genre = "Changed";
    writeProjectConfig(configPath, config);
    expect(validateProject(projectRoot).some((c) => c.id === "project.agents_md.hash" && c.status === "fail")).toBe(true);
    config.project.status = "frozen";
    expect(guidanceConfigHash(config)).not.toBe(hash);
    writeFileSync(configPath, "{ invalid json");
    expect(validateProject(projectRoot)[0].status).toBe("fail");
  });

  test("freeze status-only changes do not stale AGENTS hash", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-val-"));
    const { projectRoot } = initProject({ name: "Freeze Valid", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    freezeProject(projectRoot, cwd);
    expect(validateProject(projectRoot).filter((c) => c.status === "fail")).toEqual([]);
  });

  test("repo validation fails hard when built CLI is missing", async () => {
    const result = await runValidation();
    expect(result.checks.some((c) => c.id === "package.bin")).toBe(true);
    expect(result.failed).toBe(result.checks.some((c) => c.status === "fail"));
  });
});
