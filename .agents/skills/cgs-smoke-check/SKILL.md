---
name: cgs-smoke-check
description: Use for smoke check tasks that run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the smoke-check objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/smoke-check/SKILL.md
source-hash: 98521191c6dd949bce2df9d4f8d4abeebbc0adf36b665e7a99d7645dc9ed42e3
user-invocable: true
---

# Codex Game Studio Smoke Check

Use this skill for smoke check work in Template Game.

## Objective

Run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state. and identify the current project stage.
2. Collect evidence for Launch, Build, Basic Play.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Launch
- Build
- Basic Play
- Smoke Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Launch
- Build
- Basic Play
- Smoke Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
