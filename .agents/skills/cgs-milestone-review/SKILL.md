---
name: cgs-milestone-review
description: Use for milestone review tasks that review milestone readiness, completed evidence, blockers, carryover, and phase transition risk; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the milestone-review objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/milestone-review/SKILL.md
source-hash: 736a1cffb028b96b890fd0b6b469dcdd5f948a907d5a7f0e157ccca92ac8adc7
user-invocable: true
---

# Codex Game Studio Milestone Review

Use this skill for milestone review work in Template Game.

## Objective

Review milestone readiness, completed evidence, blockers, carryover, and phase transition risk.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested review milestone readiness, completed evidence, blockers, carryover, and phase transition risk. and identify the current project stage.
2. Collect evidence for Milestone Goal, Evidence, Blocker.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Milestone Goal
- Evidence
- Blocker
- Transition Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Milestone Goal
- Evidence
- Blocker
- Transition Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
