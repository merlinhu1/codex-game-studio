---
name: cgs-standards-ui
description: Use for standards ui tasks that hUD, menus, accessibility, localization, controller navigation, and input states; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the standards-ui objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-ui/SKILL.md
source-hash: 91b9c2b8188530e5ec0e93672001936e5fc132cf902b29d1224829f04c0998c9
user-invocable: true
---

# Codex Game Studio UI Standards

Use this skill for ui standards work in Template Game.

## Objective

HUD, menus, accessibility, localization, controller navigation, and input states

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, or assets

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Read the requested files and identify the ui standards rule being applied.
2. Check HUD, menus, accessibility, localization, controller navigation, and input states.
3. Report violations with file paths, impact, and the smallest safe fix.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Navigation
- Localization
- Accessibility
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
