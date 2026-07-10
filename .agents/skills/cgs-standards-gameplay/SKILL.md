---
name: cgs-standards-gameplay
description: Use for standards gameplay tasks that mechanics, tuning, data-driven values, engine idioms, and player-facing acceptance checks; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the standards-gameplay objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-gameplay/SKILL.md
source-hash: 8f4a5521503528f90ec5445e328bb4d23150b5ebd74fecb22fb7449f9a26165e
user-invocable: true
---

# Codex Game Studio Gameplay Standards

Use this skill for gameplay standards work in Template Game.

## Objective

mechanics, tuning, data-driven values, engine idioms, and player-facing acceptance checks

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, or assets

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Read the requested files and identify the gameplay standards rule being applied.
2. Check mechanics, tuning, data-driven values, engine idioms, and player-facing acceptance checks.
3. Report violations with file paths, impact, and the smallest safe fix.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Data Driven Values
- Engine Boundary
- Playable Check
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
