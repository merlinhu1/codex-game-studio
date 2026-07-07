import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { generateParityMatrix, inventoryCcgsSurfaces, renderParityMatrixMarkdown, renderRemainingGapTasksMarkdown, validateParityMatrix, writeParityReports } from "../src/ccgs-parity.js";
import { defaultProjectConfig } from "../src/projects.js";
import { templateSkillDefinitions } from "../src/skills.js";

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

const remainingTemplateGapIds = [
  "architecture-decision-record",
  "architecture-doc-from-code",
  "changelog-template",
  "design-agent-protocol",
  "implementation-agent-protocol",
  "leadership-agent-protocol",
  "concept-doc-from-prototype",
  "design-doc-from-implementation",
  "faction-design",
  "game-concept",
  "game-design-document",
  "game-pillars",
  "hud-design",
  "incident-response",
  "interaction-pattern-library",
  "level-design-document",
  "milestone-definition",
  "narrative-character-sheet",
  "post-mortem",
  "project-stage-report",
  "prototype-report",
  "release-checklist-template",
  "risk-register-entry",
  "skill-test-spec",
  "systems-index",
  "technical-design-document"
] as const;

const remainingRuleGapIds = [
  "ai-code",
  "data-files",
  "design-docs",
  "engine-code",
  "gameplay-code",
  "narrative",
  "network-code",
  "prototype-code",
  "shader-code",
  "test-standards",
  "ui-code"
] as const;

function workflowCatalogYaml(ids: readonly string[]): string {
  return [
    "phases:",
    "  concept:",
    "    label: \"Concept\"",
    "    next_phase: systems-design",
    "    steps:",
    ...ids.map((id) => `      - id: ${id}\n        name: \"${id}\"\n        command: /${id}\n        required: true\n        repeatable: ${id === "design-system" ? "true" : "false"}\n        artifact:\n          glob: \"design/${id}.md\"\n          pattern: \"# ${id}\"`)
  ].join("\n");
}

function fixtureRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "ccgs-fixture-"));
  mkdirSync(path.join(root, ".claude", "agents"), { recursive: true });
  mkdirSync(path.join(root, ".claude", "skills", "vertical-slice"), { recursive: true });
  mkdirSync(path.join(root, ".claude", "skills", "localize"), { recursive: true });
  mkdirSync(path.join(root, ".claude", "docs"), { recursive: true });
  writeFileSync(path.join(root, ".claude", "agents", "producer.md"), `---\nname: producer\ndescription: Production owner\ntools: Read, Write, Bash\nskills: [sprint-plan, scope-check]\n---\n\n### Key Responsibilities\n\n1. Sprint Planning\n2. Risk Management\n\n## Gate Verdict Format\n\n[PR-SPRINT]: REALISTIC\n\n### Output Format\n\n## Sprint [N]\n`);
  writeFileSync(path.join(root, ".claude", "agents", "writer.md"), `---\nname: writer\ndescription: Narrative writer\ntools: Read, Write\nskills: [write-copy]\n---\n\n### Key Responsibilities\n\n1. Drafting\n`);
  writeFileSync(path.join(root, ".claude", "skills", "vertical-slice", "SKILL.md"), `---\nname: vertical-slice\ndescription: Build a production-quality vertical slice\nargument-hint: "[--review full|lean|solo]"\nallowed-tools: Read, Write, Bash, AskUserQuestion\nagent: prototyper\n---\n\n## Phase 1: Resolve Review Mode and Load Context\n\nRead CLAUDE.md and design/gdd/game-concept.md.\n\n## Phase 5: Playtest Debrief\n\nCollect loop completion.\n\n## Verdict\n\nPROCEED / PIVOT / KILL\n`);
  writeFileSync(path.join(root, ".claude", "skills", "localize", "SKILL.md"), `---\nname: localize\ndescription: Localize player-facing text\nallowed-tools: Read, Write\nagent: localization-lead\n---\n\n## Phase 1: Load Strings\n\nRead design/gdd/game-concept.md.\n`);
  writeFileSync(path.join(root, ".claude", "docs", "workflow-catalog.yaml"), `phases:\n  concept:\n    label: "Concept"\n    next_phase: systems-design\n    steps:\n      - id: brainstorm\n        name: "Brainstorm"\n        command: /brainstorm\n        required: false\n      - id: game-concept\n        name: "Game Concept Document"\n        command: /brainstorm\n        required: true\n        repeatable: true\n        artifact:\n          glob: "design/gdd/game-concept.md"\n          pattern: "# Game Concept"\n`);
  return root;
}

