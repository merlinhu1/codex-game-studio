---
name: cgs-architecture-decision
description: Use for architecture decision tasks that write an ADR with context, options, decision, consequences, validation, and rollback; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the architecture-decision objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/architecture-decision/SKILL.md
source-hash: 94a2299ae4ff370062e15d37680abdb13c1fc2dc05b916dcb65f46088d12b854
user-invocable: true
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

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

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

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
