---
name: cgs-ui-ux-review
description: Use for ui ux review tasks that review UI and UX implementation for clarity, accessibility, localization, controller support, and player comprehension; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the ui-ux-review objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-ui-ux-review/SKILL.md
source-hash: e24905e0e4f568351d7e4fd2698167a83acf2f6e681cbe15549d81527f2bec8b
user-invocable: true
---

# Codex Game Studio UI UX Review

Use this skill for ui ux review work in Template Game.

## Objective

Review UI and UX implementation for clarity, accessibility, localization, controller support, and player comprehension.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md
- .codex/workflows/ui-ux-review.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested review ui and ux implementation for clarity, accessibility, localization, controller support, and player comprehension. and identify the current project stage.
2. Collect evidence for Friction, Comprehension, Accessibility.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Friction
- Comprehension
- Accessibility
- UX Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Friction
- Comprehension
- Accessibility
- UX Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
