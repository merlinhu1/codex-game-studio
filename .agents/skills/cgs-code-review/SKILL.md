---
name: cgs-code-review
description: Use for Codex Game Studio code review work: Review changes for correctness, maintainability, security, tests, engine idioms, and scope control.
---

# Codex Game Studio Code Review

Use this skill for code review work in Template Game.

## Objective

Review changes for correctness, maintainability, security, tests, engine idioms, and scope control.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md

## Procedure

1. Clarify the requested review changes for correctness, maintainability, security, tests, engine idioms, and scope control. and identify the current project stage.
2. Collect evidence for Correctness, Maintainability, Security.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Correctness
- Maintainability
- Security
- Review Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Correctness
- Maintainability
- Security
- Review Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
