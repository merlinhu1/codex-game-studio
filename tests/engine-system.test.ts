import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { createEngineFolders, createEngineProjectFiles, loadEngineConfigs, normalizeEngine, projectClassName, sourceRoot, unrealProjectFileName } from "../src/engines.js";
import { packageAssetPath } from "../src/paths.js";

describe("engine registry", () => {
  test("loads all engine configs and aliases", () => {
    const registry = loadEngineConfigs(packageAssetPath("engine_configs"));
    expect(Object.keys(registry).sort()).toEqual(["godot", "unity", "unreal"]);
    expect(normalizeEngine("Godot", registry)).toBe("godot");
    expect(normalizeEngine("Unity Engine", registry)).toBe("unity");
    expect(normalizeEngine("Unreal Engine", registry)).toBe("unreal");
    expect(normalizeEngine("ue5", registry)).toBe("unreal");
    expect(() => normalizeEngine("scratch", registry)).toThrow(/Unknown engine/);
    expect(registry.godot.project_files).toContain("project.godot");
    expect(registry.unity.run_command).toContain("Unity");
    expect(registry.unreal.test_command).toContain("Automation");
    expect(registry.godot.codex_hints.length).toBeGreaterThan(0);
  });

  test("creates engine roots under source/project-slug", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ogs-engine-"));
    const registry = loadEngineConfigs(packageAssetPath("engine_configs"));
    for (const engine of ["godot", "unity", "unreal"] as const) {
      createEngineFolders({ projectRoot: root, projectSlug: "test-game", projectName: "Test Game", engine, registry });
      createEngineProjectFiles({ projectRoot: root, projectSlug: "test-game", projectName: "Test Game", engine, registry });
    }
    const src = sourceRoot(root, "test-game");
    expect(existsSync(path.join(src, "project.godot"))).toBe(true);
    expect(existsSync(path.join(src, "Packages", "manifest.json"))).toBe(true);
    expect(existsSync(path.join(src, "ProjectSettings", "ProjectSettings.asset"))).toBe(true);
    expect(existsSync(path.join(src, "TestGame.uproject"))).toBe(true);
  });

  test("generates Unreal class names", () => {
    expect(projectClassName("Test Game")).toBe("TestGame");
    expect(projectClassName("codex-unreal-smoke")).toBe("CodexUnrealSmoke");
    expect(projectClassName("2d arena")).toBe("Game2dArena");
    expect(projectClassName("rocket! zone")).toBe("RocketZone");
    expect(() => projectClassName("!!!")).toThrow(/Cannot create/);
    expect(unrealProjectFileName("Test Game")).toBe("TestGame.uproject");
  });
});
