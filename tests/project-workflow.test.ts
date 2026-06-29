import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { guidanceConfigHash } from "../src/config.js";
import { freezeProject, initProject, resumeProject, statusProject } from "../src/projects.js";

function tempRoot(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

describe("project workflow", () => {
  test("init configures the current repository root as the game root", () => {
    const cwd = tempRoot("ogs-root-project-");
    const { projectRoot, config } = initProject({ name: "Test Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(projectRoot).toBe(cwd);
    expect(existsSync(path.join(cwd, "projects", "test-game"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "studio.json"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "context-manifest.json"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "context-manifest.meta.json"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "runs"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".gamestudio"))).toBe(false);

    expect(existsSync(path.join(projectRoot, "src", "project.godot"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "assets", ".gitkeep"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "design", "gdd.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "docs", "architecture", "README.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "docs", "market-overview.md"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tests", ".gitkeep"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "tools", ".gitkeep"))).toBe(true);
    expect(existsSync(path.join(projectRoot, "production", "timeline.md"))).toBe(true);

    const contextManifest = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "context-manifest.json"), "utf8"));
    expect(contextManifest.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourcePath: "AGENTS.md", required: true, safety: "safe", status: "selected" }),
        expect.objectContaining({ sourcePath: "design/gdd.md", required: true, status: "selected" }),
        expect.objectContaining({ sourcePath: "src/project.godot", reason: expect.stringMatching(/engine/i), status: "selected" })
      ])
    );

    const agents = readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");
    expect(agents).toContain("# Test Game Game Studio");
    for (const section of ["## Project Goal", "## Engine", "## Commands", "## Coding Conventions", "## Asset Conventions", "## Studio Roles", "## Current Milestone", "## Verification", "## Rules"]) {
      expect(agents).toContain(section);
    }
    expect(agents).not.toContain("CODEX.md");
    expect(agents).not.toContain("NodeNext");
    expect(agents).not.toContain("Truthmark");
    expect(agents).toContain(guidanceConfigHash(config));

    expect(config.project.concept).toBe("Test Game concept");
    expect(config.project.genre).toBe("Unspecified");
    expect(config.project.platform).toBe("PC");
    expect(config.project.audience).toBe("General players");
    expect(config.project.competitors).toEqual([]);
  });

  test("init materializes Codex-native custom agents and repository skills", () => {
    const cwd = tempRoot("ogs-surfaces-");
    const { projectRoot } = initProject({ name: "Surface Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const agent = readFileSync(path.join(projectRoot, ".codex", "agents", "gameplay-programmer.toml"), "utf8");
    expect(agent).toContain('name = "gameplay_programmer"');
    expect(agent).toContain("description = ");
    expect(agent).toContain("developer_instructions = ");
    expect(existsSync(path.join(projectRoot, ".codex", "agents", "gameplay-programmer.md"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "agents", "godot-specialist.toml"))).toBe(true);
    expect(existsSync(path.join(projectRoot, ".codex", "agents", "unity-specialist.toml"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "agents", "unreal-specialist.toml"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "hooks.json"))).toBe(false);
    expect(existsSync(path.join(projectRoot, ".codex", "rules"))).toBe(false);

    for (const skill of ["cgs-start", "cgs-setup-engine", "cgs-adopt", "cgs-bugfix", "cgs-vertical-slice", "cgs-ui-ux-review", "cgs-release-checklist", "cgs-standards-gameplay", "cgs-standards-tests", "cgs-standards-prototype", "cgs-standards-ui"]) {
      const body = readFileSync(path.join(projectRoot, ".agents", "skills", skill, "SKILL.md"), "utf8");
      expect(body).toContain(`name: ${skill}`);
      expect(body).toContain("description: ");
    }
  });

  test("init requires explicit non-interactive mode and supports optional overrides", () => {
    const cwd = tempRoot("ogs-required-");
    expect(() => initProject({ name: "Missing Mode", engine: "godot", nonInteractive: true }, cwd)).toThrow(/--mode/);
    expect(() => initProject({ name: "Missing Noninteractive", engine: "godot", mode: "prototype" }, cwd)).toThrow(/--non-interactive/);
    const { config } = initProject({
      name: "Override Game",
      engine: "godot",
      mode: "design",
      studioMode: "strict-studio",
      nonInteractive: true,
      competitors: ["terra nil", "mini metro"],
      engineVersion: "4.5.custom"
    }, cwd);
    expect(config.project.studio_mode).toBe("strict-studio");
    expect(config.project.competitors).toEqual(["terra nil", "mini metro"]);
    expect(config.project.engine_version).toBe("4.5.custom");
  });

  test("default init protects an existing different root project", () => {
    const cwd = tempRoot("ogs-protect-");
    initProject({ name: "First Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(() => initProject({ name: "Second Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd)).toThrow(/already contains/i);
  });


  test("CLI init writes root studio state by default and accepts repeated competitor flags", () => {
    const cwd = tempRoot("ogs-cli-");
    const cli = path.join(process.cwd(), "src", "cli.ts");
    const tsx = path.join(process.cwd(), "node_modules", ".bin", "tsx");
    expect(() => execFileSync(tsx, [cli, "init", "--name", "CLI Missing Mode", "--engine", "godot", "--non-interactive"], { cwd, encoding: "utf8", stdio: "pipe" })).toThrow();
    execFileSync(tsx, [cli, "init", "--name", "CLI Game", "--engine", "godot", "--mode", "prototype", "--studio-mode", "fast-prototype", "--non-interactive", "--competitor", "terra nil", "--competitor", "mini metro", "--engine-version", "4.5.custom"], { cwd, encoding: "utf8" });
    const studio = JSON.parse(readFileSync(path.join(cwd, ".codex", "studio.json"), "utf8"));
    expect(studio.engineVersion).toBe("4.5.custom");
    expect(studio.studioMode).toBe("fast-prototype");
    expect(existsSync(path.join(cwd, "projects", "cli-game"))).toBe(false);
  });

  test("all engines initialize expected root files", () => {
    expect(existsSync(path.join(initProject({ name: "Godot Game", engine: "godot", mode: "prototype", nonInteractive: true }, tempRoot("ogs-godot-")).projectRoot, "src", "project.godot"))).toBe(true);
    expect(existsSync(path.join(initProject({ name: "Unity Game", engine: "unity", mode: "design", nonInteractive: true }, tempRoot("ogs-unity-")).projectRoot, "src", "Packages", "manifest.json"))).toBe(true);
    expect(existsSync(path.join(initProject({ name: "Unreal Game", engine: "Unreal Engine", mode: "development", nonInteractive: true }, tempRoot("ogs-unreal-")).projectRoot, "src", "UnrealGame.uproject"))).toBe(true);
  });

  test("status resume are read-only and freeze only changes operational status", () => {
    const cwd = tempRoot("ogs-status-");
    const { projectRoot } = initProject({ name: "Freeze Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    const studioPath = path.join(projectRoot, ".codex", "studio.json");
    const before = readFileSync(studioPath, "utf8");
    expect(statusProject(undefined, cwd)).toContain("custom agents: .codex/agents/*.toml");
    expect(resumeProject(undefined, cwd)).toContain("Suggested next command");
    expect(readFileSync(studioPath, "utf8")).toBe(before);
    const agentsBefore = readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8");
    freezeProject(undefined, cwd);
    expect(JSON.parse(readFileSync(studioPath, "utf8")).status).toBe("frozen");
    expect(readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8")).toBe(agentsBefore);
  });
});
