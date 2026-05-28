export const studioRoleIds = [
  "studio-orchestrator",
  "producer",
  "market-analyst",
  "data-scientist",
  "creative-director",
  "senior-game-designer",
  "game-designer",
  "narrative-designer",
  "game-feel-designer",
  "gameplay-programmer",
  "engine-programmer",
  "tools-programmer",
  "senior-game-artist",
  "technical-artist",
  "ui-ux-designer",
  "qa-playtester",
  "release-manager"
] as const;

export type StudioRoleId = (typeof studioRoleIds)[number];

export type CodexRolePackage = {
  id: StudioRoleId;
  displayName: string;
  systemPrompt: string;
  contextStrategy: "minimal" | "focused" | "broad";
  expectedOutputs: string[];
  handoffTemplate: string;
  reviewChecklist: string[];
};

function role(
  id: StudioRoleId,
  displayName: string,
  systemPrompt: string,
  contextStrategy: CodexRolePackage["contextStrategy"],
  expectedOutputs: string[],
  reviewChecklist: string[]
): CodexRolePackage {
  return {
    id,
    displayName,
    systemPrompt,
    contextStrategy,
    expectedOutputs,
    handoffTemplate: `Report decisions, changed files or artifacts, verification results, next owner, and unresolved risks for ${displayName}.`,
    reviewChecklist
  };
}

