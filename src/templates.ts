import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { packageAssetPath } from "./paths.js";
import { findCustomTemplate, listCustomTemplates, readCustomTemplate, type CustomTemplateDefinition } from "./customization.js";
import type { AgentName } from "./config.js";

export type TemplateId =
  | "gdd"
  | "feature_spec"
  | "handoff"
  | "analytics_setup"
  | "engine_setup"
  | "market_analysis"
  | "project_config"
  | "game_feel_tuning"
  | "art_direction"
  | "ui_ux_review"
  | "production_milestone"
  | "playtest_report"
  | "ship_check"
  | "adr"
  | "technical_design"
  | "architecture_traceability"
  | "art_bible"
  | "sound_bible"
  | "ux_spec"
  | "accessibility_requirements"
  | "test_plan"
  | "test_evidence"
  | "sprint_plan"
  | "vertical_slice_report"
  | "release_notes"
  | "postmortem"
  | "risk_register"
  | "economy_model"
  | "difficulty_curve"
  | "player_journey"
  | "pitch_document";

export type TemplateInfo = {
  id: TemplateId;
  category: string;
  path: string;
  description: string;
  roles: AgentName[];
  workflows: string[];
  tags: string[];
  requiredSections: string[];
};

export type AnyTemplateInfo = Omit<TemplateInfo, "id" | "roles"> & { id: string; roles: string[]; custom?: true };

const markdownSections = ["# Purpose", "# Inputs", "# Outputs", "# Validation"];

