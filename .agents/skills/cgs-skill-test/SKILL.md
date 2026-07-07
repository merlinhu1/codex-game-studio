---
name: cgs-skill-test
description: Use for skill test tasks that test a repository skill against fixtures, required sections, dry-runs, and behavioral expectations; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the skill-test objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/skill-test/SKILL.md
source-hash: 24d09805593a811cc10b46d40a45eb1e36b040cfdc4e7a2ae3e36ffa51bd4cf9
user-invocable: true
---

# Codex Game Studio Skill Test

Use this skill for skill test work in Template Game.

## Objective

Test a repository skill against fixtures, required sections, dry-runs, and behavioral expectations.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested test a repository skill against fixtures, required sections, dry-runs, and behavioral expectations. and identify the current project stage.
2. Collect evidence for Skill Fixture, Required Marker, Dry Run.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Skill Fixture
- Required Marker
- Dry Run
- Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Skill Fixture
- Required Marker
- Dry Run
- Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
