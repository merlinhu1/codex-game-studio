---
name: cgs-ux-design
description: Use for ux design tasks that design user journeys, menus, HUD, onboarding, input states, accessibility, and localization-ready UX copy; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the ux-design objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/ux-design/SKILL.md
source-hash: 2d37d14b653594c0c7aa346ff8d7cc129269cda8f42fe741f6d296d6345f9845
user-invocable: true
---

# Codex Game Studio UX Design

Use this skill for ux design work in Template Game.

## Objective

Design user journeys, menus, HUD, onboarding, input states, accessibility, and localization-ready UX copy.

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

1. Clarify the requested design user journeys, menus, hud, onboarding, input states, accessibility, and localization-ready ux copy. and identify the current project stage.
2. Collect evidence for Player Journey, HUD State, Input Path.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Player Journey
- HUD State
- Input Path
- Accessibility
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Player Journey
- HUD State
- Input Path
- Accessibility
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