export const templateRegistry: Record<TemplateId, TemplateInfo> = {
  gdd: {
    id: "gdd",
    category: "design",
    path: "templates/gdd_template.md",
    description: "Game design document scaffold for the core loop, player goals, systems, content scope, and risks.",
    roles: ["game-designer", "creative-director"],
    workflows: ["design-spec", "brainstorm", "create-epics"],
    tags: ["design", "gdd"],
    requiredSections: markdownSections
  },
  feature_spec: {
    id: "feature_spec",
    category: "design",
    path: "templates/feature_spec_template.md",
    description: "Feature specification scaffold for rules, edge cases, acceptance criteria, and implementation slices.",
    roles: ["senior-game-designer", "game-designer", "gameplay-programmer", "producer"],
    workflows: ["design-spec", "create-stories", "story-readiness"],
    tags: ["feature", "spec", "design"],
    requiredSections: markdownSections
  },
  handoff: {
    id: "handoff",
    category: "coordination",
    path: "templates/handoff_template.md",
    description: "Contributor handoff scaffold for current state, blockers, next owners, and verification evidence.",
    roles: ["studio-orchestrator", "creative-director", "producer"],
    workflows: ["handoff", "sprint-status", "onboard"],
    tags: ["handoff", "coordination"],
    requiredSections: markdownSections
  },
  analytics_setup: {
    id: "analytics_setup",
    category: "analytics",
    path: "templates/analytics_setup_template.md",
    description: "Analytics setup scaffold for events, success metrics, experiments, and evidence loops.",
    roles: ["data-scientist", "producer"],
    workflows: ["analytics-setup"],
    tags: ["analytics", "metrics"],
    requiredSections: markdownSections
  },
  engine_setup: {
    id: "engine_setup",
    category: "engine",
    path: "templates/engine_setup_template.md",
    description: "Engine setup scaffold for project structure, run commands, import rules, and validation checks.",
    roles: ["gameplay-programmer", "engine-programmer", "technical-artist"],
    workflows: ["prototype", "architecture-review"],
    tags: ["engine", "setup"],
    requiredSections: markdownSections
  },
  market_analysis: {
    id: "market_analysis",
    category: "market",
    path: "templates/market_analysis_template.md",
    description: "Market analysis scaffold for audience, competitors, positioning, pricing, and risks.",
    roles: ["market-analyst", "producer"],
    workflows: ["market-analysis", "brainstorm"],
    tags: ["market", "competitors"],
    requiredSections: markdownSections
  },
  project_config: {
    id: "project_config",
    category: "config",
    path: "templates/project_config_template.json",
    description: "Canonical project configuration JSON seed used to initialize Codex Game Studio projects.",
    roles: ["producer", "creative-director"],
    workflows: ["onboard", "prototype"],
    tags: ["config", "setup"],
    requiredSections: []
  },
  game_feel_tuning: {
    id: "game_feel_tuning",
    category: "design",
    path: "templates/game_feel_tuning_template.md",
    description: "Game-feel tuning scaffold for controls, camera, feedback, timing, and feel validation.",
    roles: ["game-feel-designer", "qa-playtester"],
    workflows: ["game-feel-tuning", "prototype"],
    tags: ["feel", "controls", "tuning"],
    requiredSections: markdownSections
  },
  art_direction: {
    id: "art_direction",
    category: "art",
    path: "templates/art_direction_template.md",
    description: "Art direction scaffold for visual goals, constraints, asset lists, and review criteria.",
    roles: ["senior-game-artist", "technical-artist", "creative-director"],
    workflows: ["art-direction", "brainstorm"],
    tags: ["art", "visual", "style"],
    requiredSections: markdownSections
  },
  ui_ux_review: {
    id: "ui_ux_review",
    category: "ui",
    path: "templates/ui_ux_review_template.md",
    description: "UI/UX review scaffold for flows, HUD/menu clarity, usability, onboarding, and interaction risks.",
    roles: ["ui-ux-designer", "qa-playtester"],
    workflows: ["ui-ux-review"],
    tags: ["ui", "ux", "usability"],
    requiredSections: markdownSections
  },
  production_milestone: {
    id: "production_milestone",
    category: "production",
    path: "templates/production_milestone_template.md",
    description: "Production milestone scaffold for goals, owners, risks, task slices, and validation gates.",
    roles: ["producer", "studio-orchestrator"],
    workflows: ["production-milestone", "create-epics"],
    tags: ["milestone", "scope", "schedule"],
    requiredSections: markdownSections
  },
  playtest_report: {
    id: "playtest_report",
    category: "qa",
    path: "templates/playtest_report_template.md",
    description: "Playtest report scaffold for reproducible issues, blockers, warnings, and player-experience notes.",
    roles: ["qa-playtester"],
    workflows: ["playtest", "review"],
    tags: ["playtest", "qa", "report"],
    requiredSections: markdownSections
  },
  ship_check: {
    id: "ship_check",
    category: "release",
    path: "templates/ship_check_template.md",
    description: "Ship-check scaffold for package readiness, blockers, warnings, rollback, and final validation status.",
    roles: ["release-manager", "producer"],
    workflows: ["ship-check", "release-checklist"],
    tags: ["ship", "release", "readiness"],
    requiredSections: markdownSections
  },
  adr: {
    id: "adr",
    category: "architecture",
    path: "templates/adr_template.md",
    description: "Architecture decision record scaffold for context, options, decision, consequences, and verification.",
    roles: ["technical-director", "engine-programmer"],
    workflows: ["architecture-decision", "architecture-review"],
    tags: ["architecture", "decision", "adr"],
    requiredSections: markdownSections
  },
  technical_design: {
    id: "technical_design",
    category: "architecture",
    path: "templates/technical_design_template.md",
    description: "Technical design scaffold for systems, APIs, data flow, engine constraints, risks, and test strategy.",
    roles: ["technical-director", "engine-programmer", "tools-programmer", "producer"],
    workflows: ["architecture-decision", "architecture-review", "prototype"],
    tags: ["technical", "design", "architecture"],
    requiredSections: markdownSections
  },
  architecture_traceability: {
    id: "architecture_traceability",
    category: "architecture",
    path: "templates/architecture_traceability_template.md",
    description: "Traceability scaffold linking design promises, architecture decisions, implementation files, and tests.",
    roles: ["technical-director", "producer", "qa-playtester"],
    workflows: ["architecture-decision", "architecture-review", "story-done"],
    tags: ["architecture", "traceability", "evidence"],
    requiredSections: markdownSections
  },
  art_bible: {
    id: "art_bible",
    category: "art",
    path: "templates/art_bible_template.md",
    description: "Art bible scaffold for style pillars, palette, asset rules, references, and production constraints.",
    roles: ["senior-game-artist", "technical-artist", "creative-director"],
    workflows: ["art-direction", "brainstorm"],
    tags: ["art", "style", "bible"],
    requiredSections: markdownSections
  },
  sound_bible: {
    id: "sound_bible",
    category: "audio",
    path: "templates/sound_bible_template.md",
    description: "Sound bible scaffold for audio pillars, music direction, SFX rules, voice/subtitle needs, and mix risks.",
    roles: ["audio-director", "sound-designer", "creative-director"],
    workflows: ["brainstorm", "prototype"],
    tags: ["audio", "sound", "music"],
    requiredSections: markdownSections
  },
  ux_spec: {
    id: "ux_spec",
    category: "ui",
    path: "templates/ux_spec_template.md",
    description: "UX specification scaffold for player flows, screens, interaction states, affordances, and errors.",
    roles: ["ui-ux-designer", "game-designer", "localization-lead"],
    workflows: ["ui-ux-review", "design-spec"],
    tags: ["ux", "flows", "interface"],
    requiredSections: markdownSections
  },
  accessibility_requirements: {
    id: "accessibility_requirements",
    category: "accessibility",
    path: "templates/accessibility_requirements_template.md",
    description: "Accessibility requirements scaffold for input, visuals, audio, text, difficulty, and verification checks.",
    roles: ["accessibility-specialist", "ui-ux-designer", "qa-playtester", "localization-lead"],
    workflows: ["ui-ux-review", "localization-plan", "qa-plan"],
    tags: ["accessibility", "requirements", "inclusive-design"],
    requiredSections: markdownSections
  },
  test_plan: {
    id: "test_plan",
    category: "qa",
    path: "templates/test_plan_template.md",
    description: "QA test plan scaffold for scenarios, risks, manual checks, automated checks, and exit criteria.",
    roles: ["qa-playtester", "producer", "release-manager"],
    workflows: ["qa-plan", "regression-suite", "release-checklist"],
    tags: ["qa", "test", "plan"],
    requiredSections: markdownSections
  },
  test_evidence: {
    id: "test_evidence",
    category: "qa",
    path: "templates/test_evidence_template.md",
    description: "Test evidence scaffold for executed checks, results, artifacts, failures, and follow-up owners.",
    roles: ["qa-playtester", "release-manager", "performance-analyst", "gameplay-programmer"],
    workflows: ["qa-plan", "regression-suite", "story-done", "ship-check"],
    tags: ["qa", "evidence", "validation"],
    requiredSections: markdownSections
  },
  sprint_plan: {
    id: "sprint_plan",
    category: "production",
    path: "templates/sprint_plan_template.md",
    description: "Sprint plan scaffold for iteration goals, committed stories, owners, risks, and validation gates.",
    roles: ["producer", "studio-orchestrator"],
    workflows: ["sprint-plan", "sprint-status"],
    tags: ["sprint", "planning", "production"],
    requiredSections: markdownSections
  },
  vertical_slice_report: {
    id: "vertical_slice_report",
    category: "production",
    path: "templates/vertical_slice_report_template.md",
    description: "Vertical-slice report scaffold for playable goals, implemented scope, missing pieces, and validation evidence.",
    roles: ["producer", "qa-playtester", "gameplay-programmer"],
    workflows: ["vertical-slice", "prototype", "story-done"],
    tags: ["vertical-slice", "prototype", "report"],
    requiredSections: markdownSections
  },
  release_notes: {
    id: "release_notes",
    category: "release",
    path: "templates/release_notes_template.md",
    description: "Release notes scaffold for highlights, fixes, known issues, compatibility notes, and validation evidence.",
    roles: ["release-manager", "community-manager", "producer", "gameplay-programmer"],
    workflows: ["ship-check", "release-checklist", "hotfix"],
    tags: ["release", "notes", "community"],
    requiredSections: markdownSections
  },
  postmortem: {
    id: "postmortem",
    category: "production",
    path: "templates/postmortem_template.md",
    description: "Postmortem scaffold for outcomes, what worked, what failed, learnings, and follow-up improvements.",
    roles: ["producer", "studio-orchestrator", "qa-playtester"],
    workflows: ["sprint-status", "story-done", "release-checklist"],
    tags: ["postmortem", "retrospective", "learning"],
    requiredSections: markdownSections
  },
  risk_register: {
    id: "risk_register",
    category: "production",
    path: "templates/risk_register_template.md",
    description: "Risk register scaffold for risks, impact, probability, mitigation, owner, trigger, and status.",
    roles: ["producer", "technical-director", "release-manager", "gameplay-programmer"],
    workflows: ["production-milestone", "sprint-plan", "ship-check", "release-checklist", "hotfix"],
    tags: ["risk", "mitigation", "production"],
    requiredSections: markdownSections
  },
  economy_model: {
    id: "economy_model",
    category: "design",
    path: "templates/economy_model_template.md",
    description: "Economy model scaffold for resources, sinks, sources, prices, progression, and balancing risks.",
    roles: ["economy-designer", "systems-designer", "data-scientist", "senior-game-designer"],
    workflows: ["design-spec", "brainstorm"],
    tags: ["economy", "balance", "systems"],
    requiredSections: markdownSections
  },
  difficulty_curve: {
    id: "difficulty_curve",
    category: "design",
    path: "templates/difficulty_curve_template.md",
    description: "Difficulty curve scaffold for progression beats, challenge ramps, fail states, assists, and telemetry signals.",
    roles: ["systems-designer", "game-feel-designer", "qa-playtester", "senior-game-designer"],
    workflows: ["game-feel-tuning", "design-spec", "qa-plan"],
    tags: ["difficulty", "progression", "balance"],
    requiredSections: markdownSections
  },
  player_journey: {
    id: "player_journey",
    category: "design",
    path: "templates/player_journey_template.md",
    description: "Player journey scaffold for onboarding, emotional beats, friction points, goals, and retention risks.",
    roles: ["creative-director", "ui-ux-designer", "game-designer", "senior-game-designer"],
    workflows: ["brainstorm", "ui-ux-review", "design-spec"],
    tags: ["journey", "onboarding", "player-experience"],
    requiredSections: markdownSections
  },
  pitch_document: {
    id: "pitch_document",
    category: "market",
    path: "templates/pitch_document_template.md",
    description: "Pitch document scaffold for fantasy, differentiators, audience, visual/audio hook, and production promise.",
    roles: ["creative-director", "market-analyst", "producer", "studio-orchestrator"],
    workflows: ["brainstorm", "market-analysis", "onboard"],
    tags: ["pitch", "market", "concept"],
    requiredSections: markdownSections
  }
};

