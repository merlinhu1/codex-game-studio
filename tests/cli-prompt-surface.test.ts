import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, before, describe, test } from "node:test";
import { expect } from "expect";

const repoRoot = process.cwd();
const cli = path.join(repoRoot, "dist", "cli.js");
const tempRoots: string[] = [];
const hash64 = "a".repeat(64);

function runCli(args: string[], cwd: string): string {
  return execFileSync("node", [cli, ...args], { cwd, encoding: "utf8" });
}

function runCliFailure(args: string[], cwd: string): string {
  try {
    runCli(args, cwd);
  } catch (error) {
    const result = error as { stdout?: Buffer | string; stderr?: Buffer | string };
    return `${result.stdout?.toString() ?? ""}${result.stderr?.toString() ?? ""}`;
  }
  throw new Error(`Expected CLI failure for ${args.join(" ")}`);
}

function initCliProject(prefix: string, name: string): { cwd: string; projectRoot: string } {
  const cwd = mkdtempSync(path.join(tmpdir(), prefix));
  tempRoots.push(cwd);
  runCli(["init", "--name", name, "--engine", "godot", "--mode", "prototype", "--non-interactive"], cwd);
  return { cwd, projectRoot: cwd };
}

before(() => {
  execFileSync("npm", ["run", "build", "--silent"], { cwd: repoRoot, encoding: "utf8" });
});

