import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ProjectConfig } from "./config.js";
import { renderGeneratedSurfaceMetadata } from "./generated-surfaces.js";
import { workflowRegistry, type WorkflowId } from "./workflows.js";

export type GeneratedSkillDefinition = {
  name: string;
  description: string;
  sourceId: string;
  body: string;
  sourceInput: unknown;
  requiredMarkers: string[];
};

type SkillGroup = "onboarding" | "design" | "architecture" | "production" | "build-validation" | "release-ops" | "team" | "standards";

type SkillProfile = {
  id: string;
  group: SkillGroup;
  title: string;
  description: string;
  objective: string;
  context: string[];
  phases: string[];
  writeTargets: string[];
  report: string[];
  markers: string[];
  workflowId?: WorkflowId;
};

const workflowSkillIds = new Set<WorkflowId>([
  "architecture-decision",
  "architecture-review",
  "brainstorm",
  "bugfix",
  "create-epics",
  "create-stories",
  "hotfix",
  "perf-profile",
  "prototype",
  "qa-plan",
  "regression-suite",
  "release-checklist",
  "security-audit",
  "sprint-plan",
  "sprint-status",
  "story-done",
  "story-readiness",
  "ui-ux-review",
  "vertical-slice"
]);

const skillProfiles: SkillProfile[] = [
  profile("start", "onboarding", "Start", "Clarify the game concept, engine, production mode, first milestone, and next required artifact.", ["Project Stage", "Engine Choice", "First Milestone", "Validation Gate"]),
  profile("onboard", "onboarding", "Onboard", "Orient a new contributor or agent to project state, file layout, stage, risks, and next work.", ["Project Map", "Current Stage", "Open Risks", "Next Owner"]),
  profile("adopt", "onboarding", "Adopt Existing Project", "Inventory existing source, assets, docs, and tests before mapping work into CGS structure.", ["Inventory", "Migration Map", "Do Not Move First", "Adoption Risks"]),
  profile("setup-engine", "onboarding", "Setup Engine", "Pin engine version, verify project markers, document conventions, and run engine smoke checks.", ["Engine Version", "Project Markers", "Naming Conventions", "Smoke Check"]),
  profile("help", "onboarding", "Help", "Summarize available CGS workflows, next phase options, required artifacts, and safe commands.", ["Available Workflows", "Next Step", "Required Artifact", "Command Help"]),
  profile("project-stage-detect", "onboarding", "Project Stage Detect", "Detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release.", ["Stage Evidence", "Missing Required Artifact", "Recommended Phase", "Confidence"]),

  profile("brainstorm", "design", "Brainstorm", "Explore the game idea with player fantasy, verbs, pillars, audience, constraints, and scope tiers.", ["Core Fantasy", "Player Verbs", "Pillars", "Scope Tiers"]),
  profile("quick-design", "design", "Quick Design", "Draft a constrained design slice fast while preserving pillars, assumptions, and open questions.", ["Design Hypothesis", "Constraints", "Acceptance Criteria", "Open Questions"]),
  profile("map-systems", "design", "Map Systems", "Decompose the concept into game systems with dependency order, priority tiers, and validation needs.", ["Systems Map", "Dependency Order", "Priority Tier", "Validation Need"]),
  profile("design-system", "design", "Design System", "Author a system GDD with rules, data, edge cases, progression, feedback, and implementation acceptance tests.", ["System Rules", "Balance Levers", "Edge Cases", "Acceptance Tests"]),
  profile("design-review", "design", "Design Review", "Review design artifacts against pillars, player experience, production scope, and downstream implementation risk.", ["Pillar Fit", "Scope Risk", "Contradictions", "Review Verdict"]),
  profile("review-all-gdds", "design", "Review All GDDs", "Cross-check all GDDs for consistency, missing systems, dependency conflicts, and production readiness.", ["GDD Coverage", "Contradictions", "Missing Systems", "Readiness Verdict"]),
  profile("art-bible", "design", "Art Bible", "Define visual identity, shape language, palette, camera, animation, UI style, and asset constraints.", ["Visual Identity", "Shape Language", "Palette", "Asset Constraints"]),
  profile("asset-spec", "design", "Asset Spec", "Specify an individual asset with purpose, constraints, references, dimensions, states, and acceptance criteria.", ["Asset Purpose", "States", "Technical Constraints", "Acceptance Criteria"]),
  profile("asset-audit", "design", "Asset Audit", "Audit game assets for completeness, naming, import settings, ownership, licensing, and production risk.", ["Asset Inventory", "Import Risk", "Missing Asset", "Licensing Note"]),
  profile("ux-design", "design", "UX Design", "Design user journeys, menus, HUD, onboarding, input states, accessibility, and localization-ready UX copy.", ["Player Journey", "HUD State", "Input Path", "Accessibility"]),
  profile("ux-review", "design", "UX Review", "Review UX flows for clarity, friction, accessibility, localization, controller support, and player comprehension.", ["Friction", "Comprehension", "Accessibility", "UX Verdict"]),
  profile("ui-ux-review", "design", "UI UX Review", "Review UI and UX implementation for clarity, accessibility, localization, controller support, and player comprehension.", ["Friction", "Comprehension", "Accessibility", "UX Verdict"]),
  profile("balance-check", "design", "Balance Check", "Evaluate tuning values, progression pacing, economy levers, exploits, and player-skill assumptions.", ["Balance Lever", "Exploit Risk", "Pacing", "Telemetry Need"]),
  profile("consistency-check", "design", "Consistency Check", "Find contradictions across design, narrative, systems, UI, content, and implementation artifacts.", ["Contradiction", "Canonical Source", "Affected Files", "Resolution"]),
  profile("content-audit", "design", "Content Audit", "Audit content coverage, duplication, tone consistency, localization needs, and production completeness.", ["Content Inventory", "Tone Drift", "Localization Need", "Gap List"]),
  profile("propagate-design-change", "design", "Propagate Design Change", "Trace a design change through systems, docs, tasks, tests, content, and release risk.", ["Change Summary", "Affected Systems", "Required Updates", "Regression Risk"]),
  profile("reverse-document", "design", "Reverse Document", "Create design or technical documentation from existing implementation without inventing unverified behavior.", ["Observed Behavior", "Evidence Path", "Unknowns", "Documentation Draft"]),

  profile("create-architecture", "architecture", "Create Architecture", "Design the technical architecture, layers, data ownership, engine boundaries, and control manifest.", ["Architecture Layers", "Data Ownership", "Engine Boundary", "Control Manifest"]),
  profile("create-control-manifest", "architecture", "Create Control Manifest", "Define implementation rules, boundaries, allowed dependencies, validation commands, and review gates.", ["Layer Rules", "Allowed Dependency", "Validation Command", "Review Gate"]),
  profile("architecture-decision", "architecture", "Architecture Decision", "Write an ADR with context, options, decision, consequences, validation, and rollback.", ["Context", "Options", "Decision", "Consequences"]),
  profile("architecture-review", "architecture", "Architecture Review", "Review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness.", ["Layer Violation", "Scalability Risk", "Testing Seam", "Architecture Verdict"]),
  profile("code-review", "architecture", "Code Review", "Review changes for correctness, maintainability, security, tests, engine idioms, and scope control.", ["Correctness", "Maintainability", "Security", "Review Verdict"]),
  profile("dev-story", "production", "Development Story", "Turn a design or bug into an implementation-ready story with owner, files, acceptance tests, and dependencies.", ["Story Goal", "Owner", "Dependencies", "Acceptance Tests"]),
  profile("create-epics", "production", "Create Epics", "Break project goals into epics with outcomes, dependencies, risks, and validation gates.", ["Epic Outcome", "Dependencies", "Risk", "Gate"]),
  profile("create-stories", "production", "Create Stories", "Break an epic into small stories with acceptance criteria, owner role, files, and verification.", ["Story", "Acceptance Criteria", "Owner Role", "Verification"]),
  profile("estimate", "production", "Estimate", "Estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges.", ["Estimate Range", "Confidence", "Dependency", "Buffer"]),
  profile("sprint-plan", "production", "Sprint Plan", "Create a 1-2 week sprint plan with goals, tasks, owners, dependencies, risks, and acceptance criteria.", ["Sprint Goals", "Task Table", "Owner", "Risk Register"]),
  profile("sprint-status", "production", "Sprint Status", "Report sprint progress, blockers, risk changes, completed work, and next decisions.", ["Progress", "Blocker", "Risk Change", "Next Decision"]),
  profile("scope-check", "production", "Scope Check", "Assess whether requested work fits the milestone and propose cuts, deferrals, or safer slices.", ["Scope Fit", "Cut Option", "Deferral", "Recommendation"]),
  profile("milestone-review", "production", "Milestone Review", "Review milestone readiness, completed evidence, blockers, carryover, and phase transition risk.", ["Milestone Goal", "Evidence", "Blocker", "Transition Verdict"]),
  profile("story-readiness", "production", "Story Readiness", "Check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation.", ["Ready", "Missing Input", "Dependency", "Acceptance Criteria"]),
  profile("story-done", "production", "Story Done", "Check if a story is complete with changed files, tests, acceptance evidence, and handoff notes.", ["Done Verdict", "Changed Files", "Evidence", "Follow-up"]),
  profile("gate-check", "production", "Gate Check", "Run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision.", ["Gate Criteria", "Evidence", "Concerns", "Verdict"]),

  profile("prototype", "build-validation", "Prototype", "Build or plan a throwaway concept prototype around a falsifiable design hypothesis and cleanup boundary.", ["Prototype Hypothesis", "Throwaway Boundary", "Success Signal", "Cleanup"]),
  profile("bugfix", "build-validation", "Bugfix", "Fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes.", ["Reproduction", "Minimal Fix", "Regression Test", "Evidence"]),
  profile("vertical-slice", "build-validation", "Vertical Slice", "Validate whether a full game loop can be built at representative quality before production commitment.", ["Validation Question", "Scope Discipline", "Recovery Checkpoint", "Playtest Debrief", "PROCEED / PIVOT / KILL"]),
  profile("bug-report", "build-validation", "Bug Report", "Capture a reproducible bug with environment, steps, expected/actual behavior, severity, evidence, and owner.", ["Reproduction Steps", "Expected vs Actual", "Evidence", "Severity"]),
  profile("bug-triage", "build-validation", "Bug Triage", "Classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact.", ["Severity", "Priority", "Owner", "Release Impact"]),
  profile("qa-plan", "build-validation", "QA Plan", "Plan focused QA coverage across features, risks, platforms, devices, regressions, and acceptance criteria.", ["Test Matrix", "Risk Coverage", "Acceptance Criteria", "Evidence"]),
  profile("playtest-report", "build-validation", "Playtest Report", "Capture player observations, comprehension, friction, loop completion, bugs, quotes, and design implications.", ["Loop Completion", "Friction", "Observation", "Design Implication"]),
  profile("regression-suite", "build-validation", "Regression Suite", "Define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers.", ["Critical Path", "Prior Bug", "Regression Case", "Result"]),
  profile("smoke-check", "build-validation", "Smoke Check", "Run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state.", ["Launch", "Build", "Basic Play", "Smoke Result"]),
  profile("soak-test", "build-validation", "Soak Test", "Plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops.", ["Duration", "Metric", "Failure Threshold", "Soak Result"]),
  profile("test-setup", "build-validation", "Test Setup", "Configure test harnesses, fixtures, commands, and documentation so validation is repeatable.", ["Test Command", "Fixture", "Harness", "Repeatability"]),
  profile("test-helpers", "build-validation", "Test Helpers", "Design reusable test helpers without hiding assertions, over-mocking, or coupling tests to implementation details.", ["Helper Purpose", "Assertion Boundary", "Fixture Shape", "Misuse Guard"]),
  profile("test-flakiness", "build-validation", "Test Flakiness", "Diagnose flaky tests by isolating timing, randomness, ordering, environment, and cleanup causes.", ["Failure Pattern", "Isolation", "Root Cause", "Stabilization"]),
  profile("test-evidence-review", "build-validation", "Test Evidence Review", "Review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps.", ["Evidence", "Gap", "Confidence", "Follow-up"]),
  profile("skill-test", "build-validation", "Skill Test", "Test a repository skill against fixtures, required sections, dry-runs, and behavioral expectations.", ["Skill Fixture", "Required Marker", "Dry Run", "Verdict"]),
  profile("skill-improve", "build-validation", "Skill Improve", "Improve a skill after observed failures while preserving trigger, procedure, validation, and handoff clarity.", ["Observed Failure", "Procedure Fix", "Regression Test", "Skill Handoff"]),

  profile("release-checklist", "release-ops", "Release Checklist", "Check build, packaging, store, QA, localization, accessibility, rollback, and ship/no-ship readiness.", ["Build Evidence", "Blocking Issues", "Rollback", "Ship Verdict"]),
  profile("launch-checklist", "release-ops", "Launch Checklist", "Coordinate day-of-launch readiness, monitoring, community, support, rollback, and hotfix paths.", ["Launch Readiness", "Monitoring", "Support", "Rollback"]),
  profile("hotfix", "release-ops", "Hotfix", "Scope and execute an urgent fix with reproduction, minimal change, verification, release notes, and rollback.", ["Incident", "Minimal Fix", "Verification", "Rollback"]),
  profile("day-one-patch", "release-ops", "Day One Patch", "Plan launch-window fixes, risk acceptance, validation, platform submission, and player communication.", ["Patch Scope", "Risk", "Submission", "Player Communication"]),
  profile("patch-notes", "release-ops", "Patch Notes", "Write player-facing patch notes with fixes, known issues, balance changes, and verification caveats.", ["Player Summary", "Fix List", "Known Issues", "Version"]),
  profile("changelog", "release-ops", "Changelog", "Maintain a developer-facing changelog grouped by feature, fix, content, performance, and breaking change.", ["Added", "Changed", "Fixed", "Breaking"]),
  profile("localize", "release-ops", "Localize", "Plan localization keys, context, screenshots, pluralization, text expansion, and review workflow.", ["String Context", "Text Expansion", "Locale Risk", "Review"]),
  profile("security-audit", "release-ops", "Security Audit", "Audit secrets, network surfaces, auth, saves, platform APIs, dependencies, and exploit risks.", ["Secret", "Attack Surface", "Exploit Risk", "Mitigation"]),
  profile("perf-profile", "release-ops", "Performance Profile", "Profile frame time, memory, loading, assets, rendering, scripting, and platform constraints.", ["Metric", "Budget", "Bottleneck", "Optimization"]),
  profile("tech-debt", "release-ops", "Tech Debt", "Identify technical debt, production risk, payoff, safe refactor slices, and validation needed.", ["Debt Item", "Risk", "Payoff", "Refactor Slice"]),
  profile("retrospective", "release-ops", "Retrospective", "Facilitate a retrospective with what worked, what failed, root causes, actions, and owner follow-up.", ["Went Well", "Did Not Work", "Root Cause", "Action Item"]),

  profile("team-audio", "team", "Team Audio", "Coordinate audio design, implementation, asset readiness, mix targets, and QA for audio work.", ["Audio Goal", "Asset Need", "Mix Target", "QA Note"]),
  profile("team-combat", "team", "Team Combat", "Coordinate combat design, implementation, tuning, animation, VFX, audio, and QA handoffs.", ["Combat Goal", "Tuning", "Feedback", "QA Scenario"]),
  profile("team-level", "team", "Team Level", "Coordinate level design, blockout, art, scripting, lighting, optimization, and playtest handoffs.", ["Level Goal", "Blockout", "Art Pass", "Playtest"]),
  profile("team-live-ops", "team", "Team Live Ops", "Coordinate events, telemetry, economy, content cadence, support, and incident readiness.", ["Live Event", "Telemetry", "Support", "Incident Plan"]),
  profile("team-narrative", "team", "Team Narrative", "Coordinate narrative content, dialogue, localization, implementation hooks, and consistency review.", ["Narrative Goal", "Content", "Localization", "Consistency"]),
  profile("team-polish", "team", "Team Polish", "Coordinate final polish across game feel, UI, audio, art, bugs, performance, and accessibility.", ["Polish Target", "Player Impact", "Risk", "Verification"]),
  profile("team-qa", "team", "Team QA", "Coordinate QA coverage, bug triage, regression, platform checks, and release evidence.", ["QA Scope", "Regression", "Bug Queue", "Evidence"]),
  profile("team-release", "team", "Team Release", "Coordinate release management, build pipeline, store assets, QA signoff, comms, and rollback.", ["Release Scope", "Build", "Store", "Rollback"]),
  profile("team-ui", "team", "Team UI", "Coordinate UI design, implementation, accessibility, localization, controller support, and UX QA.", ["UI Flow", "Accessibility", "Localization", "Controller Support"]),

  standards("gameplay", "Gameplay Standards", "mechanics, tuning, data-driven values, engine idioms, and player-facing acceptance checks", ["Data Driven Values", "Engine Boundary", "Playable Check"]),
  standards("tests", "Test Standards", "unit, integration, engine smoke, playtest, and regression coverage", ["Narrow Test", "Suite", "Evidence"]),
  standards("prototype", "Prototype Standards", "fast experiments with explicit hypotheses, throwaway boundaries, and graduation criteria", ["Hypothesis", "Throwaway Boundary", "Graduation"]),
  standards("ui", "UI Standards", "HUD, menus, accessibility, localization, controller navigation, and input states", ["Navigation", "Localization", "Accessibility"])
];

