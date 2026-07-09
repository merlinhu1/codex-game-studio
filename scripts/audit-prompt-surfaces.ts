import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parsePromptSurfaceFrontmatter,
  parseTomlCommentArrayField,
  parseTomlCommentStringField,
  parseTomlStringField,
  validateAgentDescriptionQuality,
  validateSkillDescriptionQuality,
  validateWorkflowArgumentHintQuality,
  type PromptDiscoveryQuality
} from "../src/prompt-surface-metadata.js";

export const promptSurfaceDecisions = ["adopt", "adapt", "merge", "split", "defer", "out-of-scope"] as const;
type PromptSurfaceDecision = (typeof promptSurfaceDecisions)[number];

type SurfaceRow = {
  sourceType: "agent" | "skill" | "workflow";
  localPath: string;
  sourcePath?: string;
  sourceHash?: string;
  sourceMetadata: Record<string, string | string[] | boolean>;
  decision: PromptSurfaceDecision;
  status: "complete" | "needs-uplift" | "deferred";
  requiredTests: string[];
  lineCount: number;
  upstreamLineCount?: number;
  depthScore: number;
  metadata: Record<string, boolean>;
  discoveryMetadata: PromptDiscoveryQuality & { text: string };
};

type AuditReport = {
  local: { agents: number; workflows: number; skills: number };
  upstream: { agents: number; skills: number };
  decisionLegend: PromptSurfaceDecision[];
  rows: SurfaceRow[];
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const upstreamRoot = process.env.CCGS_ROOT || "/opt/data/repos/Claude-Code-Game-Studios";
const capturedSourceKeys = ["model", "tools", "allowed-tools", "disallowedTools", "skills", "agent", "memory", "isolation", "argument-hint", "user-invocable", "maxTurns"];

function sha256(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

function files(dir: string, predicate: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
}

function rel(file: string, root = repoRoot): string {
  return path.relative(root, file).split(path.sep).join("/");
}

function lineCount(body: string): number {
  return body.split("\n").length - (body.endsWith("\n") ? 1 : 0);
}

function upstreamSkillFor(localPath: string): string | undefined {
  const match = /^\.agents\/skills\/cgs-(.+)\/SKILL\.md$/.exec(localPath);
  if (!match) return undefined;
  const candidate = path.join(upstreamRoot, ".claude", "skills", match[1], "SKILL.md");
  return existsSync(candidate) ? candidate : undefined;
}

function upstreamAgentFor(localPath: string): string | undefined {
  const id = path.basename(localPath, ".toml");
  const candidate = path.join(upstreamRoot, ".claude", "agents", `${id}.md`);
  return existsSync(candidate) ? candidate : undefined;
}

function depthScoreFor(body: string): number {
  const sections = ["Purpose", "Inputs", "Prerequisites", "Arguments", "Procedure", "Phased Procedure", "Decision Gates", "Output", "Output Contract", "Quality Gates", "Failure Modes", "Verification", "Handoff", "Stop Conditions"];
  let score = Math.min(25, Math.floor(lineCount(body) / 20));
  for (const section of sections) if (new RegExp(`^#{1,3}\\s+${section}`, "mi").test(body)) score += 6;
  if (/model\s*[:=]/.test(body)) score += 8;
  if (/source[-_]reference\s*[:=]|source_reference\s*=/.test(body)) score += 8;
  return Math.min(score, 100);
}

function captureSourceMetadata(body: string): Record<string, string | string[] | boolean> {
  const { frontmatter } = parsePromptSurfaceFrontmatter(body);
  const captured: Record<string, string | string[] | boolean> = {};
  for (const key of capturedSourceKeys) if (frontmatter[key] !== undefined) captured[key] = frontmatter[key];
  return captured;
}

function markdownMetadata(body: string): Record<string, boolean> {
  const parsed = parsePromptSurfaceFrontmatter(body).frontmatter;
  return {
    tier: typeof parsed.model_tier === "string",
    model: typeof parsed.model === "string",
    reasoning: typeof parsed.model_reasoning_effort === "string" || typeof parsed["model-reasoning-effort"] === "string",
    argumentHint: typeof parsed["argument-hint"] === "string",
    sourceReference: typeof parsed["source-reference"] === "string" || typeof parsed.source_reference === "string",
    sourceHash: typeof parsed["source-hash"] === "string" || typeof parsed.source_hash === "string",
    agent: typeof parsed.agent === "string" || typeof parsed["primary-agent"] === "string",
    links: Array.isArray(parsed["linked-skills"]) || Array.isArray(parsed.skills)
  };
}

function tomlMetadata(body: string): Record<string, boolean> {
  return {
    tier: !!parseTomlCommentStringField(body, "model_tier"),
    model: !!parseTomlStringField(body, "model"),
    reasoning: !!parseTomlStringField(body, "model_reasoning_effort"),
    sourceReference: !!parseTomlCommentStringField(body, "source_reference"),
    sourceHash: !!parseTomlCommentStringField(body, "source_hash"),
    primarySkills: parseTomlCommentArrayField(body, "primary_skills").length > 0,
    toolPolicy: parseTomlCommentArrayField(body, "allowed_tool_categories").length > 0
  };
}

function discoveryMetadataFor(type: SurfaceRow["sourceType"], id: string, body: string): PromptDiscoveryQuality & { text: string } {
  if (type === "agent") {
    const text = parseTomlStringField(body, "description") ?? "";
    return { text, ...validateAgentDescriptionQuality(text, id) };
  }
  const { frontmatter } = parsePromptSurfaceFrontmatter(body);
  if (type === "workflow") {
    const text = typeof frontmatter["argument-hint"] === "string" ? frontmatter["argument-hint"] : "";
    return { text, ...validateWorkflowArgumentHintQuality(text, id) };
  }
  const text = typeof frontmatter.description === "string" ? frontmatter.description : "";
  return { text, ...validateSkillDescriptionQuality(text, id) };
}

function requiredTestsFor(type: SurfaceRow["sourceType"]): string[] {
  if (type === "workflow") return ["tests/workflow-catalog.test.ts", "tests/workflow-recipes.test.ts", "tests/validation.test.ts"];
  if (type === "agent") return ["tests/template-repository-surfaces.test.ts", "tests/roles.test.ts", "tests/validation.test.ts"];
  return ["tests/template-repository-surfaces.test.ts", "tests/validation.test.ts"];
}

function statusFor(source: string | undefined, depthScore: number, metadata: Record<string, boolean>): SurfaceRow["status"] {
  if (!source) return "deferred";
  return depthScore >= 50 && metadata.tier && metadata.model && metadata.sourceHash ? "complete" : "needs-uplift";
}

function rowFor(type: SurfaceRow["sourceType"], file: string): SurfaceRow {
  const localPath = rel(file);
  const body = readFileSync(file, "utf8");
  const source = type === "agent" ? upstreamAgentFor(localPath) : type === "skill" ? upstreamSkillFor(localPath) : undefined;
  const sourceBody = source ? readFileSync(source, "utf8") : undefined;
  const id = type === "skill" ? localPath.split("/")[2].replace(/^cgs-/, "") : path.basename(localPath).replace(/\.(toml|md)$/, "");
  const metadata = type === "agent" ? tomlMetadata(body) : markdownMetadata(body);
  const depthScore = depthScoreFor(body);
  return {
    sourceType: type,
    localPath,
    sourcePath: source ? rel(source, upstreamRoot) : undefined,
    sourceHash: sourceBody ? sha256(sourceBody) : undefined,
    sourceMetadata: sourceBody ? captureSourceMetadata(sourceBody) : {},
    decision: source ? "adapt" : "defer",
    status: statusFor(source, depthScore, metadata),
    requiredTests: requiredTestsFor(type),
    lineCount: lineCount(body),
    upstreamLineCount: sourceBody ? lineCount(sourceBody) : undefined,
    depthScore,
    metadata,
    discoveryMetadata: discoveryMetadataFor(type, id, body)
  };
}

export function auditPromptSurfaces(): AuditReport {
  const agentFiles = files(path.join(repoRoot, ".codex", "agents"), (name) => name.endsWith(".toml"));
  const workflowFiles = files(path.join(repoRoot, ".codex", "workflows"), (name) => name.endsWith(".md"));
  const skillFiles = files(path.join(repoRoot, ".agents", "skills"), (name) => name === "SKILL.md");
  const upstreamAgents = files(path.join(upstreamRoot, ".claude", "agents"), (name) => name.endsWith(".md"));
  const upstreamSkills = files(path.join(upstreamRoot, ".claude", "skills"), (name) => name === "SKILL.md");
  const rows = [...agentFiles.map((file) => rowFor("agent", file)), ...workflowFiles.map((file) => rowFor("workflow", file)), ...skillFiles.map((file) => rowFor("skill", file))];
  return { local: { agents: agentFiles.length, workflows: workflowFiles.length, skills: skillFiles.length }, upstream: { agents: upstreamAgents.length, skills: upstreamSkills.length }, decisionLegend: [...promptSurfaceDecisions], rows };
}

function writeReports(report: AuditReport): void {
  const refDir = path.join(repoRoot, "references");
  mkdirSync(refDir, { recursive: true });
  writeFileSync(path.join(refDir, "prompt-surface-uplift-matrix.json"), `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    "# Prompt Surface Uplift Matrix",
    "",
    `Local agents: ${report.local.agents}; workflows: ${report.local.workflows}; skills: ${report.local.skills}.`,
    `Upstream agents: ${report.upstream.agents}; skills: ${report.upstream.skills}.`,
    `Decisions: ${report.decisionLegend.join(", ")}.`,
    "",
    "| Type | Local path | Upstream source | Decision | Status | Lines | Upstream lines | Score | Tier/model metadata | Discovery metadata | Required tests |",
    "| --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |",
    ...report.rows.map((row) => `| ${row.sourceType} | \`${row.localPath}\` | ${row.sourcePath ? `\`${row.sourcePath}\`` : ""} | ${row.decision} | ${row.status} | ${row.lineCount} | ${row.upstreamLineCount ?? ""} | ${row.depthScore} | ${row.metadata.tier && row.metadata.model ? "yes" : "no"} | ${row.discoveryMetadata.valid ? "pass" : row.discoveryMetadata.diagnostics.map((diagnostic) => diagnostic.id).join("<br>")} | ${row.requiredTests.map((test) => `\`${test}\``).join("<br>")} |`),
    ""
  ];
  writeFileSync(path.join(refDir, "prompt-surface-uplift-matrix.md"), lines.join("\n"));
}

const report = auditPromptSurfaces();
writeReports(report);
if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report)}\n`);
else process.stdout.write(`Prompt surface audit complete: ${report.rows.length} rows\n`);