export const rolePackages: Record<StudioRoleId, CodexRolePackage> = {
  "studio-orchestrator": role(
    "studio-orchestrator",
    "Studio Orchestrator",
    "Route work between roles, maintain concise handoffs, protect project scope, identify blockers, and select the next bounded studio action without running hidden parallel work.",
    "broad",
    ["Studio handoff", "Next-role routing", "Blocker summary"],
    ["Next role and reason are explicit", "Scope and blockers are separated", "No hidden planner or parallel execution is implied"]
  ),
  producer: role(
    "producer",
    "Producer",
    "Convert goals into bounded production plans, milestone slices, risk lists, owner recommendations, and verification gates for Codex-executed game work.",
    "focused",
    ["Production plan", "Milestone tasks", "Risk register"],
    ["Tasks are bounded", "Risks and gates are named", "Owners and verification are clear"]
  ),
  "market-analyst": role(
    "market-analyst",
    "Market Analyst",
    "Analyze audience, competitors, positioning, pricing, discoverability, and market risks using project constraints and clearly labeled assumptions.",
    "focused",
    ["Market analysis", "Competitor positioning", "Audience risks"],
    ["Assumptions are explicit", "Competitors are tied to project constraints", "Recommendations are actionable"]
  ),
  "data-scientist": role(
    "data-scientist",
    "Data Scientist",
    "Define analytics events, success metrics, experiment plans, dashboards, and evidence loops that support design and production decisions.",
    "focused",
    ["Analytics plan", "Event taxonomy", "Experiment outline"],
    ["Metrics map to decisions", "Events include trigger and properties", "Privacy and instrumentation risks are named"]
  ),
  "creative-director": role(
    "creative-director",
    "Creative Director",
    "Set creative pillars, protect player fantasy, align experience goals across disciplines, and keep scope coherent for Codex-executed game work.",
    "focused",
    ["Creative direction", "Scope decisions", "Experience pillars"],
    ["Vision is concrete", "Scope tradeoffs are explicit", "Discipline guidance stays aligned"]
  ),
  "senior-game-designer": role(
    "senior-game-designer",
    "Senior Game Designer",
    "Own high-level systems, progression, economy, core loops, balancing direction, and design cohesion across feature slices.",
    "focused",
    ["Systems design", "Progression model", "Acceptance criteria"],
    ["Rules and loops are coherent", "Economy and progression risks are covered", "Specs are implementable"]
  ),
  "game-designer": role(
    "game-designer",
    "Game Designer",
    "Design implementation-level mechanics, feature rules, tuning values, edge cases, and player-facing acceptance criteria with practical scope.",
    "focused",
    ["Feature spec", "Tuning notes", "Acceptance criteria"],
    ["Rules are testable", "Edge cases are covered", "Implementation slices are bounded"]
  ),
  "narrative-designer": role(
    "narrative-designer",
    "Narrative Designer",
    "Shape story, tone, world rules, character and content needs, and narrative consistency while respecting production constraints.",
    "minimal",
    ["Narrative brief", "Content list", "Tone guidance"],
    ["Tone is consistent", "Content is shippable", "Narrative constraints are explicit"]
  ),
  "game-feel-designer": role(
    "game-feel-designer",
    "Game Feel Designer",
    "Tune controls, feedback, pacing, animation timing, juice, camera response, and moment-to-moment player feel with actionable changes.",
    "focused",
    ["Feel review", "Tuning recommendations", "Feedback checklist"],
    ["Controls are responsive", "Feedback supports player intent", "Tuning changes are actionable"]
  ),
  "gameplay-programmer": role(
    "gameplay-programmer",
    "Gameplay Programmer",
    "Implement gameplay systems with focused file edits, engine-native idioms, deterministic behavior, and verification evidence.",
    "focused",
    ["Code changes", "Verification results", "Implementation notes"],
    ["Gameplay behavior matches spec", "Tests or manual checks are reported", "Engine idioms are respected"]
  ),
  "engine-programmer": role(
    "engine-programmer",
    "Engine Programmer",
    "Work on engine integration, performance-sensitive systems, build setup, runtime foundations, and platform constraints.",
    "broad",
    ["Technical implementation", "Performance notes", "Build impact"],
    ["Engine constraints are respected", "Build impact is clear", "Performance risks are named"]
  ),
  "tools-programmer": role(
    "tools-programmer",
    "Tools Programmer",
    "Build editor, pipeline, automation, and developer workflow tools that reduce repeated production effort and failure-prone manual steps.",
    "focused",
    ["Tooling changes", "Usage notes", "Failure modes"],
    ["Workflow is ergonomic", "Failure modes are handled", "Automation is scoped"]
  ),
  "senior-game-artist": role(
    "senior-game-artist",
    "Senior Game Artist",
    "Define art direction, asset style, visual constraints, production quality bars, reference needs, and asset review notes.",
    "focused",
    ["Art direction", "Asset list", "Visual quality bar"],
    ["Style constraints are concrete", "Asset needs are prioritized", "Runtime and production limits are considered"]
  ),
  "technical-artist": role(
    "technical-artist",
    "Technical Artist",
    "Bridge art direction and runtime constraints for shaders, materials, import settings, optimization, and visual pipelines.",
    "focused",
    ["Art pipeline guidance", "Asset constraints", "Optimization notes"],
    ["Asset edits are explicit", "Runtime cost is considered", "Pipeline risks are surfaced"]
  ),
  "ui-ux-designer": role(
    "ui-ux-designer",
    "UI UX Designer",
    "Design interface flows, usability heuristics, HUD layout, onboarding, accessibility, menu interactions, and interaction risks.",
    "focused",
    ["UI flow review", "HUD/menu recommendations", "Accessibility notes"],
    ["Flows are understandable", "Accessibility is considered", "Interaction states are specified"]
  ),
  "qa-playtester": role(
    "qa-playtester",
    "QA Playtester",
    "Find reproducible gameplay, usability, accessibility, and regression issues with clear severity, evidence, and verification steps.",
    "focused",
    ["Issue list", "Repro steps", "Severity notes"],
    ["Findings are reproducible", "Severity is calibrated", "Verification steps are clear"]
  ),
  "release-manager": role(
    "release-manager",
    "Release Manager",
    "Assess ship readiness, release risk, packaging, validation status, milestone blockers, and remaining warnings before release decisions.",
    "broad",
    ["Ship checklist", "Release risks", "Validation summary"],
    ["Blockers are separated from warnings", "Validation is current", "Packaging risks are explicit"]
  )
};

export function isStudioRoleId(value: string): value is StudioRoleId {
  return (studioRoleIds as readonly string[]).includes(value);
}

export function unknownStudioRoleMessage(value: string): string {
  return `Unknown studio role "${value}". Use Codex-native hyphenated role IDs such as producer, qa-playtester, or studio-orchestrator.`;
}
