import { rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
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
