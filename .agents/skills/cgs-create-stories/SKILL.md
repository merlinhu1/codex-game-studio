---
name: cgs-create-stories
description: Use for Codex Game Studio create stories work: Break an epic into small stories with acceptance criteria, owner role, files, and verification.
---

# Codex Game Studio Create Stories

Use this skill for create stories work in Template Game.

## Objective

Break an epic into small stories with acceptance criteria, owner role, files, and verification.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/create-stories.md

## Procedure

1. Clarify the requested break an epic into small stories with acceptance criteria, owner role, files, and verification. and identify the current project stage.
2. Collect evidence for Story, Acceptance Criteria, Owner Role.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Story
- Acceptance Criteria
- Owner Role
- Verification
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Story
- Acceptance Criteria
- Owner Role
- Verification
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