afterEach(() => {
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("built CLI prompt surface", () => {
  test("prints inlined project prompt, selected templates, and bounded broad context from temp cwd", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-cli-prompt-"));
    tempRoots.push(cwd);
    const repoProject = path.join(repoRoot, ".codex", "studio.json");
    const repoProjectExisted = existsSync(repoProject);

    try {
      execFileSync("node", [cli, "init", "--name", "CLI Prompt Game", "--engine", "godot", "--mode", "design", "--non-interactive"], { cwd, encoding: "utf8" });
      const projectRoot = cwd;

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
      expect(dryRun).toContain("- design/gdd.md");
      expect(dryRun).toContain("- production/timeline.md");
      expect(dryRun).toContain("- docs/market-overview.md");
      expect((dryRun.match(/- \.codex\/prompts\//g) ?? [])).toHaveLength(1);
      expect(existsSync(repoProject)).toBe(repoProjectExisted);
    } finally {
      if (!repoProjectExisted) rmSync(repoProject, { recursive: true, force: true });
    }
  });

  test("approval grant lists and revokes scoped task approvals", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-approval-", "Approval Game");
    writeFileSync(
      path.join(projectRoot, ".codex", "tasks.json"),
      `${JSON.stringify(
        {
          schemaVersion: 2,
          tasks: [
            {
              id: "task-001",
              title: "Implement jump feel",
              role: "gameplay-programmer",
              status: "ready",
              files: ["design/gdd.md"],
              writeFiles: ["source/player.gd"],
              dependencies: [],
              priority: 0,
              notes: [],
              createdAt: "2026-06-25T00:00:00.000Z",
              updatedAt: "2026-06-25T00:00:00.000Z"
            }
          ]
        },
        null,
        2
      )}\n`
    );

    const grant = runCli(
      [
        "approval",
        "grant",
        "--project",
        projectRoot,
        "--role",
        "gameplay-programmer",
        "--task",
        "task-001",
        "--scope",
        "src/**/*.gd",
        "--approved-by",
        "lead",
        "--expires-at",
        "2099-01-01T00:00:00.000Z"
      ],
      cwd
    );

    expect(grant).toContain("approval-001");
    expect(grant).toContain("Implement jump feel");
    expect(grant).toContain("src/**/*.gd");

    const store = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "approvals.json"), "utf8")) as {
      records: Array<{ id: string; role: string; approvedFiles?: string[]; source: string }>;
    };
    expect(store.records).toHaveLength(1);
    expect(store.records[0]).toMatchObject({
      id: "approval-001",
      role: "gameplay-programmer",
      approvedFiles: ["source/player.gd"],
      source: "approval-command"
    });

    const list = runCli(["approval", "list", "--project", projectRoot], cwd);
    expect(list).toContain("approval-001");
    expect(list).toContain("approved");
    expect(list).toContain("authorizing");

    const revoke = runCli(["approval", "revoke", "--project", projectRoot, "--approval-id", "approval-001"], cwd);
    expect(revoke).toContain("Revoked approval-001");

    const revokedList = runCli(["approval", "list", "--project", projectRoot], cwd);
    expect(revokedList).toContain("approval-001");
    expect(revokedList).toContain("revoked");
    expect(revokedList).toContain("non-authorizing");
  });

  test("approval grant rejects empty broad and mismatched task scopes unless acknowledged", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-approval-", "Approval Scope Game");

    expect(runCliFailure(["approval", "grant", "--project", projectRoot, "--role", "gameplay-programmer", "--task", hash64], cwd)).toMatch(
      /scope/i
    );
    expect(
      runCliFailure(
        ["approval", "grant", "--project", projectRoot, "--role", "gameplay-programmer", "--task", hash64, "--scope", "**/*"],
        cwd
      )
    ).toMatch(/broad.*allow-broad-scope/i);
    expect(
      runCliFailure(
        ["approval", "grant", "--project", projectRoot, "--role", "gameplay-programmer", "--task", hash64, "--scope", "**"],
        cwd
      )
    ).toMatch(/broad.*allow-broad-scope/i);

    const broad = runCli(
      [
        "approval",
        "grant",
        "--project",
        projectRoot,
        "--role",
        "gameplay-programmer",
        "--task",
        hash64,
        "--scope",
        "**/*",
        "--allow-broad-scope"
      ],
      cwd
    );
    expect(broad).toContain("approval-001");

    expect(
      runCliFailure(
        [
          "approval",
          "grant",
          "--project",
          projectRoot,
          "--role",
          "not-a-role",
          "--task",
          hash64,
          "--scope",
          "src/**/*.gd"
        ],
        cwd
      )
    ).toMatch(/unknown studio role/i);

    writeFileSync(
      path.join(projectRoot, ".codex", "tasks.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          tasks: [
            {
              id: "task-001",
              title: "Plan milestone",
              role: "producer",
              status: "ready",
              files: ["production/timeline.md"],
              notes: []
            }
          ]
        },
        null,
        2
      )}\n`
    );
    expect(
      runCliFailure(
        [
          "approval",
          "grant",
          "--project",
          projectRoot,
          "--role",
          "gameplay-programmer",
          "--task",
          "task-001",
          "--scope",
          "src/**/*.gd"
        ],
        cwd
      )
    ).toMatch(/assigned to role producer.*does not match/i);

    expect(
      runCliFailure(
        [
          "approval",
          "grant",
          "--project",
          projectRoot,
          "--role",
          "gameplay-programmer",
          "--task",
          "not-a-task",
          "--scope",
          "src/**/*.gd"
        ],
        cwd
      )
    ).toMatch(/unknown task/i);
  });

  test("approval list keeps expired approvals visible as non-authorizing", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-approval-", "Approval Expiry Game");
    runCli(
      [
        "approval",
        "grant",
        "--project",
        projectRoot,
        "--role",
        "gameplay-programmer",
        "--task",
        hash64,
        "--scope",
        "src/**/*.gd",
        "--expires-at",
        "2000-01-01T00:00:00.000Z"
      ],
      cwd
    );

    const list = runCli(["approval", "list", "--project", projectRoot], cwd);
    expect(list).toContain("approval-001");
    expect(list).toContain("expired");
    expect(list).toContain("non-authorizing");
  });

  test("approval grant accepts custom role ids for precomputed objective hashes", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-custom-approval-", "Custom Approval Game");

    const grant = runCli(
      [
        "approval",
        "grant",
        "--project",
        projectRoot,
        "--role",
        "custom-boss-designer",
        "--task",
        hash64,
        "--scope",
        "src/**/*.gd",
        "--approved-by",
        "lead"
      ],
      cwd
    );

    expect(grant).toContain("approval-001");
    expect(grant).toContain("role: custom-boss-designer");
    const store = JSON.parse(readFileSync(path.join(projectRoot, ".codex", "approvals.json"), "utf8")) as {
      records: Array<{ role: string; approvedGlobs: string[] }>;
    };
    expect(store.records[0]).toMatchObject({ role: "custom-boss-designer", approvedGlobs: ["src/**/*.gd"] });
  });

  test("run dry-run shows approval override advisory and sandbox provenance", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-policy-", "Policy Game");

    const blocked = runCli(["run", "gameplay-programmer", "--project", projectRoot, "--dry-run", "Implement jump"], cwd);
    expect(blocked).toContain("Eligibility: blocked");
    expect(blocked).toContain("Write policy: read-only");
    expect(blocked).toContain("Sandbox: read-only");
    expect(blocked).toContain("Required approval:");

    const override = runCli(["run", "gameplay-programmer", "--project", projectRoot, "--dry-run", "--approved-by-user", "Implement jump"], cwd);
    expect(override).toContain("Eligibility: allowed");
    expect(override).toContain("Write policy: override-write");
    expect(override).toContain("Sandbox: danger-full-access");
    expect(override).toContain("Provenance: override");

    const constrained = runCli(["run", "gameplay-programmer", "--project", projectRoot, "--dry-run", "--approved-by-user", "--constrained-sandbox", "Implement jump"], cwd);
    expect(constrained).toContain("Sandbox: workspace-write");
  });

  test("workflow recipes and task orchestrate are visible through the built CLI", () => {
    const { cwd, projectRoot } = initCliProject("ogs-cli-orchestrate-", "Orchestrate Game");

    const recipe = runCli(["workflow", "create-tasks", "vertical-slice", "--project", projectRoot, "--dry-run"], cwd);
    expect(recipe).toContain("Workflow task recipe: vertical-slice");

    const render = runCli(["workflow", "vertical-slice", "--project", projectRoot], cwd);
    expect(render).toContain("# Codex Game Studio Session");

    const created = runCli(["workflow", "create-tasks", "bugfix", "--project", projectRoot], cwd);
    expect(created).toContain("Workflow task recipe: bugfix");

    const orchestration = runCli(["task", "orchestrate", "--project", projectRoot, "--dry-run"], cwd);
    expect(orchestration).toContain("Orchestration plan: 3 task(s), max concurrency 1");
  });
});
