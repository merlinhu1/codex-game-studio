import { studioRoleIds, type StudioRoleId } from "./roles.js";
import { workflowIds, type WorkflowId } from "./workflows.js";

export type CcgsAdaptationDecision = "built-in-existing" | "built-in-add-candidate" | "specialty-context" | "custom-pack-example" | "workflow" | "recipe" | "template" | "defer" | "out-of-scope";

export type CcgsRoleAdaptation = {
  sourceId: string;
  target: string;
  decision: CcgsAdaptationDecision;
  notes: string;
};

export type CcgsSkillAdaptation = {
  sourceId: string;
  target: string;
  decision: CcgsAdaptationDecision;
  notes: string;
};

export const ccgsInventory = {
  source: "https://github.com/Donchitos/Claude-Code-Game-Studios",
  reviewedAt: "2026-06-25",
  roleCountAtReview: 49,
  skillCountAtReview: 73,
  policy: "Curated reference only; not parity-by-copying and not a Claude runtime compatibility target."
} as const;

export const ccgsRoleAdaptations: CcgsRoleAdaptation[] = [
  { sourceId: "producer", target: "producer", decision: "built-in-existing", notes: "Production planning maps directly." },
  { sourceId: "creative-director", target: "creative-director", decision: "built-in-existing", notes: "Creative direction maps directly." },
  { sourceId: "game-designer", target: "game-designer", decision: "built-in-existing", notes: "Implementation-level design maps directly." },
  { sourceId: "systems-designer", target: "systems-designer", decision: "built-in-existing", notes: "Systems design maps directly." },
  { sourceId: "economy-designer", target: "economy-designer", decision: "built-in-existing", notes: "Economy design maps directly." },
  { sourceId: "level-designer", target: "level-designer", decision: "built-in-existing", notes: "Level design maps directly." },
  { sourceId: "world-builder", target: "world-builder", decision: "built-in-existing", notes: "World building maps directly." },
  { sourceId: "writer", target: "writer", decision: "built-in-existing", notes: "Writing maps directly." },
  { sourceId: "gameplay-programmer", target: "gameplay-programmer", decision: "built-in-existing", notes: "Gameplay implementation maps directly." },
  { sourceId: "ai-programmer", target: "ai-programmer", decision: "built-in-existing", notes: "AI implementation maps directly." },
  { sourceId: "network-programmer", target: "network-programmer", decision: "built-in-existing", notes: "Networking implementation maps directly." },
  { sourceId: "ui-programmer", target: "ui-programmer", decision: "built-in-existing", notes: "UI implementation maps directly." },
  { sourceId: "engine-programmer", target: "engine-programmer", decision: "built-in-existing", notes: "Engine implementation maps directly." },
  { sourceId: "tools-programmer", target: "tools-programmer", decision: "built-in-existing", notes: "Tools implementation maps directly." },
  { sourceId: "technical-director", target: "technical-director", decision: "built-in-existing", notes: "Technical direction maps directly." },
  { sourceId: "devops-engineer", target: "devops-engineer", decision: "built-in-existing", notes: "DevOps maps directly." },
  { sourceId: "security-engineer", target: "security-engineer", decision: "built-in-existing", notes: "Security review maps directly." },
  { sourceId: "performance-analyst", target: "performance-analyst", decision: "built-in-existing", notes: "Performance review maps directly." },
  { sourceId: "technical-artist", target: "technical-artist", decision: "built-in-existing", notes: "Technical art maps directly." },
  { sourceId: "audio-director", target: "audio-director", decision: "built-in-existing", notes: "Audio direction maps directly." },
  { sourceId: "sound-designer", target: "sound-designer", decision: "built-in-existing", notes: "Sound design maps directly." },
  { sourceId: "accessibility-specialist", target: "accessibility-specialist", decision: "built-in-existing", notes: "Accessibility maps directly." },
  { sourceId: "localization-lead", target: "localization-lead", decision: "built-in-existing", notes: "Localization maps directly." },
  { sourceId: "live-ops-designer", target: "live-ops-designer", decision: "built-in-existing", notes: "Live ops maps directly." },
  { sourceId: "community-manager", target: "community-manager", decision: "built-in-existing", notes: "Community management maps directly." },
  { sourceId: "release-manager", target: "release-manager", decision: "built-in-existing", notes: "Release management maps directly." },
  { sourceId: "godot-specialist", target: "godot-specialist", decision: "built-in-existing", notes: "Active engine specialist." },
  { sourceId: "unity-specialist", target: "unity-specialist", decision: "built-in-existing", notes: "Active engine specialist." },
  { sourceId: "unreal-specialist", target: "unreal-specialist", decision: "built-in-existing", notes: "Active engine specialist." },
  { sourceId: "analytics-engineer", target: "data-scientist", decision: "built-in-existing", notes: "Analytics engineering maps to data-scientist plus analytics templates." },
  { sourceId: "art-director", target: "senior-game-artist", decision: "built-in-existing", notes: "Art direction maps to senior-game-artist and art-direction workflow." },
  { sourceId: "narrative-director", target: "narrative-designer", decision: "built-in-existing", notes: "Narrative direction maps to narrative-designer/world-builder." },
  { sourceId: "ux-designer", target: "ui-ux-designer", decision: "built-in-existing", notes: "UX maps to UI/UX designer." },
  { sourceId: "qa-lead", target: "qa-lead", decision: "built-in-add-candidate", notes: "Add only if QA strategy needs a separate owner from qa-playtester." },
  { sourceId: "qa-tester", target: "qa-playtester", decision: "defer", notes: "Current QA playtester covers test cases and evidence; split later if needed." },
  { sourceId: "lead-programmer", target: "lead-programmer", decision: "built-in-add-candidate", notes: "Add only if technical-director is too broad for code ownership." },
  { sourceId: "prototyper", target: "prototype", decision: "workflow", notes: "Keep as workflow/recipe, not a separate role." },
  { sourceId: "godot-gdscript-specialist", target: "engine-reference/godot", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "godot-csharp-specialist", target: "engine-reference/godot", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "godot-gdextension-specialist", target: "engine-reference/godot", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "godot-shader-specialist", target: "engine-reference/godot", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "unity-addressables-specialist", target: "engine-reference/unity", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "unity-dots-specialist", target: "engine-reference/unity", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "unity-shader-specialist", target: "engine-reference/unity", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "unity-ui-specialist", target: "engine-reference/unity", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "ue-blueprint-specialist", target: "engine-reference/unreal", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "ue-gas-specialist", target: "engine-reference/unreal", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "ue-replication-specialist", target: "engine-reference/unreal", decision: "specialty-context", notes: "Task-keyword selected engine context." },
  { sourceId: "ue-umg-specialist", target: "engine-reference/unreal", decision: "specialty-context", notes: "Task-keyword selected engine context." }
];

