---
name: cgs-day-one-patch
description: Use for day one patch tasks that plan launch-window fixes, risk acceptance, validation, platform submission, and player communication; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the day-one-patch objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/day-one-patch/SKILL.md
source-hash: eb48e1eb8a578056ff31f6ee2b6a2d61fb02d65a0af3441a9922002b7583aab0
user-invocable: true
---

# Codex Game Studio Day One Patch

Use this skill for day one patch work in Template Game.

## Objective

Plan launch-window fixes, risk acceptance, validation, platform submission, and player communication.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/

## Procedure

1. Clarify the requested plan launch-window fixes, risk acceptance, validation, platform submission, and player communication. and identify the current project stage.
2. Collect evidence for Patch Scope, Risk, Submission.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Patch Scope
- Risk
- Submission
- Player Communication
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Patch Scope
- Risk
- Submission
- Player Communication
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
