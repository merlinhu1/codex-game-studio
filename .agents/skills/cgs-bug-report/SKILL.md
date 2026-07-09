---
name: cgs-bug-report
description: Use for bug report tasks that capture a reproducible bug with environment, steps, expected/actual behavior, severity, evidence, and owner; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: luna
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the bug-report objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/bug-report/SKILL.md
source-hash: 2960da7266e446de232a7f46229a9908825b188db4a28d834f030690d646575e
user-invocable: true
---

# Codex Game Studio Bug Report

Use this skill for bug report work in Template Game.

## Objective

Capture a reproducible bug with environment, steps, expected/actual behavior, severity, evidence, and owner.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Capture environment, build/version, branch, and affected feature.
2. Write Reproduction Steps that a different agent can follow without extra context.
3. Record Expected vs Actual behavior and player impact.
4. Attach Evidence such as logs, screenshots, recordings, failing tests, or engine output.
5. Assign severity, likely owner role, regression risk, and verification path.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Reproduction Steps
- Expected vs Actual
- Evidence
- Severity
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Reproduction Steps
- Expected vs Actual
- Evidence
- Severity
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
