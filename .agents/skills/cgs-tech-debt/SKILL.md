---
name: cgs-tech-debt
description: Use for Codex Game Studio tech debt work: Identify technical debt, production risk, payoff, safe refactor slices, and validation needed.
---

# Codex Game Studio Tech Debt

Use this skill for tech debt work in Template Game.

## Objective

Identify technical debt, production risk, payoff, safe refactor slices, and validation needed.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/

## Procedure

1. Clarify the requested identify technical debt, production risk, payoff, safe refactor slices, and validation needed. and identify the current project stage.
2. Collect evidence for Debt Item, Risk, Payoff.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Debt Item
- Risk
- Payoff
- Refactor Slice
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Debt Item
- Risk
- Payoff
- Refactor Slice
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
