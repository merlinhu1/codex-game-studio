---
name: cgs-create-epics
description: Use for create epics tasks that break project goals into epics with outcomes, dependencies, risks, and validation gates; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the create-epics objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/create-epics/SKILL.md
source-hash: 5a761ad272143ddf694cd29068bf11efba18cd24ef4e23c48c79326d0d67a259
user-invocable: true
---

# Codex Game Studio Create Epics

Use this skill for create epics work in Template Game.

## Objective

Break project goals into epics with outcomes, dependencies, risks, and validation gates.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/create-epics.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested break project goals into epics with outcomes, dependencies, risks, and validation gates. and identify the current project stage.
2. Collect evidence for Epic Outcome, Dependencies, Risk.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Epic Outcome
- Dependencies
- Risk
- Gate
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Epic Outcome
- Dependencies
- Risk
- Gate
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
