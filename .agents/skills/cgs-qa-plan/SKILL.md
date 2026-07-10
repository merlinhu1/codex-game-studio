---
name: cgs-qa-plan
description: Use for qa plan tasks that plan focused QA coverage across features, risks, platforms, devices, regressions, and acceptance criteria; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the qa-plan objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/qa-plan/SKILL.md
source-hash: f4e9823754aaad75ff87fe700a826c0953ce9ddf853130e2d6cdf3ba2d3622ba
user-invocable: true
---

# Codex Game Studio QA Plan

Use this skill for qa plan work in Template Game.

## Objective

Plan focused QA coverage across features, risks, platforms, devices, regressions, and acceptance criteria.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/qa-plan.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested plan focused qa coverage across features, risks, platforms, devices, regressions, and acceptance criteria. and identify the current project stage.
2. Collect evidence for Test Matrix, Risk Coverage, Acceptance Criteria.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Test Matrix
- Risk Coverage
- Acceptance Criteria
- Evidence
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Test Matrix
- Risk Coverage
- Acceptance Criteria
- Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
