export const codexModelNames = ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini"] as const;
export type CodexModelName = (typeof codexModelNames)[number];

export const reasoningEfforts = ["minimal", "low", "medium", "high", "xhigh"] as const;
export type ReasoningEffort = (typeof reasoningEfforts)[number];

export const promptSurfaceComplexities = ["complex", "moderate", "simple"] as const;
export type PromptSurfaceComplexity = (typeof promptSurfaceComplexities)[number];

export type ModelPolicy = {
  model: string;
  model_reasoning_effort?: string;
  model_verbosity?: string;
  escalation?: string;
};

export type PromptSurfaceMetadata = {
  model: CodexModelName;
  model_reasoning_effort: ReasoningEffort;
  model_verbosity?: "low" | "medium" | "high";
  primary_agent?: string;
  related_agents?: string[];
  skills?: string[];
  source_reference?: string;
  source_hash?: string;
  tool_policy?: string[];
};

export type PromptDiscoveryDiagnosticId =
  | "prompt.discovery.agent.generic_description"
  | "prompt.discovery.agent.missing_ownership"
  | "prompt.discovery.agent.missing_boundary"
  | "prompt.discovery.skill.vague_description"
  | "prompt.discovery.skill.missing_trigger"
  | "prompt.discovery.skill.missing_outcome"
  | "prompt.discovery.workflow.generic_argument_hint"
  | "prompt.discovery.workflow.missing_input_request"
  | "prompt.discovery.workflow.missing_evidence";

export type PromptDiscoveryDiagnostic = {
  id: PromptDiscoveryDiagnosticId;
  message: string;
};

export type PromptDiscoveryQuality = {
  valid: boolean;
  diagnostics: PromptDiscoveryDiagnostic[];
};

const modelByComplexity: Record<PromptSurfaceComplexity, CodexModelName> = {
  complex: "gpt-5.5",
  moderate: "gpt-5.4",
  simple: "gpt-5.4-mini"
};

export function codexModelForComplexity(complexity: PromptSurfaceComplexity): CodexModelName {
  return modelByComplexity[complexity];
}

export function isCodexModelName(value: string | undefined): value is CodexModelName {
  return !!value && (codexModelNames as readonly string[]).includes(value);
}

export function isReasoningEffort(value: string | undefined): value is ReasoningEffort {
  return !!value && (reasoningEfforts as readonly string[]).includes(value);
}

export function validateModelPolicy(policy: ModelPolicy): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!isCodexModelName(policy.model)) issues.push(`invalid Codex model: ${policy.model}`);
  if (policy.model_reasoning_effort && !isReasoningEffort(policy.model_reasoning_effort)) issues.push(`invalid reasoning effort: ${policy.model_reasoning_effort}`);
  return { valid: issues.length === 0, issues };
}