export function listTemplates(projectRoot?: string): AnyTemplateInfo[] {
  return projectRoot ? [...Object.values(templateRegistry), ...listCustomTemplates(projectRoot)] : Object.values(templateRegistry);
}

export function readTemplate(id: string, options: { projectRoot?: string } = {}): string {
  const builtIn = templateRegistry[id as TemplateId];
  if (builtIn) return readFileSync(packageAssetPath(builtIn.path), "utf8");
  if (options.projectRoot && findCustomTemplate(options.projectRoot, id)) return readCustomTemplate(options.projectRoot, id);
  throw new Error(`Unknown template "${id}"`);
}

export function formatTemplateShow(id: string, options: { projectRoot?: string } = {}): string {
  const info = (templateRegistry[id as TemplateId] as AnyTemplateInfo | undefined) ?? (options.projectRoot ? findCustomTemplate(options.projectRoot, id) : undefined);
  if (!info) throw new Error(`Unknown template "${id}"`);
  return [
    `ID: ${info.id}`,
    `Category: ${info.category}`,
    `Path: ${info.path}`,
    `Description: ${info.description}`,
    `Roles: ${info.roles.join(", ")}`,
    `Workflows: ${info.workflows.join(", ")}`,
    `Tags: ${info.tags.join(", ")}`,
    "",
    readTemplate(id, options)
  ].join("\n");
}

