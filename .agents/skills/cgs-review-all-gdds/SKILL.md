---
name: cgs-review-all-gdds
description: Use for review all gdds tasks that cross-check all GDDs for consistency, missing systems, dependency conflicts, and production readiness; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the review-all-gdds objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/review-all-gdds/SKILL.md
source-hash: 016dce629603f89c923cf6ca5b7f4cae4d4e5920c04ced00b7d3bb206a531a2d
user-invocable: true
---

# Codex Game Studio Review All GDDs

Use this skill for review all gdds work in Template Game.

## Objective

Cross-check all GDDs for consistency, missing systems, dependency conflicts, and production readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested cross-check all gdds for consistency, missing systems, dependency conflicts, and production readiness. and identify the current project stage.
2. Collect evidence for GDD Coverage, Contradictions, Missing Systems.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- GDD Coverage
- Contradictions
- Missing Systems
- Readiness Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- GDD Coverage
- Contradictions
- Missing Systems
- Readiness Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