describe("CCGS parity audit", () => {
  test("inventories agents, skills, and workflow catalog steps with stable metadata", () => {
    const inventory = inventoryCcgsSurfaces(fixtureRoot());
    const verticalSlice = inventory.skills.find((skill) => skill.id === "vertical-slice");
    expect(inventory.agents[0].skills).toEqual(["sprint-plan", "scope-check"]);
    expect(inventory.agents[0].sections).toEqual(expect.arrayContaining(["Key Responsibilities", "Output Format"]));
    expect(inventory.agents[0].gateTokens).toContain("PR-SPRINT");
    expect(inventory.agents[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(verticalSlice?.agent).toBe("prototyper");
    expect(verticalSlice?.argumentHint).toBe("[--review full|lean|solo]");
    expect(verticalSlice?.phaseHeadings).toContain("Phase 1: Resolve Review Mode and Load Context");
    expect(verticalSlice?.contextFiles).toEqual(expect.arrayContaining(["CLAUDE.md", "design/gdd/game-concept.md"]));
    expect(verticalSlice?.verdictTokens).toEqual(expect.arrayContaining(["PROCEED", "PIVOT", "KILL"]));
    expect(inventory.workflowSteps).toContainEqual(expect.objectContaining({ id: "game-concept", required: true, repeatable: true, artifact: expect.objectContaining({ glob: "design/gdd/game-concept.md" }) }));
  });

  test("generates a one-row-per-source parity matrix with decisions, scores, hashes, and reports", () => {
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(fixtureRoot()), defaultProjectConfig({ name: "Parity Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    expect(matrix.rows).toHaveLength(6);
    expect(matrix.rows.every((row) => row.decision && row.rationale && row.sourceHash)).toBe(true);
    expect(matrix.rows.find((row) => row.sourceId === "producer")?.cgsTarget).toEqual(expect.objectContaining({ kind: "role", id: "producer", path: "src/roles.ts", hash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(matrix.rows.find((row) => row.sourceId === "producer")?.status).toBe("implemented");
    expect(matrix.rows.find((row) => row.sourceId === "writer")?.status).toBe("implemented");
    expect(matrix.rows.find((row) => row.sourceId === "vertical-slice")?.cgsTarget).toEqual(expect.objectContaining({ kind: "skill", id: "cgs-vertical-slice", path: "src/skills.ts", hash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(matrix.rows.find((row) => row.sourceId === "localize")?.cgsTarget).toEqual(expect.objectContaining({ kind: "skill", id: "cgs-localize", path: "src/skills.ts" }));
    expect(matrix.rows.find((row) => row.sourceId === "game-concept")?.decision).toBe("adapt");
    expect(matrix.rows.find((row) => row.sourceId === "game-concept")?.status).toBe("implemented");
    expect(validateParityMatrix(matrix)).toEqual([]);
    const markdown = renderParityMatrixMarkdown(matrix);
    expect(markdown).toContain("## Decision Summary");
    expect(markdown).toContain(`- Total rows: ${matrix.rows.length}`);
    const out = mkdtempSync(path.join(tmpdir(), "ccgs-parity-out-"));
    writeParityReports(matrix, out);
    expect(JSON.parse(readFileSync(path.join(out, "ccgs-surface-parity-matrix.json"), "utf8")).rows).toHaveLength(matrix.rows.length);
    expect(readFileSync(path.join(out, "ccgs-surface-parity-matrix.md"), "utf8")).toContain(`- Total rows: ${matrix.rows.length}`);
  });

  test("writes an actionable generated remaining-gap report", () => {
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(fixtureRoot()), defaultProjectConfig({ name: "Gap Report Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const templateGap = {
      ...matrix.rows[0],
      sourceType: "template" as const,
      sourceId: "missing-template",
      sourcePath: ".claude/docs/templates/missing-template.md",
      cgsTarget: { kind: "template" as const, id: "missing-template", path: "templates/" },
      decision: "adopt" as const,
      status: "todo" as const,
      ownerPath: "templates/",
      testPath: "tests/agents-templates.test.ts"
    };
    const ruleGap = {
      ...matrix.rows[0],
      sourceType: "rule" as const,
      sourceId: "ui-code",
      sourcePath: ".claude/rules/ui-code.md",
      cgsTarget: { kind: "rule" as const, id: "ui-code", path: "src/skills.ts" },
      decision: "adapt" as const,
      status: "deferred" as const,
      ownerPath: "src/skills.ts",
      testPath: "tests/codex-context-files.test.ts"
    };
    matrix.rows.push(templateGap, ruleGap);
    matrix.counts.template += 1;
    matrix.counts.rule += 1;
    matrix.counts.total += 2;

    const markdown = renderRemainingGapTasksMarkdown(matrix);
    expect(markdown).toContain("- Implemented parity rows: 6");
    expect(markdown).toContain("- Remaining parity rows: 2");
    expect(markdown).toContain("## Role package gaps");
    expect(markdown).toContain("No remaining rows.");
    expect(markdown).toContain("## Workflow-step gaps");
    expect(markdown).toContain("No remaining rows.");
    expect(markdown).toContain("## Template gaps");
    expect(markdown).toContain("`missing-template` → template:missing-template");
    expect(markdown).toContain("## Rule adaptation gaps");
    expect(markdown).toContain("`ui-code` → rule:ui-code");
    expect(markdown).toContain("Prompt-surface metadata completion is not the same as full CCGS product-parity completion.");
    expect(markdown).not.toContain("`producer` → role:producer");
    expect(markdown).not.toContain("`vertical-slice` → skill:cgs-vertical-slice");

    const out = mkdtempSync(path.join(tmpdir(), "ccgs-gap-out-"));
    writeParityReports(matrix, out);
    expect(readFileSync(path.join(out, "ccgs-remaining-gap-tasks.md"), "utf8")).toBe(markdown);
  });

  test("accessibility specialist direct role parity is implemented after CCGS-depth upgrade", () => {
    const root = fixtureRoot();
    writeFileSync(path.join(root, ".claude", "agents", "accessibility-specialist.md"), `---\nname: accessibility-specialist\ndescription: Accessibility specialist\ntools: Read, Write\nskills: [accessibility-audit]\n---\n\n## Core Responsibilities\n\n- Audit all UI and gameplay for accessibility compliance\n- Define WCAG 2.1 accessibility standards\n\n## Findings Format\n\nFinding | WCAG Criterion | Severity | Recommendation\n`);
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Accessibility Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const row = matrix.rows.find((item) => item.sourceType === "agent" && item.sourceId === "accessibility-specialist");
    expect(row?.status).toBe("implemented");
    expect(row?.rationale).toContain("upgraded CCGS-depth Codex role package");
    expect(renderRemainingGapTasksMarkdown(matrix)).not.toContain("`accessibility-specialist` → role:accessibility-specialist");
  });

  test("remaining direct role gaps are closed before major gap categories", () => {
    const directRoleGapIds = [
      "ai-programmer",
      "audio-director",
      "community-manager",
      "devops-engineer",
      "economy-designer",
      "engine-programmer",
      "godot-specialist",
      "level-designer",
      "live-ops-designer",
      "localization-lead",
      "network-programmer",
      "security-engineer",
      "sound-designer",
      "technical-artist",
      "tools-programmer",
      "ui-programmer",
      "unity-specialist",
      "unreal-specialist",
      "world-builder",
      "writer"
    ];
    const root = fixtureRoot();
    for (const roleId of directRoleGapIds) {
      writeFileSync(path.join(root, ".claude", "agents", `${roleId}.md`), `---
name: ${roleId}
description: ${roleId} upstream role
tools: Read, Write
skills: [${roleId}-skill]
---

## Core Responsibilities

- Own ${roleId} production work
- Produce implementation-ready findings and handoffs

## Output Format

Summary | Risks | Verification | Handoff
`);
    }

    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Direct Role Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const remainingDirectRoleRows = matrix.rows.filter((row) => row.sourceType === "agent" && row.decision === "adapt" && row.cgsTarget.kind === "role" && row.status !== "implemented");
    expect(remainingDirectRoleRows).toEqual([]);
    const report = renderRemainingGapTasksMarkdown(matrix);
    for (const roleId of directRoleGapIds) expect(report).not.toContain(`\`${roleId}\` → role:${roleId}`);
  });

  test("engine sub-specialist role gaps are closed as first-class Codex roles", () => {
    const engineSubSpecialistIds = [
      "godot-csharp-specialist", "godot-gdextension-specialist", "godot-gdscript-specialist", "godot-shader-specialist",
      "ue-blueprint-specialist", "ue-gas-specialist", "ue-replication-specialist", "ue-umg-specialist",
      "unity-addressables-specialist", "unity-dots-specialist", "unity-shader-specialist", "unity-ui-specialist"
    ];
    const root = fixtureRoot();
    for (const roleId of engineSubSpecialistIds) {
      writeFileSync(path.join(root, ".claude", "agents", `${roleId}.md`), `---
name: ${roleId}
description: ${roleId} upstream role
tools: Read, Write
---

## Core Responsibilities

- Own ${roleId} subsystem work
- Produce implementation-ready findings and handoffs

## Output Format

Summary | Risks | Verification | Handoff
`);
    }
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Engine Specialist Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const engineRows = matrix.rows.filter((row) => row.sourceType === "agent" && engineSubSpecialistIds.includes(row.sourceId));
    expect(engineRows).toHaveLength(engineSubSpecialistIds.length);
    expect(engineRows.every((row) => row.status === "implemented" && row.cgsTarget.kind === "role")).toBe(true);
    const report = renderRemainingGapTasksMarkdown(matrix);
    for (const roleId of engineSubSpecialistIds) expect(report).not.toContain(`\`${roleId}\` → role:${roleId}`);
  });

  test("all CCGS workflow-step gaps are implemented as first-class Codex workflows", () => {
    const root = fixtureRoot();
    const allWorkflowGapIds = [...firstBatchWorkflowGapIds, ...secondBatchWorkflowGapIds];
    writeFileSync(path.join(root, ".claude", "docs", "workflow-catalog.yaml"), workflowCatalogYaml(allWorkflowGapIds));
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Workflow Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const workflowRows = matrix.rows.filter((row) => row.sourceType === "workflow-step");

    expect(workflowRows).toHaveLength(allWorkflowGapIds.length);
    expect(workflowRows.every((row) => row.status === "implemented" && row.cgsTarget.kind === "workflow")).toBe(true);
    for (const id of allWorkflowGapIds) expect(renderRemainingGapTasksMarkdown(matrix)).not.toContain(`\`${id}\` → workflow:${id}`);
    expect(renderRemainingGapTasksMarkdown(matrix)).toContain("## Workflow-step gaps\n\nNo remaining rows.");
  });

  test("all remaining CCGS template gaps are implemented as package templates", () => {
    const root = fixtureRoot();
    mkdirSync(path.join(root, ".claude", "docs", "templates"), { recursive: true });
    for (const id of remainingTemplateGapIds) {
      writeFileSync(path.join(root, ".claude", "docs", "templates", `${id}.md`), `# ${id}\n\n## Purpose\n\nUpstream template.\n\n## Inputs\n\n- Source artifact\n\n## Outputs\n\n- Reviewable artifact\n\n## Validation\n\n- Verification evidence\n`);
    }
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Template Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const templateRows = matrix.rows.filter((row) => row.sourceType === "template");

    expect(templateRows).toHaveLength(remainingTemplateGapIds.length);
    expect(templateRows.every((row) => row.status === "implemented" && row.cgsTarget.kind === "template")).toBe(true);
    for (const id of remainingTemplateGapIds) expect(renderRemainingGapTasksMarkdown(matrix)).not.toContain(`\`${id}\` → template:${id}`);
    expect(renderRemainingGapTasksMarkdown(matrix)).toContain("## Template gaps\n\nNo remaining rows.");
  });

  test("all remaining CCGS rule gaps are adapted as Codex standards skills", () => {
    const root = fixtureRoot();
    mkdirSync(path.join(root, ".claude", "rules"), { recursive: true });
    for (const id of remainingRuleGapIds) {
      writeFileSync(path.join(root, ".claude", "rules", `${id}.md`), `paths:\n- \"src/**\"\n\n# ${id}\n\n- Apply bounded Codex-native standards.\n- Report verification evidence.\n`);
    }
    const matrix = generateParityMatrix(inventoryCcgsSurfaces(root), defaultProjectConfig({ name: "Rule Gap Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    const ruleRows = matrix.rows.filter((row) => row.sourceType === "rule");

    expect(ruleRows).toHaveLength(remainingRuleGapIds.length);
    expect(ruleRows.every((row) => row.status === "implemented" && row.cgsTarget.kind === "skill")).toBe(true);
    for (const id of remainingRuleGapIds) {
      expect(ruleRows.find((row) => row.sourceId === id)?.cgsTarget.id).toBe(`cgs-standards-${id}`);
      expect(renderRemainingGapTasksMarkdown(matrix)).not.toContain(`\`${id}\` → skill:cgs-standards-${id}`);
    }
    expect(renderRemainingGapTasksMarkdown(matrix)).toContain("## Rule adaptation gaps\n\nNo remaining rows.");
  });

  test("upgraded template skills are no longer thin wrappers", () => {
    const definitions = templateSkillDefinitions(defaultProjectConfig({ name: "Skill Depth Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    expect(new Set(definitions.map((skill) => skill.name)).size).toBe(definitions.length);
    expect(definitions.map((skill) => skill.name)).toEqual(expect.arrayContaining(["cgs-brainstorm", "cgs-map-systems", "cgs-design-system", "cgs-vertical-slice", "cgs-bug-report", "cgs-qa-plan", "cgs-release-checklist", "cgs-localize", "cgs-team-ui", "cgs-standards-ai-code", "cgs-standards-ui-code"]));
    expect(definitions.find((skill) => skill.name === "cgs-vertical-slice")?.body).toContain("PROCEED / PIVOT / KILL");
    expect(definitions.find((skill) => skill.name === "cgs-bug-report")?.body).toContain("Expected vs Actual");
    for (const definition of definitions) {
      for (const marker of definition.requiredMarkers) expect(definition.body).toContain(`- ${marker}`);
    }
  });
});
