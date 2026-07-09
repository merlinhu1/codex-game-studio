---
name: cgs-architecture-review
description: Use for architecture review tasks that review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: sol
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the architecture-review objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/architecture-review/SKILL.md
source-hash: 11fd3ee30b6c66a2745d1fdaaca3c61c440d4a1181f3667785414351a6e06311
user-invocable: true
---

# Codex Game Studio Architecture Review

Use this skill for architecture review work in Template Game.

## Objective

Review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md
- .codex/workflows/architecture-review.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested review architecture for layer violations, scalability risks, engine misuse, testing seams, and production readiness. and identify the current project stage.
2. Collect evidence for Layer Violation, Scalability Risk, Testing Seam.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Layer Violation
- Scalability Risk
- Testing Seam
- Architecture Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Layer Violation
- Scalability Risk
- Testing Seam
- Architecture Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
