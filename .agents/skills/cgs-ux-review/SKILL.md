---
name: cgs-ux-review
description: Use for ux review tasks that review UX flows for clarity, friction, accessibility, localization, controller support, and player comprehension; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the ux-review objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/ux-review/SKILL.md
source-hash: 1dd5a719efd1ad5c2d831c046f9e257e9c7cff067cc9d1a99e67181e1b0f4bc0
user-invocable: true
---

# Codex Game Studio UX Review

Use this skill for ux review work in Template Game.

## Objective

Review UX flows for clarity, friction, accessibility, localization, controller support, and player comprehension.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Procedure

1. Clarify the requested review ux flows for clarity, friction, accessibility, localization, controller support, and player comprehension. and identify the current project stage.
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

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
