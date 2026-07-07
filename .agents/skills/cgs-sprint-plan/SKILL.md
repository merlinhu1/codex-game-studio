---
name: cgs-sprint-plan
description: Use for sprint plan tasks that create a 1-2 week sprint plan with goals, tasks, owners, dependencies, risks, and acceptance criteria; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the sprint-plan objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/sprint-plan/SKILL.md
source-hash: d402a9f276f81663c8b07f6c4fd2b19a3fa9d4ee9411e3d57e6868daa095ee42
user-invocable: true
---

# Codex Game Studio Sprint Plan

Use this skill for sprint plan work in Template Game.

## Objective

Create a 1-2 week sprint plan with goals, tasks, owners, dependencies, risks, and acceptance criteria.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/sprint-plan.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested create a 1-2 week sprint plan with goals, tasks, owners, dependencies, risks, and acceptance criteria. and identify the current project stage.
2. Collect evidence for Sprint Goals, Task Table, Owner.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Sprint Goals
- Task Table
- Owner
- Risk Register
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Sprint Goals
- Task Table
- Owner
- Risk Register
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
