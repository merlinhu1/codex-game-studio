import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { artifactStatus, workflowCatalog, workflowCatalogSummary } from "../src/workflow-catalog.js";
import { initProject, statusProject } from "../src/projects.js";
import { workflowRegistry } from "../src/workflows.js";

const firstBatchWorkflowGapIds = [
  "engine-setup",
  "game-concept",
  "design-review-concept",
  "art-bible",
  "map-systems",
  "design-system",
  "design-review",
  "review-all-gdds",
  "consistency-check",
  "create-architecture",
  "control-manifest",
  "accessibility-doc"
] as const;

const secondBatchWorkflowGapIds = [
  "entity-inventory",
  "asset-spec",
  "ux-design",
  "ux-review",
  "test-setup",
  "implement",
  "code-review",
  "bug-report",
  "retrospective",
  "team-feature",
  "scope-check",
  "balance-check",
  "asset-audit",
  "playtest-polish",
  "team-polish",
  "patch-notes",
  "changelog",
  "launch-checklist"
] as const;

describe("workflow catalog", () => {
  test("represents CCGS-style phases with required and repeatable artifact checks", () => {
    expect(workflowCatalog.phases[0]).toEqual(expect.objectContaining({ id: "concept", nextPhase: "systems-design" }));
    const concept = workflowCatalog.phases.find((phase) => phase.id === "concept");
    expect(concept?.steps).toContainEqual(expect.objectContaining({ id: "game-concept", required: true, artifact: expect.objectContaining({ path: "design/gdd.md" }) }));
    const systems = workflowCatalog.phases.find((phase) => phase.id === "systems-design");
    expect(systems?.steps).toContainEqual(expect.objectContaining({ id: "design-system", repeatable: true }));
  });

  test("first CCGS workflow-step parity batch is registry-backed and catalog-aligned", () => {
    for (const id of firstBatchWorkflowGapIds) {
      expect(workflowRegistry[id]).toEqual(expect.objectContaining({ id, file: `.codex/workflows/${id}.md` }));
    }

    const catalogIds = workflowCatalog.phases.flatMap((phase) => phase.steps.map((step) => step.id));
    expect(catalogIds).toEqual(expect.arrayContaining([...firstBatchWorkflowGapIds]));
    expect(catalogIds).not.toContain("setup-engine");

    const engineSetup = workflowCatalog.phases.flatMap((phase) => phase.steps).find((step) => step.id === "engine-setup");
    expect(engineSetup).toEqual(expect.objectContaining({ required: true, artifact: expect.objectContaining({ path: ".codex/studio.json" }) }));
    const designSystem = workflowCatalog.phases.flatMap((phase) => phase.steps).find((step) => step.id === "design-system");
    expect(designSystem).toEqual(expect.objectContaining({ repeatable: true }));
  });

  test("second CCGS workflow-step parity batch is registry-backed and catalog-aligned", () => {
    for (const id of secondBatchWorkflowGapIds) {
      expect(workflowRegistry[id]).toEqual(expect.objectContaining({ id, file: `.codex/workflows/${id}.md` }));
    }

    const catalogIds = workflowCatalog.phases.flatMap((phase) => phase.steps.map((step) => step.id));
    expect(catalogIds).toEqual(expect.arrayContaining([...secondBatchWorkflowGapIds]));

    const steps = workflowCatalog.phases.flatMap((phase) => phase.steps);
    expect(steps.find((step) => step.id === "entity-inventory")).toEqual(expect.objectContaining({ required: true, repeatable: true, artifact: expect.objectContaining({ path: "design/entities/entity-inventory.md" }) }));
    expect(steps.find((step) => step.id === "implement")).toEqual(expect.objectContaining({ required: true, repeatable: true, artifact: expect.objectContaining({ path: "production/session-state/active.md" }) }));
    expect(steps.find((step) => step.id === "launch-checklist")).toEqual(expect.objectContaining({ required: true, artifact: expect.objectContaining({ path: "production/launch-checklist.md" }) }));
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
