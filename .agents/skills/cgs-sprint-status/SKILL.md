---
name: cgs-sprint-status
description: Use for sprint status tasks that report sprint progress, blockers, risk changes, completed work, and next decisions; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the sprint-status objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/sprint-status/SKILL.md
source-hash: 58b80b7ee9a31eb4798f0700b4054fd705b1d6642eb63cead4166d3ffbe6f138
user-invocable: true
---

# Codex Game Studio Sprint Status

Use this skill for sprint status work in Template Game.

## Objective

Report sprint progress, blockers, risk changes, completed work, and next decisions.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/sprint-status.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested report sprint progress, blockers, risk changes, completed work, and next decisions. and identify the current project stage.
2. Collect evidence for Progress, Blocker, Risk Change.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Progress
- Blocker
- Risk Change
- Next Decision
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Progress
- Blocker
- Risk Change
- Next Decision
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
