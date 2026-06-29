---
name: cgs-gate-check
description: Use for Codex Game Studio gate check work: Run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision.
---

# Codex Game Studio Gate Check

Use this skill for gate check work in Template Game.

## Objective

Run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md

## Procedure

1. Clarify the requested run an advisory phase or artifact gate with criteria, evidence, concerns, and user-controlled next decision. and identify the current project stage.
2. Collect evidence for Gate Criteria, Evidence, Concerns.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Gate Criteria
- Evidence
- Concerns
- Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Gate Criteria
- Evidence
- Concerns
- Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
