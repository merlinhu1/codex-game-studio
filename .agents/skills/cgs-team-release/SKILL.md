---
name: cgs-team-release
description: Use for team release tasks that coordinate release management, build pipeline, store assets, QA signoff, comms, and rollback; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the team-release objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-release/SKILL.md
source-hash: 9cb0f1c15b4af864f57717de9f3ef4ad516370d6abf1d0047e0b7ed10d496b69
user-invocable: true
---

# Codex Game Studio Team Release

Use this skill for team release work in Template Game.

## Objective

Coordinate release management, build pipeline, store assets, QA signoff, comms, and rollback.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/timeline.md
- task-relevant team files

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested coordinate release management, build pipeline, store assets, qa signoff, comms, and rollback. and identify the current project stage.
2. Collect evidence for Release Scope, Build, Store.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Release Scope
- Build
- Store
- Rollback
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Release Scope
- Build
- Store
- Rollback
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
