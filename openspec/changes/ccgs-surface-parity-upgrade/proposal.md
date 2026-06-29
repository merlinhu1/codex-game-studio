## Why

Codex Game Studio now exposes Codex-native agents, skills, and workflows, but the first generated pass is much thinner than Claude Code Game Studios. A preliminary inventory shows CGS currently has 38 role IDs, 31 workflow IDs, and 11 generated skills, while the CCGS reference checkout has 49 agents, 73 skills, and a 395-line workflow catalog with phase gates and artifact checks.

This change creates a one-by-one CCGS comparison and upgrade plan so CGS improves content quality without blindly copying Claude-specific surfaces or hidden lifecycle behavior.

## What Changes

- Add a parity audit pipeline that inventories every CCGS agent, skill, and workflow-catalog step and maps it to a CGS role, workflow, skill, template, validation rule, or explicit deferral.
- Add a quality rubric for generated agents, skills, and workflows covering domain depth, context inputs, procedure phases, output contracts, gate verdicts, escalation rules, tool/runtime boundaries, and behavioral-eval coverage.
- Upgrade CGS generated Codex-native surfaces where the audit finds CGS is thinner than CCGS and the source behavior fits CGS product boundaries.
- Expand generated skills from the current first-pass set toward CCGS-equivalent workflow coverage under `.agents/skills/<name>/SKILL.md`.
- Expand or deepen role packages and custom-agent TOML developer instructions where CCGS agents carry stronger domain protocols.
- Add workflow phase/catalog support where CCGS has explicit progression, required artifacts, repeatable steps, and gates that CGS lacks.
- Add parity reports, tests, and validation that fail when an audited surface regresses below the accepted quality bar.
- Do not add `.claude/**` compatibility, Claude hooks, hidden lifecycle automation, or Codex permission rules for coding standards.

## Capabilities

### New Capabilities

- `ccgs-surface-parity-audit`: Inventory, map, score, and track every CCGS agent, skill, and workflow step against CGS surfaces.
- `codex-surface-quality-upgrades`: Upgrade CGS Codex-native agents, skills, workflows, templates, and validation where the audit shows quality or coverage gaps.

### Modified Capabilities

None. This repository has no archived OpenSpec specs yet; the prior repository-root change is still an active change artifact.

## Impact

- Source: `src/roles.ts`, `src/agents.ts`, `src/skills.ts`, `src/workflows.ts`, `src/workflow-recipes.ts`, `src/templates.ts`, `src/validation.ts`, and related helpers.
- Tests: `tests/agents-templates.test.ts`, `tests/project-workflow.test.ts`, `tests/runner.test.ts`, `tests/validation.test.ts`, new parity/audit tests, and optional behavioral-evaluation fixtures.
- Generated surfaces: `AGENTS.md`, `.codex/agents/*.toml`, `.codex/prompts/*.md`, `.codex/workflows/*.md`, `.agents/skills/*/SKILL.md`, `.codex/context-manifest.json`, and starter game docs.
- Reference input: `/opt/data/repos/Claude-Code-Game-Studios/.claude/agents/**`, `.claude/skills/**`, `.claude/docs/workflow-catalog.yaml`, `.claude/docs/templates/**`, `.claude/rules/**`, and `.claude/docs/**`.
- Docs and truth: README/user guide updates only after implementation behavior changes; Truthmark docs updated after code and tests land.
