---
name: cgs-team-level
description: Use for team level tasks that coordinate level design, blockout, art, scripting, lighting, optimization, and playtest handoffs; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the team-level objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-level/SKILL.md
source-hash: 2035d20d9393f6e703e04074ded2145688a8e2e4a2191f5a75866a4fb97100bd
user-invocable: true
---

# Codex Game Studio Team Level

Use this skill for team level work in Template Game.

## Objective

Coordinate level design, blockout, art, scripting, lighting, optimization, and playtest handoffs.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/timeline.md
- task-relevant team files

## Procedure

1. Clarify the requested coordinate level design, blockout, art, scripting, lighting, optimization, and playtest handoffs. and identify the current project stage.
2. Collect evidence for Level Goal, Blockout, Art Pass.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Level Goal
- Blockout
- Art Pass
- Playtest
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Level Goal
- Blockout
- Art Pass
- Playtest
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
