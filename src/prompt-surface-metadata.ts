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

export function parseTomlArrayField(body: string, key: string): string[] {
  const match = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m").exec(body);
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
