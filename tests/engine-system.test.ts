import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { createEngineFolders, createEngineProjectFiles, loadEngineConfigs, normalizeEngine, projectClassName, sourceRoot, unrealProjectFileName } from "../src/engines.js";
import { engineReferenceRegistry, validateEngineReferencePacks } from "../src/engine-reference.js";
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

  test("engine reference registry maps package files to project destinations", () => {
    expect(Object.keys(engineReferenceRegistry).sort()).toEqual(["godot", "unity", "unreal"]);
    for (const [engine, pack] of Object.entries(engineReferenceRegistry)) {
      expect(pack.packageRoot).toBe(`engine_reference/${engine}`);
      expect(pack.projectRoot).toBe(`docs/engine-reference/${engine}`);
      expect(pack.requiredFiles).toEqual(expect.arrayContaining(["VERSION.md", "current-best-practices.md", "deprecated-apis.md", "breaking-changes.md", "gameplay.md", "specialist.md"]));
      expect(pack.moduleFiles).toEqual([
        "modules/animation.md",
        "modules/audio.md",
        "modules/input.md",
        "modules/navigation.md",
        "modules/networking.md",
        "modules/physics.md",
        "modules/rendering.md",
        "modules/ui.md"
      ]);
      expect(pack.promptReferences.some((reference) => reference.path === "VERSION.md" && reference.required)).toBe(true);
      expect(pack.promptReferences.some((reference) => reference.path === "current-best-practices.md" && reference.required)).toBe(true);
      for (const file of [...pack.requiredFiles, ...pack.moduleFiles, ...pack.pluginFiles]) {
        expect(pack.projectPath(file)).toBe(`docs/engine-reference/${engine}/${file}`);
      }
      expect(pack.validation.requiredMetadata).toEqual(["reviewer", "date", "source-link", "engine", "version-reviewed", "tags", "roles", "workflows"]);
      expect(pack.packageSmokeFiles.length).toBeGreaterThan(0);
    }
  });

  test("engine reference content has required seed review metadata", () => {
    const checks = validateEngineReferencePacks(packageAssetPath("."));
    expect(checks.filter((check) => check.status === "fail")).toEqual([]);
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.godot.VERSION.md.metadata", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.unity.modules/networking.md.metadata", status: "pass" }));
    expect(checks).toContainEqual(expect.objectContaining({ id: "engine_reference.unreal.plugins/gas.md.metadata", status: "pass" }));
  });

  test("engine reference assets are included in npm pack", () => {
    const raw = execFileSync("npm", ["pack", "--json"], { cwd: process.cwd(), encoding: "utf8", shell: false });
    const packInfo = JSON.parse(raw)[0] as { filename: string; files: { path: string }[] };
    try {
      const packed = new Set(packInfo.files.map((file) => file.path));
      for (const pack of Object.values(engineReferenceRegistry)) {
        for (const file of [...pack.requiredFiles, ...pack.moduleFiles, ...pack.pluginFiles, ...pack.specialistFiles]) {
          expect(packed.has(`${pack.packageRoot}/${file}`)).toBe(true);
        }
      }
    } finally {
      unlinkSync(path.join(process.cwd(), packInfo.filename));
    }
  });
});
