---
name: cgs-architecture-decision
description: Use for Codex Game Studio architecture decision work: Write an ADR with context, options, decision, consequences, validation, and rollback.
---

# Codex Game Studio Architecture Decision

Use this skill for architecture decision work in Template Game.

## Objective

Write an ADR with context, options, decision, consequences, validation, and rollback.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md
- .codex/workflows/architecture-decision.md

## Procedure

1. Clarify the requested write an adr with context, options, decision, consequences, validation, and rollback. and identify the current project stage.
2. Collect evidence for Context, Options, Decision.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Context
- Options
- Decision
- Consequences
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Context
- Options
- Decision
- Consequences
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
