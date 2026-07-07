---
name: cgs-standards-narrative
description: Use for narrative standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-narrative/SKILL.md
source-hash: 60e4ee1f2a5ad57c88cc50db0f634108609ae17862281c674d960e64c8c2cae0
user-invocable: true
---

# Codex Game Studio Narrative Standards

Use this skill for narrative standards work in Template Game.

## Objective

narrative content with voice consistency, branching context, localization readiness, and implementation hooks

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Procedure

1. Read the requested files and identify the narrative standards rule being applied.
2. Check narrative content with voice consistency, branching context, localization readiness, and implementation hooks.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Voice
- Branch Context
- Localization
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
