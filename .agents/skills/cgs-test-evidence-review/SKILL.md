---
name: cgs-test-evidence-review
description: Use for test evidence review tasks that review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the test-evidence-review objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/test-evidence-review/SKILL.md
source-hash: 04cdf0b7e94ab2dab58850bf1a70a2a6f33810ea7abb6102eaec8f2d00b9026e
user-invocable: true
---

# Codex Game Studio Test Evidence Review

Use this skill for test evidence review work in Template Game.

## Objective

Review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps.

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

1. Clarify the requested review validation output, logs, screenshots, recordings, and manual checks for sufficiency and gaps. and identify the current project stage.
2. Collect evidence for Evidence, Gap, Confidence.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Evidence
- Gap
- Confidence
- Follow-up
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Evidence
- Gap
- Confidence
- Follow-up
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
