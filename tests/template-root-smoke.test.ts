import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { checkCodexAvailability } from "../src/codex-runtime.js";

const repoRoot = process.cwd();
const cli = path.join(repoRoot, "dist", "cli.js");

function listFiles(root: string, dir: string): string[] {
  const full = path.join(root, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name).slice(root.length + 1).split(path.sep).join("/"))
    .sort();
}

describe("template root smoke", () => {
  test("clone-style root init creates game-facing Codex surfaces without maintainer source", () => {
    execFileSync("npm", ["run", "build", "--silent"], { cwd: repoRoot, encoding: "utf8" });
    const root = mkdtempSync(path.join(tmpdir(), "ogs-template-root-"));
    try {
      execFileSync("node", [cli, "init", "--name", "Clone Root Game", "--engine", "godot", "--mode", "prototype", "--non-interactive"], { cwd: root, encoding: "utf8" });
      execFileSync("node", [cli, "validate"], { cwd: root, encoding: "utf8" });

      expect(existsSync(path.join(root, "AGENTS.md"))).toBe(true);
      expect(existsSync(path.join(root, ".codex", "studio.json"))).toBe(true);
      expect(existsSync(path.join(root, ".codex", "agents", "producer.toml"))).toBe(true);
      expect(existsSync(path.join(root, ".agents", "skills", "cgs-start", "SKILL.md"))).toBe(true);
      expect(existsSync(path.join(root, "src", "project.godot"))).toBe(true);
      expect(existsSync(path.join(root, "docs", "architecture", "README.md"))).toBe(true);

      expect(existsSync(path.join(root, "projects", "clone-root-game"))).toBe(false);
      expect(existsSync(path.join(root, ".codex", "hooks.json"))).toBe(false);
      expect(existsSync(path.join(root, ".codex", "rules"))).toBe(false);
      expect(listFiles(root, ".codex/agents").filter((file) => file.endsWith(".md"))).toEqual([]);
      expect(listFiles(root, "src").filter((file) => file.endsWith(".ts"))).toEqual([]);
      expect(existsSync(path.join(root, "docs", "plans"))).toBe(false);
      expect(existsSync(path.join(root, "docs", "truthmark"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("optional Codex probe reports availability without failing offline environments", async () => {
    const availability = await checkCodexAvailability();
    if (!availability.ok) {
      expect(availability.reason).toMatch(/Codex CLI|not found|unavailable|exited/i);
      return;
    }
    expect(availability.command).toBeTruthy();
  });
});
