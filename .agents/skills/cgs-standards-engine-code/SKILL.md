---
name: cgs-standards-engine-code
description: Use for engine code standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.6-luna
model_reasoning_effort: medium
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-engine-code/SKILL.md
source-hash: b33b76de847ffbd872f4572a7df1864628601eef9c2957ced8636639a3dff9ec
user-invocable: true
---

# Codex Game Studio Engine Code Standards

Use this skill for engine code standards work in Template Game.

## Objective

core engine-facing code with lifecycle safety, allocation discipline, engine idioms, and smoke verification

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Read the requested files and identify the engine code standards rule being applied.
2. Check core engine-facing code with lifecycle safety, allocation discipline, engine idioms, and smoke verification.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Lifecycle
- Allocation
- Engine Smoke
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