export function templatePath(id: TemplateId): string {
  return packageAssetPath(templateRegistry[id].path);
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  const content = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return content.trim().length > 0;
}

export function validateTemplateFiles(): string[] {
  const failures: string[] = [];
  for (const info of listTemplates()) {
    const fullPath = path.resolve(packageAssetPath(info.path));
    if (!existsSync(fullPath)) {
      failures.push(`Missing template ${info.id}: ${info.path}`);
      continue;
    }
    if (!info.description.trim()) failures.push(`Template ${info.id} missing description`);
    if (info.roles.length === 0) failures.push(`Template ${info.id} missing role hints`);
    if (info.workflows.length === 0) failures.push(`Template ${info.id} missing workflow hints`);
    const body = readFileSync(fullPath, "utf8");
    for (const section of info.requiredSections) {
      if (!sectionHasContent(body, section)) failures.push(`Template ${info.id} missing non-empty ${section}`);
    }
    if (info.id === "project_config") JSON.parse(body);
  }
  return failures;
}

export function renderSelectedTemplates(templateIds: string[], heading = "## Selected Templates", options: { projectRoot?: string } = {}): string {
  if (templateIds.length === 0) return "";
  return [
    "",
    heading,
    "",
    ...templateIds.flatMap((id) => {
      const builtIn = templateRegistry[id as TemplateId];
      const custom = !builtIn && options.projectRoot ? findCustomTemplate(options.projectRoot, id) : undefined;
      const info = builtIn ?? custom;
      if (!info) throw new Error(`Unknown template "${id}"`);
      const sourcePrefix = custom ? "project" : "package";
      return [`### Template: ${id}`, `Source: ${sourcePrefix}:${info.path}`, "", readTemplate(id, options).trim(), ""];
    })
  ].join("\n");
}

