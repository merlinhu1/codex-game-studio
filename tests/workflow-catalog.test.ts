import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { artifactStatus, workflowCatalog, workflowCatalogSummary } from "../src/workflow-catalog.js";
import { initProject, statusProject } from "../src/projects.js";

describe("workflow catalog", () => {
  test("represents CCGS-style phases with required and repeatable artifact checks", () => {
    expect(workflowCatalog.phases[0]).toEqual(expect.objectContaining({ id: "concept", nextPhase: "systems-design" }));
    const concept = workflowCatalog.phases.find((phase) => phase.id === "concept");
    expect(concept?.steps).toContainEqual(expect.objectContaining({ id: "game-concept", required: true, artifact: expect.objectContaining({ path: "design/gdd.md" }) }));
    const systems = workflowCatalog.phases.find((phase) => phase.id === "systems-design");
    expect(systems?.steps).toContainEqual(expect.objectContaining({ id: "design-system", repeatable: true }));
  });

  test("artifact checks report complete, invalid-pattern, and missing workflow prerequisites", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ogs-workflow-catalog-"));
    mkdirSync(path.join(root, "design"), { recursive: true });
    writeFileSync(path.join(root, "design", "gdd.md"), "# Test GDD\n");
    expect(artifactStatus(root, { path: "design/gdd.md", pattern: "# Test" })).toEqual(expect.objectContaining({ status: "complete" }));
    expect(artifactStatus(root, { path: "docs/architecture/README.md" })).toEqual(expect.objectContaining({ status: "missing" }));
    expect(artifactStatus(root, { path: "design/gdd.md", pattern: "[" })).toEqual(expect.objectContaining({ status: "incomplete", reason: expect.stringMatching(/invalid pattern/) }));
    expect(artifactStatus(root, { path: "design/gdd.md", pattern: "Nope" })).toEqual(expect.objectContaining({ status: "incomplete" }));
  });

  test("status output includes the next incomplete workflow catalog phase", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-workflow-status-"));
    initProject({ name: "Workflow Status Game", engine: "godot", mode: "prototype", nonInteractive: true }, cwd);
    expect(statusProject(undefined, cwd)).toContain("workflow phase: concept");
    expect(workflowCatalogSummary(cwd)).toContain("map-systems");

    writeFileSync(path.join(cwd, "design", "gdd.md"), "# Test GDD\n\n## System Map\nSystem dependencies are listed.\n");
    expect(workflowCatalogSummary(cwd)).toContain("workflow phase: pre-production");
    expect(workflowCatalogSummary(cwd)).toContain("vertical-slice");
  });
});
