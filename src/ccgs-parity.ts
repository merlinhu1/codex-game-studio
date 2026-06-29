import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import type { ProjectConfig } from "./config.js";
import { ccgsParityUpgradedRoleIds, rolePackages, type StudioRoleId } from "./roles.js";
import { workflowIds, workflowRegistry } from "./workflows.js";
import { generatedSkillDefinitions, renderGeneratedSkill } from "./skills.js";
import { listTemplates } from "./templates.js";

export type CcgsSourceType = "agent" | "skill" | "workflow-step" | "template" | "rule";
export type ParityDecision = "adopt" | "adapt" | "merge" | "rename-alias" | "defer" | "out-of-scope";
export type CgsTargetKind = "role" | "skill" | "workflow" | "template" | "rule" | "validation" | "none";

export type CcgsAgentInventory = {
  sourceType: "agent";
  id: string;
  sourcePath: string;
  sha256: string;
  frontmatter: Record<string, string>;
  body: string;
  sections: string[];
  skills: string[];
  gateTokens: string[];
  outputTemplates: string[];
};

export type CcgsSkillInventory = {
  sourceType: "skill";
  id: string;
  sourcePath: string;
  sha256: string;
  frontmatter: Record<string, string>;
  body: string;
  agent?: string;
  argumentHint?: string;
  allowedTools: string[];
  phaseHeadings: string[];
  contextFiles: string[];
  writeTargets: string[];
  verdictTokens: string[];
  outputTemplates: string[];
};

export type CcgsWorkflowStepInventory = {
  sourceType: "workflow-step";
  id: string;
  sourcePath: string;
  sha256: string;
  phase: string;
  name?: string;
  command?: string;
  required: boolean;
  repeatable: boolean;
  artifact?: { glob?: string; pattern?: string; minCount?: number; note?: string };
  description?: string;
  nextPhase?: string;
};

export type CcgsTextInventory = {
  sourceType: "template" | "rule";
  id: string;
  sourcePath: string;
  sha256: string;
  body: string;
  sections: string[];
};

export type CcgsInventory = {
  root: string;
  generatedAt: string;
  agents: CcgsAgentInventory[];
  skills: CcgsSkillInventory[];
  workflowSteps: CcgsWorkflowStepInventory[];
  templates: CcgsTextInventory[];
  rules: CcgsTextInventory[];
};

export type SurfaceScores = {
  contentDepth: number;
  proceduralSpecificity: number;
  contextContract: number;
  outputContract: number;
  roleSkillLinkage: number;
  gateEscalation: number;
  codexFit: number;
  testability: number;
};

export type ParityRow = {
  sourceType: CcgsSourceType;
  sourceId: string;
  sourcePath: string;
  sourceHash: string;
  cgsTarget: { kind: CgsTargetKind; id: string; path: string; hash?: string };
  decision: ParityDecision;
  rationale: string;
  scores: SurfaceScores;
  ownerPath: string;
  testPath: string;
  status: "todo" | "implemented" | "deferred" | "out-of-scope";
};

export type ParityMatrix = {
  schemaVersion: "ccgs-surface-parity/v1";
  generatedAt: string;
  referenceRoot: string;
  counts: Record<CcgsSourceType | "total", number>;
  rows: ParityRow[];
};

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function rel(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/");
}

function readText(file: string): string {
  return readFileSync(file, "utf8");
}

function listFiles(dir: string, predicate: (file: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, predicate));
    else if (entry.isFile() && predicate(full)) out.push(full);
  }
  return out.sort();
}

