---
name: cgs-soak-test
description: Use for soak test tasks that plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the soak-test objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/soak-test/SKILL.md
source-hash: 9f090f0e39575265a9e8e5e042dd81af81191e346ed3a92983a8d1d1a5ba6bc1
user-invocable: true
---

# Codex Game Studio Soak Test

Use this skill for soak test work in Template Game.

## Objective

Plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops.

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

1. Clarify the requested plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops. and identify the current project stage.
2. Collect evidence for Duration, Metric, Failure Threshold.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Duration
- Metric
- Failure Threshold
- Soak Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Duration
- Metric
- Failure Threshold
- Soak Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
