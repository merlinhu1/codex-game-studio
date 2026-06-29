---
name: cgs-setup-engine
description: Use for Codex Game Studio setup engine work: Pin engine version, verify project markers, document conventions, and run engine smoke checks.
---

# Codex Game Studio Setup Engine

Use this skill for setup engine work in Template Game.

## Objective

Pin engine version, verify project markers, document conventions, and run engine smoke checks.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Procedure

1. Clarify the requested pin engine version, verify project markers, document conventions, and run engine smoke checks. and identify the current project stage.
2. Collect evidence for Engine Version, Project Markers, Naming Conventions.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Engine Version
- Project Markers
- Naming Conventions
- Smoke Check
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Engine Version
- Project Markers
- Naming Conventions
- Smoke Check
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
