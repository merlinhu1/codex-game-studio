---
name: cgs-bug-triage
description: Use for bug triage tasks that classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the bug-triage objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/bug-triage/SKILL.md
source-hash: cdafaffc22abe4f6ee9dc7d93b34222547dd3281c25e60de80d1876517a395d2
user-invocable: true
---

# Codex Game Studio Bug Triage

Use this skill for bug triage work in Template Game.

## Objective

Classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact.

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

1. Clarify the requested classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact. and identify the current project stage.
2. Collect evidence for Severity, Priority, Owner.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Severity
- Priority
- Owner
- Release Impact
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Severity
- Priority
- Owner
- Release Impact
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
