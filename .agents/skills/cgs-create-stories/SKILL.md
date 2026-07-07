---
name: cgs-create-stories
description: Use for create stories tasks that break an epic into small stories with acceptance criteria, owner role, files, and verification; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the create-stories objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/create-stories/SKILL.md
source-hash: f1517b9f5a90317f93149c9915ade684dbf75ab8b00c1ea9bdeaa6f921756b56
user-invocable: true
---

# Codex Game Studio Create Stories

Use this skill for create stories work in Template Game.

## Objective

Break an epic into small stories with acceptance criteria, owner role, files, and verification.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/create-stories.md

## Procedure

1. Clarify the requested break an epic into small stories with acceptance criteria, owner role, files, and verification. and identify the current project stage.
2. Collect evidence for Story, Acceptance Criteria, Owner Role.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Story
- Acceptance Criteria
- Owner Role
- Verification
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Story
- Acceptance Criteria
- Owner Role
- Verification
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
