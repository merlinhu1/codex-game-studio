---
name: cgs-gate-check
description: Use for gate check tasks that run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the gate-check objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/gate-check/SKILL.md
source-hash: 3ae463120765909eedb2d04f592191bf90afda4795ae88522d314e1833773da7
user-invocable: true
---

# Codex Game Studio Gate Check

Use this skill for gate check work in Template Game.

## Objective

Run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision. and identify the current project stage.
2. Collect evidence for Gate Criteria, Evidence, Concerns.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Gate Criteria
- Evidence
- Concerns
- Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Gate Criteria
- Evidence
- Concerns
- Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
