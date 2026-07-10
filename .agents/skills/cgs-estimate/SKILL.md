---
name: cgs-estimate
description: Use for estimate tasks that estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the estimate objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/estimate/SKILL.md
source-hash: 7774e2d256a054a215cf62cc81d4d79f4d18e2154203671a39f643c0881be5fd
user-invocable: true
---

# Codex Game Studio Estimate

Use this skill for estimate work in Template Game.

## Objective

Estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges.

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

1. Clarify the requested estimate scope using uncertainty, dependencies, discipline handoffs, risk buffers, and confidence ranges. and identify the current project stage.
2. Collect evidence for Estimate Range, Confidence, Dependency.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Estimate Range
- Confidence
- Dependency
- Buffer
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Estimate Range
- Confidence
- Dependency
- Buffer
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
