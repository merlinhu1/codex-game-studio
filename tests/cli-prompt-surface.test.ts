import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

const repoRoot = process.cwd();
const cli = path.join(repoRoot, "dist", "cli.js");
const tempRoots: string[] = [];

beforeAll(() => {
  execFileSync("npm", ["run", "build", "--silent"], { cwd: repoRoot, encoding: "utf8" });
});

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("built CLI prompt surface", () => {
  test("prints inlined project prompt, selected templates, and bounded broad context from temp cwd", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-cli-prompt-"));
    tempRoots.push(cwd);
    const repoProject = path.join(repoRoot, "projects", "cli-prompt-game");
    const repoProjectExisted = existsSync(repoProject);

    try {
      execFileSync("node", [cli, "init", "--name", "CLI Prompt Game", "--engine", "godot", "--mode", "design", "--non-interactive"], { cwd, encoding: "utf8" });
      const projectRoot = path.join(cwd, "projects", "cli-prompt-game");

      const marketPrompt = execFileSync("node", [cli, "run", "market-analyst", "--project", projectRoot, "--print-prompt", "Assess competitors"], {
        cwd,
        encoding: "utf8"
      });
      expect(marketPrompt).toContain("# Project Role Prompt: .codex/prompts/market-analyst.md");
      expect(marketPrompt).toContain("Project: CLI Prompt Game");
      expect(marketPrompt).toContain("Template: market_analysis");
      expect(marketPrompt).not.toContain("Template: analytics_setup");

      const dryRun = execFileSync("node", [cli, "run", "producer", "--project", projectRoot, "--dry-run", "--allow-broad-context", "Plan milestone"], {
        cwd,
        encoding: "utf8"
      });
      expect(dryRun).toContain("- documentation/design/gdd.md");
      expect(dryRun).toContain("- documentation/production/timeline.md");
      expect(dryRun).toContain("- resources/market-research/market-overview.md");
      expect((dryRun.match(/- \.codex\/prompts\//g) ?? [])).toHaveLength(1);
      expect(existsSync(repoProject)).toBe(repoProjectExisted);
    } finally {
      if (!repoProjectExisted) rmSync(repoProject, { recursive: true, force: true });
    }
  });
});