export function selectTemplates(agent: AgentName, task: string): TemplateId[] {
  const lower = task.toLowerCase();
  const selected = new Set<TemplateId>();
  if (agent === "market-analyst") selected.add("market_analysis");
  if (agent === "data-scientist") selected.add("analytics_setup");
  if (agent === "game-feel-designer") selected.add("game_feel_tuning");
  if (agent === "ui-ux-designer") selected.add("ui_ux_review");
  if (agent === "qa-playtester") selected.add("playtest_report");
  if (agent === "release-manager") selected.add("ship_check");
  if (/(handoff|coordination|coordinate)/.test(lower)) selected.add("handoff");
  if ((agent === "producer" || agent === "market-analyst") && /(market|competitor|audience)/.test(lower)) selected.add("market_analysis");
  if ((agent === "producer" || agent === "data-scientist") && /(analytics|metric|telemetry)/.test(lower)) selected.add("analytics_setup");
  if ((agent === "senior-game-designer" || agent === "game-designer" || agent === "gameplay-programmer") && /(design|spec|gdd|feature)/.test(lower)) {
    selected.add("gdd");
    selected.add("feature_spec");
  }
  if (/(engine|setup|project config|initialize|init)/.test(lower)) {
    selected.add("engine_setup");
    selected.add("project_config");
  }
  if (agent === "qa-playtester" && /(spec review|review spec)/.test(lower)) selected.add("feature_spec");
  if (agent === "qa-playtester" && /(ui|ux|hud|menu|onboarding|accessibility|usability)/.test(lower)) selected.add("ui_ux_review");
  if (agent === "qa-playtester" && /(feel|control|movement|timing|camera|pacing)/.test(lower)) selected.add("game_feel_tuning");
  if ((agent === "senior-game-artist" || agent === "technical-artist" || agent === "creative-director") && /(art|visual|style|asset|direction)/.test(lower)) {
    selected.add("art_direction");
    selected.add("art_bible");
  }
  if ((agent === "producer" || agent === "studio-orchestrator") && /(milestone|scope|schedule|production)/.test(lower)) selected.add("production_milestone");
  if ((agent === "producer" || agent === "studio-orchestrator") && /sprint/.test(lower)) selected.add("sprint_plan");
  if ((agent === "producer" || agent === "release-manager" || agent === "community-manager") && /(release|ship|readiness|package|launch|notes)/.test(lower)) selected.add("release_notes");
  if ((agent === "producer" || agent === "release-manager") && /(release|ship|readiness|package|launch)/.test(lower)) selected.add("ship_check");
  if ((agent === "producer" || agent === "technical-director" || agent === "release-manager") && /(risk|mitigation|rollback|blocker)/.test(lower)) selected.add("risk_register");
  if ((agent === "technical-director" || agent === "engine-programmer") && /(adr|architecture decision|decision record)/.test(lower)) selected.add("adr");
  if ((agent === "technical-director" || agent === "engine-programmer" || agent === "tools-programmer") && /(technical design|system design|architecture)/.test(lower)) selected.add("technical_design");
  if ((agent === "technical-director" || agent === "producer" || agent === "qa-playtester") && /(traceability|architecture|decision)/.test(lower)) selected.add("architecture_traceability");
  if ((agent === "audio-director" || agent === "sound-designer" || agent === "creative-director") && /(sound|audio|music|sfx)/.test(lower)) selected.add("sound_bible");
  if ((agent === "ui-ux-designer" || agent === "game-designer") && /(ux|flow|screen|interface|journey)/.test(lower)) selected.add("ux_spec");
  if ((agent === "accessibility-specialist" || agent === "ui-ux-designer" || agent === "qa-playtester" || agent === "localization-lead") && /(accessibility|accessible|subtitle|remap|colorblind)/.test(lower)) selected.add("accessibility_requirements");
  if ((agent === "qa-playtester" || agent === "producer") && /(test plan|qa plan|scenario|exit criteria)/.test(lower)) selected.add("test_plan");
  if ((agent === "qa-playtester" || agent === "release-manager") && /(test evidence|evidence|results|regression)/.test(lower)) selected.add("test_evidence");
  if ((agent === "producer" || agent === "qa-playtester" || agent === "gameplay-programmer") && /(vertical slice|prototype report|playable slice)/.test(lower)) selected.add("vertical_slice_report");
  if ((agent === "producer" || agent === "studio-orchestrator" || agent === "qa-playtester") && /(postmortem|retro|retrospective)/.test(lower)) selected.add("postmortem");
  if ((agent === "economy-designer" || agent === "systems-designer" || agent === "data-scientist") && /(economy|resource|currency|sink|source|price)/.test(lower)) selected.add("economy_model");
  if ((agent === "systems-designer" || agent === "game-feel-designer" || agent === "qa-playtester") && /(difficulty|curve|progression|challenge)/.test(lower)) selected.add("difficulty_curve");
  if ((agent === "creative-director" || agent === "ui-ux-designer" || agent === "game-designer") && /(player journey|onboarding|emotional beat|friction)/.test(lower)) selected.add("player_journey");
  if ((agent === "creative-director" || agent === "market-analyst" || agent === "producer") && /(pitch|differentiator|hook|fantasy)/.test(lower)) selected.add("pitch_document");
  return [...selected];
}