function profile(id: string, group: SkillGroup, title: string, objective: string, markers: string[]): SkillProfile {
  const workflowId = workflowSkillIds.has(id as WorkflowId) ? (id as WorkflowId) : undefined;
  return {
    id,
    group,
    title,
    description: `Use for Codex Game Studio ${title.toLowerCase()} work: ${objective}`,
    objective,
    context: contextFor(group, id, workflowId),
    phases: phasesFor(group, id, objective, markers),
    writeTargets: writeTargetsFor(group, id),
    report: reportFor(group, markers),
    markers,
    workflowId
  };
}

function standards(id: string, title: string, objective: string, markers: string[]): SkillProfile {
  return {
    id: `standards-${id}`,
    group: "standards",
    title,
    description: `Use for Codex Game Studio ${title.toLowerCase()}: ${objective}.`,
    objective,
    context: ["AGENTS.md", ".codex/studio.json", "task-relevant source, tests, docs, or assets"],
    phases: [
      `Read the requested files and identify the ${title.toLowerCase()} rule being applied.`,
      `Check ${objective}.`,
      "Report violations with file paths, impact, and the smallest safe fix."
    ],
    writeTargets: [],
    report: ["Rule applied", "Files checked", "Violations", "Verification"],
    markers
  };
}

function contextFor(group: SkillGroup, id: string, workflowId?: WorkflowId): string[] {
  const common = ["AGENTS.md", ".codex/studio.json", "task-relevant files named by the user or task record"];
  const byGroup: Record<SkillGroup, string[]> = {
    onboarding: ["docs/architecture/README.md", "production/timeline.md"],
    design: ["design/gdd.md", "docs/market-overview.md"],
    architecture: ["docs/architecture/README.md", "design/gdd.md"],
    production: ["production/timeline.md", "production/session-state/active.md"],
    "build-validation": ["design/gdd.md", "production/session-state/active.md", "tests/"],
    "release-ops": ["production/timeline.md", "docs/market-overview.md", "tests/"],
    team: ["design/gdd.md", "production/timeline.md", "task-relevant team files"],
    standards: []
  };
  return [...common, ...byGroup[group], ...(workflowId && workflowRegistry[workflowId] ? [workflowRegistry[workflowId].file] : []), ...(id === "vertical-slice" ? ["docs/architecture/README.md"] : [])];
}