function parseFrontmatter(text: string): { frontmatter: Record<string, string>; body: string } {
  if (!text.startsWith("---\n")) return { frontmatter: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { frontmatter: {}, body: text };
  const raw = text.slice(4, end).trim();
  const frontmatter: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    frontmatter[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return { frontmatter, body: text.slice(end + 5).replace(/^\s+/, "") };
}

function markdownSections(body: string): string[] {
  return [...body.matchAll(/^#{2,4}\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
}

function bracketList(value?: string): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }
  return trimmed.split(/[ ,]+/).filter(Boolean);
}

function tokens(body: string, known: string[]): string[] {
  return known.filter((token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(body));
}

function contextFiles(body: string): string[] {
  const results = new Set<string>();
  for (const match of body.matchAll(/[`"]?((?:CLAUDE|AGENTS)\.md|(?:design|docs|src|production|\.claude|\.codex|\.agents)\/[A-Za-z0-9_./-]+\.(?:md|json|yaml|yml|txt))[`"]?/g)) {
    results.add(match[1]);
  }
  return [...results].sort();
}

function writeTargets(body: string): string[] {
  const results = new Set<string>();
  for (const match of body.matchAll(/(?:write|create|update|append to)\s+[`"]?((?:design|docs|src|production|prototypes|assets|tests)\/[A-Za-z0-9_./-]+)[`"]?/gi)) {
    results.add(match[1]);
  }
  return [...results].sort();
}

function parseWorkflowCatalog(root: string): CcgsWorkflowStepInventory[] {
  const file = path.join(root, ".claude", "docs", "workflow-catalog.yaml");
  if (!existsSync(file)) return [];
  const body = readText(file);
  const hash = sha256(body);
  const lines = body.split(/\r?\n/);
  const rows: CcgsWorkflowStepInventory[] = [];
  let phase = "unknown";
  let nextPhase: string | undefined;
  let current: CcgsWorkflowStepInventory | undefined;
  let inArtifact = false;
  for (const line of lines) {
    const phaseMatch = /^\s{2}([a-z0-9-]+):\s*$/.exec(line);
    if (phaseMatch) {
      phase = phaseMatch[1];
      nextPhase = undefined;
      current = undefined;
      inArtifact = false;
      continue;
    }
    const nextMatch = /^\s{4}next_phase:\s*(.+)\s*$/.exec(line);
    if (nextMatch) nextPhase = nextMatch[1].replace(/^"|"$/g, "");
    const stepMatch = /^\s{6}- id:\s*([a-z0-9-]+)\s*$/.exec(line);
    if (stepMatch) {
      current = { sourceType: "workflow-step", id: stepMatch[1], sourcePath: rel(root, file), sha256: hash, phase, required: false, repeatable: false, nextPhase };
      rows.push(current);
      inArtifact = false;
      continue;
    }
    if (!current) continue;
    const prop = /^\s{8}([a-z_]+):\s*(.*)$/.exec(line);
    if (prop) {
      inArtifact = prop[1] === "artifact";
      const value = prop[2].trim().replace(/^"|"$/g, "");
      if (prop[1] === "name") current.name = value;
      if (prop[1] === "command") current.command = value;
      if (prop[1] === "required") current.required = value === "true";
      if (prop[1] === "repeatable") current.repeatable = value === "true";
      if (prop[1] === "description") current.description = value;
      if (prop[1] === "artifact") current.artifact = {};
      continue;
    }
    const artifactProp = /^\s{10}([a-z_]+):\s*(.*)$/.exec(line);
    if (inArtifact && artifactProp) {
      const value = artifactProp[2].trim().replace(/^"|"$/g, "");
      current.artifact ??= {};
      if (artifactProp[1] === "glob") current.artifact.glob = value;
      if (artifactProp[1] === "pattern") current.artifact.pattern = value;
      if (artifactProp[1] === "note") current.artifact.note = value;
      if (artifactProp[1] === "min_count") current.artifact.minCount = Number(value);
    }
  }
  return rows;
}

export function inventoryCcgsSurfaces(root = process.env.CCGS_REFERENCE_ROOT ?? "/opt/data/repos/Claude-Code-Game-Studios"): CcgsInventory {
  if (!existsSync(root)) throw new Error(`CCGS reference root missing: ${root}`);
  const agents = listFiles(path.join(root, ".claude", "agents"), (file) => file.endsWith(".md")).map((file): CcgsAgentInventory => {
    const text = readText(file);
    const { frontmatter, body } = parseFrontmatter(text);
    return {
      sourceType: "agent",
      id: path.basename(file, ".md"),
      sourcePath: rel(root, file),
      sha256: sha256(text),
      frontmatter,
      body,
      sections: markdownSections(body),
      skills: bracketList(frontmatter.skills),
      gateTokens: [...new Set([...body.matchAll(/\[([A-Z]{2,}(?:-[A-Z0-9]+)+)\]/g)].map((match) => match[1]))].sort(),
      outputTemplates: markdownSections(body).filter((section) => /output|format|template/i.test(section))
    };
  });
  const skills = listFiles(path.join(root, ".claude", "skills"), (file) => path.basename(file) === "SKILL.md").map((file): CcgsSkillInventory => {
    const text = readText(file);
    const { frontmatter, body } = parseFrontmatter(text);
    return {
      sourceType: "skill",
      id: path.basename(path.dirname(file)),
      sourcePath: rel(root, file),
      sha256: sha256(text),
      frontmatter,
      body,
      agent: frontmatter.agent,
      argumentHint: frontmatter["argument-hint"],
      allowedTools: bracketList(frontmatter["allowed-tools"]),
      phaseHeadings: markdownSections(body).filter((section) => /^Phase\s+\d+/i.test(section)),
      contextFiles: contextFiles(body),
      writeTargets: writeTargets(body),
      verdictTokens: tokens(body, ["PROCEED", "PIVOT", "KILL", "PASS", "FAIL", "APPROVE", "CONCERNS", "BLOCKED", "GO", "NO-GO"]),
      outputTemplates: markdownSections(body).filter((section) => /output|format|report|template|handoff/i.test(section))
    };
  });
  const templates = listFiles(path.join(root, ".claude", "docs", "templates"), (file) => file.endsWith(".md")).map((file): CcgsTextInventory => {
    const body = readText(file);
    return { sourceType: "template", id: path.basename(file, ".md"), sourcePath: rel(root, file), sha256: sha256(body), body, sections: markdownSections(body) };
  });
  const rules = listFiles(path.join(root, ".claude", "rules"), (file) => file.endsWith(".md")).map((file): CcgsTextInventory => {
    const body = readText(file);
    return { sourceType: "rule", id: path.basename(file, ".md"), sourcePath: rel(root, file), sha256: sha256(body), body, sections: markdownSections(body) };
  });
  return { root, generatedAt: new Date(0).toISOString(), agents, skills, workflowSteps: parseWorkflowCatalog(root), templates, rules };
}

function scoreSurface(source: CcgsAgentInventory | CcgsSkillInventory | CcgsWorkflowStepInventory | CcgsTextInventory): SurfaceScores {
  const body = "body" in source ? source.body : `${source.description ?? ""} ${source.artifact?.glob ?? ""}`;
  const sections = "sections" in source ? source.sections.length : "phaseHeadings" in source ? source.phaseHeadings.length : source.artifact ? 2 : 1;
  return {
    contentDepth: Math.min(5, Math.max(1, Math.ceil(body.length / 2500) + Math.min(2, sections > 4 ? 2 : sections > 1 ? 1 : 0))),
    proceduralSpecificity: Math.min(5, (body.match(/\b(Phase|Step|Run|Ask|Write|Create|Verify|Check)\b/g) ?? []).length > 8 ? 5 : sections > 2 ? 4 : 2),
    contextContract: "contextFiles" in source ? Math.min(5, source.contextFiles.length + 1) : "inputs" in source ? 3 : body.includes("Read") ? 3 : 2,
    outputContract: "outputTemplates" in source ? Math.min(5, source.outputTemplates.length + 2) : body.includes("# ") ? 3 : 2,
    roleSkillLinkage: "skills" in source ? Math.min(5, source.skills.length + 2) : "agent" in source && source.agent ? 4 : 2,
    gateEscalation: "gateTokens" in source ? Math.min(5, source.gateTokens.length + 2) : "verdictTokens" in source ? Math.min(5, source.verdictTokens.length + 1) : body.match(/gate|verdict|escalat|block/i) ? 3 : 1,
    codexFit: body.match(/\.claude|Claude|AskUserQuestion|hooks/i) ? 3 : 5,
    testability: body.match(/test|verify|evidence|artifact|acceptance|validation/i) ? 4 : 2
  };
}

const roleAliases: Record<string, StudioRoleId> = {
  "art-director": "senior-game-artist",
  "narrative-director": "narrative-designer",
  "ux-designer": "ui-ux-designer",
  "qa-lead": "qa-playtester",
  "qa-tester": "qa-playtester",
  "lead-programmer": "technical-director",
  prototyper: "gameplay-programmer",
  "analytics-engineer": "data-scientist"
};

const cgsSkillAliases: Record<string, string> = { onboard: "cgs-start", localize: "cgs-localize" };

function cgsTargetHash(kind: CgsTargetKind, id: string, config: ProjectConfig): string | undefined {
  if (!id) return undefined;
  if (kind === "role" && id in rolePackages) return sha256(JSON.stringify(rolePackages[id as StudioRoleId]));
  if (kind === "skill") {
    const definition = generatedSkillDefinitions(config).find((skill) => skill.name === id);
    return definition ? sha256(renderGeneratedSkill(definition)) : undefined;
  }
  if (kind === "workflow" && id in workflowRegistry) return sha256(JSON.stringify(workflowRegistry[id as keyof typeof workflowRegistry]));
  return undefined;
}

function target(kind: CgsTargetKind, id: string, targetPath: string, config: ProjectConfig): ParityRow["cgsTarget"] {
  return { kind, id, path: targetPath, hash: cgsTargetHash(kind, id, config) };
}

function rowForSource(source: CcgsAgentInventory | CcgsSkillInventory | CcgsWorkflowStepInventory | CcgsTextInventory, config: ProjectConfig): ParityRow {
  const skillNames = new Set(generatedSkillDefinitions(config).map((skill) => skill.name));
  const workflowNames = new Set<string>(workflowIds());
  const templateNames = new Set(listTemplates().flatMap((template) => [template.id, template.id.replace(/_/g, "-")]));
  let cgsTarget: ParityRow["cgsTarget"] = target("none", "", "", config);
  let decision: ParityDecision = "defer";
  let status: ParityRow["status"] = "todo";
  let rationale = "No matching CGS surface exists yet; audit requires explicit follow-up.";
  let ownerPath = "references/ccgs-surface-parity-matrix.json";
  let testPath = "tests/ccgs-parity-audit.test.ts";

  if (source.sourceType === "agent") {
    if (source.id in rolePackages) {
      cgsTarget = target("role", source.id, "src/roles.ts", config);
      decision = "adapt";
      status = (ccgsParityUpgradedRoleIds as readonly string[]).includes(source.id) ? "implemented" : "todo";
      rationale = status === "implemented" ? "Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage." : "Direct role exists; adapt CCGS depth into Codex role package and generated TOML.";
      ownerPath = "src/roles.ts";
      testPath = "tests/agents-templates.test.ts";
    } else if (roleAliases[source.id]) {
      cgsTarget = target("role", roleAliases[source.id], "src/roles.ts", config);
      decision = "merge";
      status = (ccgsParityUpgradedRoleIds as readonly string[]).includes(roleAliases[source.id]) ? "implemented" : "todo";
      rationale = status === "implemented" ? "CCGS role is intentionally merged into an upgraded broader CGS role package." : "CCGS role is intentionally merged into a broader CGS role; accepted responsibilities must be covered there.";
      ownerPath = "src/roles.ts";
      testPath = "tests/agents-templates.test.ts";
    }
  } else if (source.sourceType === "skill") {
    const cgsName = cgsSkillAliases[source.id] ?? `cgs-${source.id}`;
    if (skillNames.has(cgsName)) {
      cgsTarget = target("skill", cgsName, "src/skills.ts", config);
      decision = "adapt";
      status = "implemented";
      rationale = "Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions.";
      ownerPath = "src/skills.ts";
      testPath = "tests/project-workflow.test.ts";
    } else if (workflowNames.has(source.id)) {
      cgsTarget = target("workflow", source.id, "src/workflows.ts", config);
      decision = "merge";
      rationale = "CCGS skill currently maps to a CGS workflow; decide whether to add a repository skill wrapper.";
      ownerPath = "src/workflows.ts";
    }
  } else if (source.sourceType === "workflow-step") {
    if (workflowNames.has(source.id)) {
      cgsTarget = target("workflow", source.id, "src/workflows.ts", config);
      decision = "adapt";
      status = "implemented";
      rationale = "Workflow exists; add CCGS-style phase/artifact semantics where useful.";
      ownerPath = "src/workflows.ts";
      testPath = "tests/workflow-recipes.test.ts";
    } else {
      cgsTarget = target("workflow", source.id, "src/workflow-catalog.ts", config);
      decision = "adopt";
      rationale = "CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias.";
      ownerPath = "src/workflow-catalog.ts";
      testPath = "tests/workflow-catalog.test.ts";
    }
  } else if (source.sourceType === "template") {
    if (templateNames.has(source.id)) {
      cgsTarget = target("template", source.id, "templates/", config);
      decision = "adapt";
      status = "implemented";
      rationale = "Template equivalent exists; compare body quality and update if thinner.";
      ownerPath = "templates/";
      testPath = "tests/agents-templates.test.ts";
    } else {
      cgsTarget = target("template", source.id, "templates/", config);
      decision = "adopt";
      rationale = "CCGS template has no CGS equivalent yet.";
      ownerPath = "templates/";
      testPath = "tests/agents-templates.test.ts";
    }
  } else {
    cgsTarget = target("rule", source.id, "src/skills.ts", config);
    decision = "adapt";
    rationale = "CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`.";
    ownerPath = "src/skills.ts";
    testPath = "tests/codex-context-files.test.ts";
  }

  return { sourceType: source.sourceType, sourceId: source.id, sourcePath: source.sourcePath, sourceHash: source.sha256, cgsTarget, decision, rationale, scores: scoreSurface(source), ownerPath, testPath, status };
}

export function generateParityMatrix(inventory: CcgsInventory, config: ProjectConfig): ParityMatrix {
  const rows = [...inventory.agents, ...inventory.skills, ...inventory.workflowSteps, ...inventory.templates, ...inventory.rules].map((source) => rowForSource(source, config));
  const counts = {
    agent: inventory.agents.length,
    skill: inventory.skills.length,
    "workflow-step": inventory.workflowSteps.length,
    template: inventory.templates.length,
    rule: inventory.rules.length,
    total: rows.length
  };
  return { schemaVersion: "ccgs-surface-parity/v1", generatedAt: new Date(0).toISOString(), referenceRoot: inventory.root, counts, rows };
}

export function validateParityMatrix(matrix: ParityMatrix): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const row of matrix.rows) {
    const key = `${row.sourceType}:${row.sourceId}:${row.sourcePath}`;
    if (row.sourceType !== "workflow-step" && seen.has(key)) errors.push(`duplicate row: ${key}`);
    seen.add(key);
    if (!row.sourceHash.match(/^[a-f0-9]{64}$/)) errors.push(`missing source hash: ${key}`);
    if (!row.decision) errors.push(`missing decision: ${key}`);
    if (!row.rationale.trim()) errors.push(`missing rationale: ${key}`);
    if (!row.ownerPath.trim()) errors.push(`missing owner path: ${key}`);
    if (!row.testPath.trim()) errors.push(`missing test path: ${key}`);
  }
  const counted = matrix.counts.agent + matrix.counts.skill + matrix.counts["workflow-step"] + matrix.counts.template + matrix.counts.rule;
  if (counted !== matrix.rows.length || matrix.counts.total !== matrix.rows.length) errors.push(`count mismatch: counts=${counted}/${matrix.counts.total}, rows=${matrix.rows.length}`);
  return errors;
}

function decisionSummary(rows: ParityRow[]): Record<ParityDecision, number> {
  const summary: Record<ParityDecision, number> = { adopt: 0, adapt: 0, merge: 0, "rename-alias": 0, defer: 0, "out-of-scope": 0 };
  for (const row of rows) summary[row.decision] += 1;
  return summary;
}

export function renderParityMatrixMarkdown(matrix: ParityMatrix): string {
  const summary = decisionSummary(matrix.rows);
  return [
    "# CCGS Surface Parity Matrix",
    "",
    `Reference root: \`${matrix.referenceRoot}\``,
    "",
    "## Counts",
    "",
    `- Agents: ${matrix.counts.agent}`,
    `- Skills: ${matrix.counts.skill}`,
    `- Workflow steps: ${matrix.counts["workflow-step"]}`,
    `- Templates: ${matrix.counts.template}`,
    `- Rules: ${matrix.counts.rule}`,
    `- Total rows: ${matrix.counts.total}`,
    "",
    "## Decision Summary",
    "",
    ...Object.entries(summary).map(([decision, count]) => `- ${decision}: ${count}`),
    "",
    "## Rows",
    "",
    "| Type | Source | Decision | CGS target | Status | Rationale |",
    "| --- | --- | --- | --- | --- | --- |",
    ...matrix.rows.map((row) => `| ${row.sourceType} | ${row.sourceId} | ${row.decision} | ${row.cgsTarget.kind}:${row.cgsTarget.id} | ${row.status} | ${row.rationale.replace(/\|/g, "/")} |`),
    ""
  ].join("\n");
}

export function writeParityReports(matrix: ParityMatrix, outDir = "references"): void {
  const errors = validateParityMatrix(matrix);
  if (errors.length) throw new Error(`Invalid parity matrix:\n${errors.join("\n")}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "ccgs-surface-parity-matrix.json"), `${JSON.stringify(matrix, null, 2)}\n`);
  writeFileSync(path.join(outDir, "ccgs-surface-parity-matrix.md"), renderParityMatrixMarkdown(matrix));
}
