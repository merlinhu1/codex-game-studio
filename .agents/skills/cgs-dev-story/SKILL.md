---
name: cgs-dev-story
description: Use for dev story tasks that turn a design or bug into an implementation-ready story with owner, files, acceptance tests, and dependencies; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the dev-story objective, target files/assets, constraints, and verification evidence.
primary-agent: gameplay-programmer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/dev-story/SKILL.md
source-hash: ddada36350af8d121b63159e79eb72e3d5a1482b74e88f547f556ca92efd2b04
user-invocable: true
---

# Codex Game Studio Development Story

Use this skill for development story work in Template Game.

## Objective

Turn a design or bug into an implementation-ready story with owner, files, acceptance tests, and dependencies.

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

1. Clarify the requested turn a design or bug into an implementation-ready story with owner, files, acceptance tests, and dependencies. and identify the current project stage.
2. Collect evidence for Story Goal, Owner, Dependencies.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Story Goal
- Owner
- Dependencies
- Acceptance Tests
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Story Goal
- Owner
- Dependencies
- Acceptance Tests
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
