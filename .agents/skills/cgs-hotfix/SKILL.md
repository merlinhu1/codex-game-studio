---
name: cgs-hotfix
description: Use for Codex Game Studio hotfix work: Scope and execute an urgent fix with reproduction, minimal change, verification, release notes, and rollback.
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

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
