---
name: cgs-review-all-gdds
description: Use for Codex Game Studio review all gdds work: Cross-check all GDDs for consistency, missing systems, dependency conflicts, and production readiness.
---

# Codex Game Studio Review All GDDs

Use this skill for review all gdds work in Template Game.

## Objective

Cross-check all GDDs for consistency, missing systems, dependency conflicts, and production readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Procedure

1. Clarify the requested cross-check all gdds for consistency, missing systems, dependency conflicts, and production readiness. and identify the current project stage.
2. Collect evidence for GDD Coverage, Contradictions, Missing Systems.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- GDD Coverage
- Contradictions
- Missing Systems
- Readiness Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- GDD Coverage
- Contradictions
- Missing Systems
- Readiness Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
