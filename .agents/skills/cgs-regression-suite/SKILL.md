---
name: cgs-regression-suite
description: Use for regression suite tasks that define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the regression-suite objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/regression-suite/SKILL.md
source-hash: 8f073b6b576c88fba6129efd57f4c71f04c97563f3c5a532c0ae28d2a5c0f0fc
user-invocable: true
---

# Codex Game Studio Regression Suite

Use this skill for regression suite work in Template Game.

## Objective

Define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/regression-suite.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers. and identify the current project stage.
2. Collect evidence for Critical Path, Prior Bug, Regression Case.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Critical Path
- Prior Bug
- Regression Case
- Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Critical Path
- Prior Bug
- Regression Case
- Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
