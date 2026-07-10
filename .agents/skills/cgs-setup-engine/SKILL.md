---
name: cgs-setup-engine
description: Use for setup engine tasks that pin engine version, verify project markers, document conventions, and run engine smoke checks; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: medium
argument-hint: Describe the setup-engine objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/setup-engine/SKILL.md
source-hash: 7f4bc9868ca4d78ca969174c56b8c719215d68c6f32f0df5be5194e8eb2e2eea
user-invocable: true
---

# Codex Game Studio Setup Engine

Use this skill for setup engine work in Template Game.

## Objective

Pin engine version, verify project markers, document conventions, and run engine smoke checks.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested pin engine version, verify project markers, document conventions, and run engine smoke checks. and identify the current project stage.
2. Collect evidence for Engine Version, Project Markers, Naming Conventions.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Engine Version
- Project Markers
- Naming Conventions
- Smoke Check
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Engine Version
- Project Markers
- Naming Conventions
- Smoke Check
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