function parseScalar(value: string): string | string[] | boolean {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => item.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
  }
  return trimmed.replace(/^['\"]|['\"]$/g, "");
}

export function parsePromptSurfaceFrontmatter(markdown: string): { frontmatter: Record<string, string | string[] | boolean>; body: string } {
  if (!markdown.startsWith("---\n")) return { frontmatter: {}, body: markdown };
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return { frontmatter: {}, body: markdown };
  const raw = markdown.slice(4, end);
  const body = markdown.slice(markdown.indexOf("\n", end + 1) + 1);
  const frontmatter: Record<string, string | string[] | boolean> = {};
  for (const line of raw.split("\n")) {
    const match = /^(?<key>[A-Za-z0-9_-]+):\s*(?<value>.*)$/.exec(line);
    if (!match?.groups) continue;
    frontmatter[match.groups.key] = parseScalar(match.groups.value);
  }
  return { frontmatter, body };
}

export function parseTomlStringField(body: string, key: string): string | undefined {
  const match = new RegExp(`^${key}\\s*=\\s*\"([^\"]*)\"`, "m").exec(body);
  return match?.[1];
}

export function parseTomlCommentStringField(body: string, key: string): string | undefined {
  const match = new RegExp(`^#\\s*${key}\\s*=\\s*\"([^\"]*)\"`, "m").exec(body);
  return match?.[1];
}

export function parseTomlArrayField(body: string, key: string): string[] {
  const match = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m").exec(body);
  if (!match) return [];
  return match[1].split(",").map((part) => part.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
}

export function parseTomlCommentArrayField(body: string, key: string): string[] {
  const match = new RegExp(`^#\\s*${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m").exec(body);
  if (!match) return [];
  return match[1].split(",").map((part) => part.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
}

export function inferComplexityFromId(id: string): PromptSurfaceComplexity {
  if (/help|status|changelog|patch-notes|smoke-check|project-stage-detect|standards/.test(id)) return "simple";
  if (/bugfix|hotfix|qa|test|regression|playtest|localize|perf|code-review|dev-story|task|story/.test(id)) return "moderate";
  return "complex";
}

export function defaultModelPolicyForId(id: string): { model: CodexModelName; effort: ReasoningEffort } {
  const complexity = inferComplexityFromId(id);
  if (complexity === "complex") return { model: "gpt-5.5", effort: "high" };
  if (complexity === "moderate") return { model: "gpt-5.4", effort: "medium" };
  return { model: "gpt-5.4-mini", effort: "low" };
}

function discoveryQuality(diagnostics: PromptDiscoveryDiagnostic[]): PromptDiscoveryQuality {
  return { valid: diagnostics.length === 0, diagnostics };
}

function hasAny(value: string, words: string[]): boolean {
  const lower = value.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function normalizedIdTerms(id: string): string[] {
  return id.replace(/^cgs-/, "").split(/[-_]+/).filter((term) => term.length > 2);
}

export function validateAgentDescriptionQuality(description: string | undefined, id: string): PromptDiscoveryQuality {
  const text = (description ?? "").trim();
  const diagnostics: PromptDiscoveryDiagnostic[] = [];
  const idTerms = normalizedIdTerms(id);
  if (!text || /^Game development .+ agent for .+ tasks in this template repository\.?$/i.test(text) || /\bagent for\b.+\btasks in this template repository/i.test(text)) {
    diagnostics.push({ id: "prompt.discovery.agent.generic_description", message: `${id} description is a generic role label` });
  }
  if (!hasAny(text, ["own", "owns", "guide", "guides", "review", "reviews", "coordinate", "coordinates", "implement", "implements", "produce", "produces", "define", "defines", "build", "builds", "plan", "plans", "validate", "validates", "audit", "audits", "manage", "manages", "shape", "shapes", "test", "tests", "verify", "verifies", "localize", "localizes", "optimize", "optimizes", "protect", "protects", "prepare", "prepares", "route", "routes", "analyze", "analyzes", "set", "sets"])) {
    diagnostics.push({ id: "prompt.discovery.agent.missing_ownership", message: `${id} description does not name role ownership` });
  }
  if (!hasAny(text, ["hand off", "handoff", "not for", "boundary", "escalate", "defer", "without owning", "use when"])) {
    diagnostics.push({ id: "prompt.discovery.agent.missing_boundary", message: `${id} description does not name a boundary or handoff condition` });
  }
  if (idTerms.length && !idTerms.some((term) => text.toLowerCase().includes(term))) {
    diagnostics.push({ id: "prompt.discovery.agent.generic_description", message: `${id} description lacks role-specific retrieval terms` });
  }
  return discoveryQuality(diagnostics);
}

export function validateSkillDescriptionQuality(description: string | undefined, id: string): PromptDiscoveryQuality {
  const text = (description ?? "").trim();
  const diagnostics: PromptDiscoveryDiagnostic[] = [];
  if (!/^Use for\b/.test(text)) diagnostics.push({ id: "prompt.discovery.skill.missing_trigger", message: `${id} description must start with a clear Use for trigger` });
  if (!text || /^Use for Codex Game Studio [^:]+ work\.?$/i.test(text) || /^Use for [a-z0-9 -]+ tasks?\.?$/i.test(text)) {
    diagnostics.push({ id: "prompt.discovery.skill.vague_description", message: `${id} description is too vague for skill selection` });
  }
  if (!hasAny(text, ["define", "defines", "produce", "produces", "create", "creates", "review", "reviews", "audit", "audits", "plan", "plans", "fix", "fixes", "verify", "verifies", "ship", "ships", "coordinate", "coordinates", "document", "documents", "extract", "extracts", "classify", "classifies", "prepare", "prepares", "triage", "triages", "validate", "validates", "generate", "generates", "evidence", "artifact", "handoff", "checklist", "report", "criteria", "boundary"])) {
    diagnostics.push({ id: "prompt.discovery.skill.missing_outcome", message: `${id} description does not name a concrete outcome, artifact, or evidence` });
  }
  return discoveryQuality(diagnostics);
}

export function validateWorkflowArgumentHintQuality(argumentHint: string | undefined, id: string): PromptDiscoveryQuality {
  const text = (argumentHint ?? "").trim();
  const diagnostics: PromptDiscoveryDiagnostic[] = [];
  if (!text || /^Describe the .+ goal, target milestone\/files, constraints, and required evidence\.?$/i.test(text)) {
    diagnostics.push({ id: "prompt.discovery.workflow.generic_argument_hint", message: `${id} argument hint is generic scaffold text` });
  }
  if (!/^Provide\b/.test(text)) diagnostics.push({ id: "prompt.discovery.workflow.missing_input_request", message: `${id} argument hint should ask the user to provide concrete input` });
  if (!hasAny(text, ["target", "file", "files", "asset", "assets", "milestone", "scene", "code", "docs", "constraints", "scope"]) || !hasAny(text, ["evidence", "verification", "acceptance", "handoff", "build", "test", "playtest", "gate", "decision"])) {
    diagnostics.push({ id: "prompt.discovery.workflow.missing_evidence", message: `${id} argument hint must request targets/constraints and verification or handoff evidence` });
  }
  return discoveryQuality(diagnostics);
}