function phasesFor(group: SkillGroup, id: string, objective: string, markers: string[]): string[] {
  if (id === "vertical-slice") {
    return [
      "Resolve review mode and load concept, systems, architecture, UX, production timeline, and active risks.",
      "Frame the Validation Question: can a player experience the core fantasy in a representative complete loop, and can the team build that loop at production quality on schedule?",
      "Apply Scope Discipline: target 3-5 minutes of continuous polished gameplay; cut content before cutting quality; include all systems required for one start-to-challenge-to-resolution loop.",
      "Plan implementation with explicit systems, quality bar, success criteria, owner roles, and a hard time limit.",
      "Set a Recovery Checkpoint in production/session-state/active.md so multi-session slice work can resume without guessing.",
      "Run a Playtest Debrief that captures loop completion, first meaningful action timing, core fantasy, blockers, confusion, and build feasibility.",
      "Write the verdict as PROCEED / PIVOT / KILL with evidence, risks, and next action."
    ];
  }
  if (id === "bug-report") {
    return ["Capture environment, build/version, branch, and affected feature.", "Write Reproduction Steps that a different agent can follow without extra context.", "Record Expected vs Actual behavior and player impact.", "Attach Evidence such as logs, screenshots, recordings, failing tests, or engine output.", "Assign severity, likely owner role, regression risk, and verification path."];
  }
  const opening = `Clarify the requested ${objective.toLowerCase()} and identify the current project stage.`;
  const evidence = `Collect evidence for ${markers.slice(0, 3).join(", ")}.`;
  const action = group === "design" ? "Draft or review the artifact in small sections, keeping player experience and scope visible." : group === "architecture" ? "Compare options, choose the smallest reversible technical path, and record consequences." : group === "production" ? "Break the work into owner-sized tasks with dependencies, risks, and acceptance checks." : group === "build-validation" ? "Run or define the focused validation loop before reporting conclusions." : group === "release-ops" ? "Separate blockers from warnings and include rollback or deferral options." : group === "team" ? "Coordinate handoffs between disciplines and name each owner, artifact, and validation need." : "Apply the standard and report concrete violations.";
  return [opening, evidence, action, "Produce the requested artifact or review with clear file paths and verification evidence."];
}

