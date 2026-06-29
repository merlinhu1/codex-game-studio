---
name: cgs-sprint-status
description: Use for Codex Game Studio sprint status work: Report sprint progress, blockers, risk changes, completed work, and next decisions.
---

# Codex Game Studio Sprint Status

Use this skill for sprint status work in Template Game.

## Objective

Report sprint progress, blockers, risk changes, completed work, and next decisions.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/sprint-status.md

## Procedure

1. Clarify the requested report sprint progress, blockers, risk changes, completed work, and next decisions. and identify the current project stage.
2. Collect evidence for Progress, Blocker, Risk Change.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Progress
- Blocker
- Risk Change
- Next Decision
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Progress
- Blocker
- Risk Change
- Next Decision
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
