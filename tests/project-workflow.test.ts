import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { guidanceConfigHash } from "../src/config.js";
import { freezeProject, initProject, resumeProject, statusProject } from "../src/projects.js";

describe("project workflow", () => {
  test("init creates project docs, config, agents, and engine files", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-project-"));
    const { projectRoot, config } = initProject({ name: "Test Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(existsSync(path.join(projectRoot, "project-config.json"))).toBe(false);
    expect(existsSync(path.join(projectRoot, "CODEX.md"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "studio.json"))).toBe(true);
    expect(JSON.parse(readFileSync(path.join(projectRoot, ".codex", "approvals.json"), "utf8"))).toEqual({
      schemaVersion: 1,
      product: "codex-game-studio",
      records: []
    });
    expect(existsSync(path.join(projectRoot, ".codex", "runs"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "prompts", "producer.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "prompts", "gameplay-programmer.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "prompts", "qa-playtester.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "workflows", "vertical-slice.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "workflows", "bugfix.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "workflows", "playtest.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".gamestudio", "runs"))).toBe(false);
    expect(JSON.parse(readFileSync(path.join(projectRoot, ".codex", "studio.json"), "utf8"))).toMatchObject({
      schemaVersion: 1,
      product: "codex-game-studio",
      engine: "godot",
      currentMilestone: "prototype"
    });
    const agents = readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");
    expect(agents).toContain("# Test Game Agents");
    for (const section of ["## Project Goal", "## Engine", "## Commands", "## Coding Conventions", "## Asset Conventions", "## Studio Roles", "## Current Milestone", "## Verification", "## Rules"]) {
      expect(agents).toContain(section);
    }
    expect(agents).not.toContain("CODEX.md");
    expect(existsSync(path.join(projectRoot, "source", "project-test-game", "project.godot"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "resources", "market-research", "market-overview.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "documentation", "design", "gdd.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".gamestudio"))).toBe(false);
    expect(readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8")).toContain(guidanceConfigHash(config));
    expect(config.project.concept).toBe("Test Game concept");
    expect(config.project.genre).toBe("Unspecified");
    expect(config.project.platform).toBe("PC");
    expect(config.project.audience).toBe("General players");
    expect(config.project.competitors).toEqual([]);
    expect(config.project.monetization).toBe("undecided");
    expect(config.project.timeline).toBe("TBD");
    expect(existsSync(path.join(projectRoot, "resources", "market-research", "mini-metro.md"))).toBe(false);
  });

  test("init requires explicit non-interactive mode and supports optional overrides", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-required-"));
    expect(() => initProject({ name: "Missing Mode", engine: "godot", nonInteractive: true }, cwd)).toThrow(/--mode/);
    expect(() => initProject({ name: "Missing Noninteractive", engine: "godot", mode: "prototype" }, cwd)).toThrow(/--non-interactive/);
    const { config } = initProject({
      name: "Override Game",
      engine: "godot",
      mode: "design",
      nonInteractive: true,
      competitors: ["terra nil", "mini metro"],
      engineVersion: "4.5.custom"
    }, cwd);
    expect(config.project.competitors).toEqual(["terra nil", "mini metro"]);
    expect(config.project.engine_version).toBe("4.5.custom");
  });

  test("init generates an empty approval store", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-approval-project-"));
    const { projectRoot } = initProject({ name: "Approval Project", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(JSON.parse(readFileSync(path.join(projectRoot, ".codex", "approvals.json"), "utf8"))).toEqual({
      schemaVersion: 1,
      product: "codex-game-studio",
      records: []
    });
  });

  test("CLI init requires mode and non-interactive and accepts repeated competitor flags", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-cli-"));
    const cli = path.join(process.cwd(), "src", "cli.ts");
    const tsx = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    expect(() => execFileSync(tsx, [cli, "init", "--name", "CLI Missing Mode", "--engine", "godot", "--non-interactive"], { cwd, encoding: "utf8", stdio: "pipe" })).toThrow();
    execFileSync(tsx, [
      cli,
      "init",
      "--name",
      "CLI Game",
      "--engine",
      "godot",
      "--mode",
      "prototype",
      "--non-interactive",
      "--competitor",
      "terra nil",
      "--competitor",
      "mini metro",
      "--engine-version",
      "4.5.custom"
    ], { cwd, encoding: "utf8" });
    const studio = JSON.parse(readFileSync(path.join(cwd, "projects", "cli-game", ".codex", "studio.json"), "utf8"));
    expect(studio.engineVersion).toBe("4.5.custom");
  });

  test("CLI init does not expose arbitrary project root override", () => {
    const cli = path.join(process.cwd(), "src", "cli.ts");
    const tsx = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    const help = execFileSync(tsx, [cli, "init", "--help"], { encoding: "utf8" });
    expect(help).not.toContain("--root");
  });

  test("init ignores arbitrary root override and stays under projects slug", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-root-"));
    const outsideRoot = path.join(cwd, "outside-root");
    const { projectRoot } = initProject({ name: "Root Escape", engine: "godot", mode: "prototype", nonInteractive: true, root: outsideRoot } as Parameters<typeof initProject>[0], cwd);
    expect(projectRoot).toBe(path.join(cwd, "projects", "root-escape"));
    expect(existsSync(outsideRoot)).toBe(false);
  });

  test("all engines initialize expected files", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-engines-"));
    expect(existsSync(path.join(initProject({ name: "Godot Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd).projectRoot, "source", "project-godot-game", "project.godot"))).toBe(true);
    expect(existsSync(path.join(initProject({ name: "Unity Game", engine: "unity", mode: "design", nonInteractive: true }, cwd).projectRoot, "source", "project-unity-game", "Packages", "manifest.json"))).toBe(true);
    expect(existsSync(path.join(initProject({ name: "Unreal Game", engine: "Unreal Engine", mode: "development", nonInteractive: true }, cwd).projectRoot, "source", "project-unreal-game", "UnrealGame.uproject"))).toBe(true);
  });

  test("same-parent init rejects Unreal class-name collisions", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-collision-"));
    initProject({ name: "Foo1", engine: "unreal", mode: "prototype", nonInteractive: true }, cwd);
    expect(() => initProject({ name: "Foo 1", engine: "unreal", mode: "prototype", nonInteractive: true }, cwd)).toThrow(/collides/i);
  });

  test("status resume are read-only and freeze only changes operational status", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-status-"));
    const { projectRoot } = initProject({ name: "Freeze Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const studioPath = path.join(projectRoot, ".codex", "studio.json");
    const before = readFileSync(studioPath, "utf8");
    expect(statusProject(projectRoot, cwd)).toContain("status: active");
    expect(resumeProject(projectRoot, cwd)).toContain("Suggested next command");
    expect(readFileSync(studioPath, "utf8")).toBe(before);
    const agentsBefore = readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");
    freezeProject(projectRoot, cwd);
    expect(JSON.parse(readFileSync(studioPath, "utf8")).status).toBe("frozen");
    expect(readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8")).toBe(agentsBefore);
  });
});
