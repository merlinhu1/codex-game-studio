---
name: cgs-adopt
description: Use for adopt tasks that inventory existing source, assets, docs, and tests before mapping work into CGS structure; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the adopt objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/adopt/SKILL.md
source-hash: 58959c4f76c05fbe3fd60b7a7d2c4ba5bf861fce28c0da49a498a81656b6a05e
user-invocable: true
---

# Codex Game Studio Adopt Existing Project

Use this skill for adopt existing project work in Template Game.

## Objective

Inventory existing source, assets, docs, and tests before mapping work into CGS structure.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested inventory existing source, assets, docs, and tests before mapping work into cgs structure. and identify the current project stage.
2. Collect evidence for Inventory, Migration Map, Do Not Move First.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Inventory
- Migration Map
- Do Not Move First
- Adoption Risks
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Inventory
- Migration Map
- Do Not Move First
- Adoption Risks
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
