---
name: cgs-project-stage-detect
description: Use for Codex Game Studio project stage detect work: Detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release.
---

# Codex Game Studio Project Stage Detect

Use this skill for project stage detect work in Template Game.

## Objective

Detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Procedure

1. Clarify the requested detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release. and identify the current project stage.
2. Collect evidence for Stage Evidence, Missing Required Artifact, Recommended Phase.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Stage Evidence
- Missing Required Artifact
- Recommended Phase
- Confidence
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Stage Evidence
- Missing Required Artifact
- Recommended Phase
- Confidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
