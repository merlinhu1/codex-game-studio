import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";

const repoRoot = process.cwd();

describe("prompt surface audit", () => {
  test("audits local and CCGS prompt surfaces with metadata, decisions, and tests", () => {
    const output = execFileSync(process.execPath, ["--import", "tsx", "scripts/audit-prompt-surfaces.ts", "--json"], { cwd: repoRoot, encoding: "utf8" });
    const report = JSON.parse(output) as { local: { agents: number; workflows: number; skills: number }; upstream: { agents: number; skills: number }; decisionLegend: string[]; rows: Array<{ localPath: string; sourcePath?: string; sourceHash?: string; decision: string; status: string; metadata: Record<string, boolean>; requiredTests: string[] }> };
    expect(report.local.agents).toBeGreaterThanOrEqual(38);
    expect(report.local.workflows).toBeGreaterThanOrEqual(31);
    expect(report.local.skills).toBeGreaterThanOrEqual(79);
    expect(report.upstream.agents).toBeGreaterThanOrEqual(49);
    expect(report.upstream.skills).toBeGreaterThanOrEqual(73);
    expect(report.decisionLegend).toEqual(["adopt", "adapt", "merge", "split", "defer", "out-of-scope"]);
    const prototype = report.rows.find((row) => row.localPath === ".agents/skills/cgs-prototype/SKILL.md");
    expect(prototype?.sourcePath).toBe(".claude/skills/prototype/SKILL.md");
    expect(prototype?.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(["adapt", "adopt", "merge", "split", "defer", "out-of-scope"]).toContain(prototype?.decision);
    expect(prototype?.status).toMatch(/complete|needs-uplift|deferred/);
    expect(prototype?.metadata.model).toBe(true);
    expect(prototype?.requiredTests).toContain("tests/validation.test.ts");
    const gameDesigner = report.rows.find((row) => row.localPath === ".codex/agents/game-designer.toml");
    expect(gameDesigner?.sourcePath).toBe(".claude/agents/game-designer.md");
    expect(gameDesigner?.metadata.model).toBe(true);
    expect(existsSync(path.join(repoRoot, "references", "prompt-surface-uplift-matrix.json"))).toBe(true);
    expect(readFileSync(path.join(repoRoot, "references", "prompt-surface-uplift-matrix.md"), "utf8")).toContain("cgs-prototype");
  });
});
