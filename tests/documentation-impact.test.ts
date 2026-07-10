import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { documentationImpactChecks, parseDocumentationImpactRecord } from "../src/documentation-impact.js";
import { initProject } from "../src/projects.js";
import { validateProject } from "../src/validation.js";

function tempProject(): string {
  const root = mkdtempSync(path.join(tmpdir(), "ogs-doc-impact-"));
  mkdirSync(path.join(root, "production", "session-state"), { recursive: true });
  mkdirSync(path.join(root, "src"), { recursive: true });
  mkdirSync(path.join(root, "design"), { recursive: true });
  mkdirSync(path.join(root, "docs"), { recursive: true });
  return root;
}

function writeImpact(root: string, body: string): void {
  writeFileSync(path.join(root, "production", "session-state", "active.md"), body);
}

function initializedGitProject(): string {
  const root = mkdtempSync(path.join(tmpdir(), "ogs-doc-impact-git-"));
  for (const entry of ["AGENTS.md", ".codex/agents", ".codex/workflows", ".agents/skills"]) {
    cpSync(path.join(process.cwd(), entry), path.join(root, entry), { recursive: true });
  }
  initProject({ name: "Documentation Impact Game", engine: "godot", mode: "prototype", nonInteractive: true }, root);
  const git = (args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
  git(["init"]);
  git(["config", "user.email", "tests@example.com"]);
  git(["config", "user.name", "Test Runner"]);
  git(["add", "."]);
  git(["commit", "-m", "initial game"]);
  return root;
}

describe("documentation impact", () => {
  test("parses a bounded updated-document decision", () => {
    expect(
      parseDocumentationImpactRecord("# Active Feature\n\n## Documentation Impact\n\n- Decision: updated\n- Reason: Movement rules changed.\n- Documents: design/gdd.md, docs/architecture/movement.md\n")
    ).toEqual({ decision: "updated", reason: "Movement rules changed.", documents: ["design/gdd.md", "docs/architecture/movement.md"] });
  });

  test("accepts a changed game source file with a changed named document", () => {
    const root = tempProject();
    writeFileSync(path.join(root, "design", "gdd.md"), "# GDD\n");
    writeImpact(root, "## Documentation Impact\n\n- Decision: updated\n- Reason: Movement rules changed.\n- Documents: design/gdd.md\n");

    expect(documentationImpactChecks(root, { changedPaths: ["src/player.gd", "design/gdd.md"] }).filter((check) => check.status === "fail")).toEqual([]);
  });

  test("requires an active-session decision for functional changes", () => {
    const root = tempProject();

    expect(documentationImpactChecks(root, { changedPaths: ["src/player.gd"] })).toContainEqual(
      expect.objectContaining({ id: "project.documentation_impact.record", status: "fail" })
    );
  });

  test("requires a reason for no-update decisions", () => {
    const root = tempProject();
    writeImpact(root, "## Documentation Impact\n\n- Decision: no-update\n- Reason:\n- Documents: none\n");

    expect(documentationImpactChecks(root, { changedPaths: ["src/refactor.gd"] })).toContainEqual(
      expect.objectContaining({ id: "project.documentation_impact.reason", status: "fail" })
    );
  });

  test("requires updated documents to differ from the selected base", () => {
    const root = tempProject();
    writeFileSync(path.join(root, "design", "gdd.md"), "# GDD\n");
    writeImpact(root, "## Documentation Impact\n\n- Decision: updated\n- Reason: Movement rules changed.\n- Documents: design/gdd.md\n");

    expect(documentationImpactChecks(root, { changedPaths: ["src/player.gd"] })).toContainEqual(
      expect.objectContaining({ id: "project.documentation_impact.document.design/gdd.md", status: "fail" })
    );
  });

  test("does not require a record for documentation-only changes", () => {
    const root = tempProject();

    expect(documentationImpactChecks(root, { changedPaths: ["design/gdd.md", "docs/changelog.md"] }).filter((check) => check.status === "fail")).toEqual([]);
  });

  test("reports an unavailable Git base instead of silently passing", () => {
    const root = tempProject();

    expect(documentationImpactChecks(root, { base: "missing-base" })).toContainEqual(
      expect.objectContaining({ id: "project.documentation_impact.base", status: "fail" })
    );
  });

  test("project validation includes documentation impact checks when a base is supplied", () => {
    const root = initializedGitProject();
    writeFileSync(path.join(root, "src", "player.gd"), "extends Node\n");

    expect(validateProject(root, { documentationBase: "HEAD" })).toContainEqual(
      expect.objectContaining({ id: "project.documentation_impact.record", status: "fail" })
    );
  });
});