export const ccgsSkillAdaptations: CcgsSkillAdaptation[] = [
  { sourceId: "vertical-slice", target: "vertical-slice", decision: "recipe", notes: "Create explicit task graph before orchestration." },
  { sourceId: "bug-triage", target: "bugfix", decision: "recipe", notes: "Bugfix recipe covers repro/fix/verify." },
  { sourceId: "team-ui", target: "ui-ux-review", decision: "recipe", notes: "Team orchestration becomes explicit task graph." },
  { sourceId: "team-release", target: "release-checklist", decision: "recipe", notes: "Release team becomes explicit task graph." },
  { sourceId: "gate-check", target: "gate-check", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "project-stage-detect", target: "project-stage-detect", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "scope-check", target: "scope-check", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "estimate", target: "estimate", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "asset-audit", target: "asset-audit", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "balance-check", target: "balance-check", decision: "workflow", notes: "High-value future workflow." },
  { sourceId: "skill-improve", target: "none", decision: "out-of-scope", notes: "Claude skill maintenance is not an OGS product surface." },
  { sourceId: "skill-test", target: "none", decision: "out-of-scope", notes: "Claude skill maintenance is not an OGS product surface." }
];

export function validateCcgsAdaptation(): string[] {
  const problems: string[] = [];
  const builtIns = new Set<string>(studioRoleIds);
  const workflows = new Set<string>(workflowIds());
  for (const item of ccgsRoleAdaptations) {
    if (item.decision === "built-in-existing" && !builtIns.has(item.target)) problems.push(`${item.sourceId} targets missing built-in role ${item.target}`);
  }
  for (const item of ccgsSkillAdaptations) {
    if ((item.decision === "workflow" || item.decision === "recipe") && item.target !== "none" && !workflows.has(item.target as WorkflowId)) {
      // Future workflow candidates are allowed to be named before implementation.
      if (!["gate-check", "project-stage-detect", "scope-check", "estimate", "asset-audit", "balance-check"].includes(item.target)) problems.push(`${item.sourceId} targets missing workflow ${item.target}`);
    }
  }
  return problems;
}
