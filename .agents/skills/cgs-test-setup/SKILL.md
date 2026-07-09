---
name: cgs-test-setup
description: Use for test setup tasks that configure test harnesses, fixtures, commands, and documentation so validation is repeatable; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the test-setup objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/test-setup/SKILL.md
source-hash: bf3477f58af77fdeabed42e9c15f1b7bd41d6837c1ddff0450922cee694c628d
user-invocable: true
---

# Codex Game Studio Test Setup

Use this skill for test setup work in Template Game.

## Objective

Configure test harnesses, fixtures, commands, and documentation so validation is repeatable.

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

1. Clarify the requested configure test harnesses, fixtures, commands, and documentation so validation is repeatable. and identify the current project stage.
2. Collect evidence for Test Command, Fixture, Harness.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Test Command
- Fixture
- Harness
- Repeatability
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Test Command
- Fixture
- Harness
- Repeatability
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
