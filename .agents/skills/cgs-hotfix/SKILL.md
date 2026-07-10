---
name: cgs-hotfix
description: Use for hotfix tasks that scope and execute an urgent fix with reproduction, minimal change, verification, release notes, and rollback; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the hotfix objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/hotfix/SKILL.md
source-hash: 6d99a79bce373cd9f8fe02b1db2933c9121ac0a79c778d588dd03b5f337c4bf9
user-invocable: true
---

# Codex Game Studio Hotfix

Use this skill for hotfix work in Template Game.

## Objective

Scope and execute an urgent fix with reproduction, minimal change, verification, release notes, and rollback.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/
- .codex/workflows/hotfix.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested scope and execute an urgent fix with reproduction, minimal change, verification, release notes, and rollback. and identify the current project stage.
2. Collect evidence for Incident, Minimal Fix, Verification.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Incident
- Minimal Fix
- Verification
- Rollback
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Incident
- Minimal Fix
- Verification
- Rollback
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
