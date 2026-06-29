---
name: cgs-estimate
description: Use for Codex Game Studio estimate work: Estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges.
---

# Codex Game Studio Estimate

Use this skill for estimate work in Template Game.

## Objective

Estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md

## Procedure

1. Clarify the requested estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges. and identify the current project stage.
2. Collect evidence for Estimate Range, Confidence, Dependency.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Estimate Range
- Confidence
- Dependency
- Buffer
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Estimate Range
- Confidence
- Dependency
- Buffer
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
