import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { initProject } from "../src/projects.js";
import { validateTemplateSurfaces } from "../src/validation.js";

const repoRoot = process.cwd();

function trackedFiles(pattern: string): string[] {
  return execFileSync("git", ["ls-files", pattern], { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .sort();
}

function filesUnder(relativeDir: string): string[] {
  const full = path.join(repoRoot, relativeDir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name).slice(repoRoot.length + 1).split(path.sep).join("/"))
    .sort();
}

describe("template repository Codex surfaces", () => {
  test("clone-visible game agents, workflows, and skills are tracked before init", () => {
    const agents = trackedFiles(".codex/agents/*.toml");
    const workflows = trackedFiles(".codex/workflows/*.md");
    const skills = trackedFiles(".agents/skills/*/SKILL.md");

    expect(agents).toEqual(expect.arrayContaining([".codex/agents/producer.toml", ".codex/agents/gameplay-programmer.toml", ".codex/agents/godot-specialist.toml"]));
    expect(workflows).toEqual(expect.arrayContaining([".codex/workflows/vertical-slice.md", ".codex/workflows/bugfix.md", ".codex/workflows/qa-plan.md"]));
    expect(skills).toEqual(expect.arrayContaining([".agents/skills/cgs-start/SKILL.md", ".agents/skills/cgs-bugfix/SKILL.md", ".agents/skills/cgs-vertical-slice/SKILL.md"]));

    for (const file of [...agents, ...workflows, ...skills]) {
      const body = readFileSync(path.join(repoRoot, file), "utf8");
      expect(body.trim().length).toBeGreaterThan(80);
      expect(body).not.toContain("@generated");
      expect(body).not.toContain("generatedSurface");
    }
  });

  test("game-facing root surface folders do not contain Truthmark maintenance surfaces", () => {
    expect(filesUnder(".codex/agents").some((file) => /truth/i.test(file))).toBe(false);
    expect(filesUnder(".agents/skills").some((file) => /truthmark/i.test(file))).toBe(false);
  });

  test("init preserves tracked template instruction bodies", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ogs-template-preserve-"));
    const agentPath = path.join(root, ".codex", "agents", "producer.toml");
    const workflowPath = path.join(root, ".codex", "workflows", "bugfix.md");
    const skillPath = path.join(root, ".agents", "skills", "cgs-start", "SKILL.md");
    const agentsPath = path.join(root, "AGENTS.md");
    mkdirSync(path.dirname(agentPath), { recursive: true });
    mkdirSync(path.dirname(workflowPath), { recursive: true });
    mkdirSync(path.dirname(skillPath), { recursive: true });
    writeFileSync(agentPath, 'name = "producer"\ndescription = "Sentinel producer"\ndeveloper_instructions = """\nDo not overwrite this tracked template agent.\n"""\n');
    writeFileSync(workflowPath, "# Bugfix Workflow\n\n## Purpose\n\nDo not overwrite this tracked template workflow.\n");
    writeFileSync(skillPath, "---\nname: cgs-start\ndescription: Sentinel start skill\n---\n\n# Start\n\nDo not overwrite this tracked template skill.\n");
    writeFileSync(agentsPath, "# Sentinel Game Studio\n\n## Project Goal\n\nDo not overwrite this tracked root instruction file.\n");

    const before = new Map([
      [agentPath, readFileSync(agentPath, "utf8")],
      [workflowPath, readFileSync(workflowPath, "utf8")],
      [skillPath, readFileSync(skillPath, "utf8")],
      [agentsPath, readFileSync(agentsPath, "utf8")]
    ]);

    initProject({ name: "Template Preserve", engine: "godot", mode: "prototype", nonInteractive: true }, root);

    for (const [file, body] of before) expect(readFileSync(file, "utf8")).toBe(body);
  });

  test("template-surface validation runs before project state exists", () => {
    const checks = validateTemplateSurfaces(repoRoot);
    expect(checks.filter((check) => check.status === "fail")).toEqual([]);
    expect(checks).toEqual(expect.arrayContaining([expect.objectContaining({ id: "template.agents.tracked", status: "pass" }), expect.objectContaining({ id: "template.workflows.tracked", status: "pass" }), expect.objectContaining({ id: "template.skills.tracked", status: "pass" })]));
  });
});
