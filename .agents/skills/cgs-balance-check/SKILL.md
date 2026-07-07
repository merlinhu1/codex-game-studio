---
name: cgs-balance-check
description: Use for balance check tasks that evaluate tuning values, progression pacing, economy levers, exploits, and player-skill assumptions; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the balance-check objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/balance-check/SKILL.md
source-hash: c668fe38534a60c5ec3b86130461bf370c49593c82e93fecc4987571a7ef1bba
user-invocable: true
---

# Codex Game Studio Balance Check

Use this skill for balance check work in Template Game.

## Objective

Evaluate tuning values, progression pacing, economy levers, exploits, and player-skill assumptions.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Procedure

1. Clarify the requested evaluate tuning values, progression pacing, economy levers, exploits, and player-skill assumptions. and identify the current project stage.
2. Collect evidence for Balance Lever, Exploit Risk, Pacing.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Balance Lever
- Exploit Risk
- Pacing
- Telemetry Need
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Balance Lever
- Exploit Risk
- Pacing
- Telemetry Need
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