function writeTargetsFor(group: SkillGroup, id: string): string[] {
  const targets: Record<SkillGroup, string[]> = {
    onboarding: ["AGENTS.md", ".codex/studio.json", "production/timeline.md"],
    design: ["design/"],
    architecture: ["docs/architecture/"],
    production: ["production/"],
    "build-validation": ["tests/", "production/session-state/", "prototypes/"],
    "release-ops": ["production/", "docs/"],
    team: ["production/", "design/"],
    standards: []
  };
  return [...targets[group], ...(id === "vertical-slice" ? ["prototypes/<concept>-vertical-slice/", "production/session-state/active.md"] : [])];
}

function reportFor(group: SkillGroup, markers: string[]): string[] {
  return ["Summary", ...markers, group === "release-ops" ? "Blocking issues" : "Risks", "Changed files or proposed files", "Verification evidence", "Next owner or decision"];
}

function skillBody(profile: SkillProfile, config: ProjectConfig): string {
  return [
    `# Codex Game Studio ${profile.title}`,
    "",
    `Use this skill for ${profile.title.toLowerCase()} work in ${config.project.name}.`,
    "",
    "## Objective",
    "",
    profile.objective,
    "",
    "## Inputs",
    "",
    ...profile.context.map((input) => `- ${input}`),
    "",
    "## Procedure",
    "",
    ...profile.phases.map((step, index) => `${index + 1}. ${step}`),
    "",
    profile.writeTargets.length ? "## Write Targets" : undefined,
    profile.writeTargets.length ? "" : undefined,
    ...profile.writeTargets.map((target) => `- ${target}`),
    profile.writeTargets.length ? "" : undefined,
    "## Output Contract",
    "",
    ...profile.report.map((item) => `- ${item}`),
    "",
    "## Quality Gates",
    "",
    ...profile.markers.map((marker) => `- ${marker}`),
    "- Scope remains bounded to the current task and project stage.",
    "- Report labels unverified assumptions separately from evidence.",
    "",
    "## Handoff",
    "",
    "Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.",
    ""
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

function renderSkill(definition: GeneratedSkillDefinition): string {
  const body = ["---", `name: ${definition.name}`, `description: ${definition.description}`, "---", "", definition.body.trimEnd(), ""].join("\n");
  return `${renderGeneratedSurfaceMetadata({ surface: "skill", id: definition.name, sourceInput: definition.sourceInput, body })}${body}`;
}

export function generatedSkillDefinitions(config: ProjectConfig): GeneratedSkillDefinition[] {
  return skillProfiles.map((profile) => ({
    name: `cgs-${profile.id}`,
    sourceId: profile.id,
    description: profile.description,
    body: skillBody(profile, config),
    sourceInput: { type: "ccgs-parity-skill", profile, projectMode: config.project.mode, engine: config.project.engine },
    requiredMarkers: profile.markers
  }));
}

export function generatedSkillRequiredMarkers(): Record<string, string[]> {
  return Object.fromEntries(skillProfiles.map((profile) => [`cgs-${profile.id}`, profile.markers]));
}

export function renderGeneratedSkill(definition: GeneratedSkillDefinition): string {
  return renderSkill(definition);
}

export function materializeSkills(projectRoot: string, config: ProjectConfig): string[] {
  const written: string[] = [];
  for (const definition of generatedSkillDefinitions(config)) {
    const dir = path.join(projectRoot, ".agents", "skills", definition.name);
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "SKILL.md");
    writeFileSync(file, renderGeneratedSkill(definition));
    written.push(file);
  }
  return written;
}
