import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { generateParityMatrix, inventoryCcgsSurfaces, renderParityMatrixMarkdown, validateParityMatrix, writeParityReports } from "../src/ccgs-parity.js";
import { defaultProjectConfig } from "../src/projects.js";
import { generatedSkillDefinitions } from "../src/skills.js";

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
    expect(matrix.rows.find((row) => row.sourceId === "writer")?.status).toBe("todo");
    expect(matrix.rows.find((row) => row.sourceId === "vertical-slice")?.cgsTarget).toEqual(expect.objectContaining({ kind: "skill", id: "cgs-vertical-slice", path: "src/skills.ts", hash: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(matrix.rows.find((row) => row.sourceId === "localize")?.cgsTarget).toEqual(expect.objectContaining({ kind: "skill", id: "cgs-localize", path: "src/skills.ts" }));
    expect(matrix.rows.find((row) => row.sourceId === "game-concept")?.decision).toBe("adopt");
    expect(validateParityMatrix(matrix)).toEqual([]);
    const markdown = renderParityMatrixMarkdown(matrix);
    expect(markdown).toContain("## Decision Summary");
    expect(markdown).toContain(`- Total rows: ${matrix.rows.length}`);
    const out = mkdtempSync(path.join(tmpdir(), "ccgs-parity-out-"));
    writeParityReports(matrix, out);
    expect(JSON.parse(readFileSync(path.join(out, "ccgs-surface-parity-matrix.json"), "utf8")).rows).toHaveLength(matrix.rows.length);
    expect(readFileSync(path.join(out, "ccgs-surface-parity-matrix.md"), "utf8")).toContain(`- Total rows: ${matrix.rows.length}`);
  });

  test("upgraded generated skills are no longer thin wrappers", () => {
    const definitions = generatedSkillDefinitions(defaultProjectConfig({ name: "Skill Depth Game", engine: "godot", mode: "prototype", nonInteractive: true }));
    expect(new Set(definitions.map((skill) => skill.name)).size).toBe(definitions.length);
    expect(definitions.map((skill) => skill.name)).toEqual(expect.arrayContaining(["cgs-brainstorm", "cgs-map-systems", "cgs-design-system", "cgs-vertical-slice", "cgs-bug-report", "cgs-qa-plan", "cgs-release-checklist", "cgs-localize", "cgs-team-ui"]));
    expect(definitions.find((skill) => skill.name === "cgs-vertical-slice")?.body).toContain("PROCEED / PIVOT / KILL");
    expect(definitions.find((skill) => skill.name === "cgs-bug-report")?.body).toContain("Expected vs Actual");
    for (const definition of definitions) {
      for (const marker of definition.requiredMarkers) expect(definition.body).toContain(`- ${marker}`);
    }
  });
});
