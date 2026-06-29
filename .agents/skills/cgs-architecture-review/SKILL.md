---
name: cgs-architecture-review
description: Use for Codex Game Studio architecture review work: Review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness.
---

# Codex Game Studio Architecture Review

Use this skill for architecture review work in Template Game.

## Objective

Review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md
- .codex/workflows/architecture-review.md

## Procedure

1. Clarify the requested review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness. and identify the current project stage.
2. Collect evidence for Layer Violation, Scalability Risk, Testing Seam.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Layer Violation
- Scalability Risk
- Testing Seam
- Architecture Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Layer Violation
- Scalability Risk
- Testing Seam
- Architecture Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
