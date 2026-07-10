---
name: cgs-art-bible
description: Use for art bible tasks that define visual identity, shape language, palette, camera, animation, UI style, and asset constraints; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the art-bible objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/art-bible/SKILL.md
source-hash: 19daa484f6f6621221818e224c899ebc02c978a919a247c367f676d515e64cad
user-invocable: true
---

# Codex Game Studio Art Bible

Use this skill for art bible work in Template Game.

## Objective

Define visual identity, shape language, palette, camera, animation, UI style, and asset constraints.

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

1. Clarify the requested define visual identity, shape language, palette, camera, animation, ui style, and asset constraints. and identify the current project stage.
2. Collect evidence for Visual Identity, Shape Language, Palette.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Visual Identity
- Shape Language
- Palette
- Asset Constraints
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Visual Identity
- Shape Language
- Palette
- Asset Constraints
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
