---
name: cgs-story-readiness
description: Use for Codex Game Studio story readiness work: Check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation.
---

# Codex Game Studio Story Readiness

Use this skill for story readiness work in Template Game.

## Objective

Check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/story-readiness.md

## Procedure

1. Clarify the requested check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation. and identify the current project stage.
2. Collect evidence for Ready, Missing Input, Dependency.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Ready
- Missing Input
- Dependency
- Acceptance Criteria
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Ready
- Missing Input
- Dependency
- Acceptance Criteria
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
