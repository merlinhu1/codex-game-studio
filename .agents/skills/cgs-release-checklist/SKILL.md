---
name: cgs-release-checklist
description: Use for Codex Game Studio release checklist work: Check build, packaging, store, QA, localization, accessibility, rollback, and ship/no-ship readiness.
---

# Codex Game Studio Release Checklist

Use this skill for release checklist work in Template Game.

## Objective

Check build, packaging, store, QA, localization, accessibility, rollback, and ship/no-ship readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/
- .codex/workflows/release-checklist.md

## Procedure

1. Clarify the requested check build, packaging, store, qa, localization, accessibility, rollback, and ship/no-ship readiness. and identify the current project stage.
2. Collect evidence for Build Evidence, Blocking Issues, Rollback.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Build Evidence
- Blocking Issues
- Rollback
- Ship Verdict
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Build Evidence
- Blocking Issues
- Rollback
- Ship Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
