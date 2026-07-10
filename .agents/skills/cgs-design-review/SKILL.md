---
name: cgs-design-review
description: Use for design review tasks that review design artifacts against pillars, player experience, production scope, and downstream implementation risk; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the design-review objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/design-review/SKILL.md
source-hash: 3f9119c2ecc3f1b8a07484f0df9e3547bb006df349d9a73c97e8a95799aadfa9
user-invocable: true
---

# Codex Game Studio Design Review

Use this skill for design review work in Template Game.

## Objective

Review design artifacts against pillars, player experience, production scope, and downstream implementation risk.

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

1. Clarify the requested review design artifacts against pillars, player experience, production scope, and downstream implementation risk. and identify the current project stage.
2. Collect evidence for Pillar Fit, Scope Risk, Contradictions.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Pillar Fit
- Scope Risk
- Contradictions
- Review Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Pillar Fit
- Scope Risk
- Contradictions
- Review Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
