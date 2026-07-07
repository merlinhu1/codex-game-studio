---
name: cgs-changelog
description: Use for changelog tasks that maintain a developer-facing changelog grouped by feature, fix, content, performance, and breaking change; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Describe the changelog objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/changelog/SKILL.md
source-hash: 305d9f720a28c8ff3bfc5badd0732a731f10bb81d81c63c61655018dd2c7dc5b
user-invocable: true
---

# Codex Game Studio Changelog

Use this skill for changelog work in Template Game.

## Objective

Maintain a developer-facing changelog grouped by feature, fix, content, performance, and breaking change.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/

## Procedure

1. Clarify the requested maintain a developer-facing changelog grouped by feature, fix, content, performance, and breaking change. and identify the current project stage.
2. Collect evidence for Added, Changed, Fixed.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Added
- Changed
- Fixed
- Breaking
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Added
- Changed
- Fixed
- Breaking
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
