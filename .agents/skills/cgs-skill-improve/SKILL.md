---
name: cgs-skill-improve
description: Use for skill improve tasks that improve a skill after observed failures while preserving trigger, procedure, validation, and handoff clarity; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the skill-improve objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/skill-improve/SKILL.md
source-hash: 24efa8aa68ab240c1d9b1366275490ec9cce4034e1bbe34f214b830bda15617b
user-invocable: true
---

# Codex Game Studio Skill Improve

Use this skill for skill improve work in Template Game.

## Objective

Improve a skill after observed failures while preserving trigger, procedure, validation, and handoff clarity.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested improve a skill after observed failures while preserving trigger, procedure, validation, and handoff clarity. and identify the current project stage.
2. Collect evidence for Observed Failure, Procedure Fix, Regression Test.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Observed Failure
- Procedure Fix
- Regression Test
- Skill Handoff
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Observed Failure
- Procedure Fix
- Regression Test
- Skill Handoff
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
