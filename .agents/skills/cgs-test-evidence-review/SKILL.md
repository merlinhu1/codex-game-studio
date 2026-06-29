---
name: cgs-test-evidence-review
description: Use for Codex Game Studio test evidence review work: Review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps.
---

# Codex Game Studio Test Evidence Review

Use this skill for test evidence review work in Template Game.

## Objective

Review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps. and identify the current project stage.
2. Collect evidence for Evidence, Gap, Confidence.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Evidence
- Gap
- Confidence
- Follow-up
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Evidence
- Gap
- Confidence
- Follow-up
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
