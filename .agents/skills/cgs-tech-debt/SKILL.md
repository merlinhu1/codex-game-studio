---
name: cgs-tech-debt
description: Use for tech debt tasks that identify technical debt, production risk, payoff, safe refactor slices, and validation needed; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the tech-debt objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/tech-debt/SKILL.md
source-hash: bebf9faf308eb8ac4dbd70e907e2ae64daff51d86bf16353f5997543c318c6c8
user-invocable: true
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

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

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

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
