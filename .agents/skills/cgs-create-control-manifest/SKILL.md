---
name: cgs-create-control-manifest
description: Use for create control manifest tasks that define implementation rules, boundaries, allowed dependencies, validation commands, and review gates; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: luna
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the create-control-manifest objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/create-control-manifest/SKILL.md
source-hash: 2dd8d29c013944aed8cd05fcfbe21dc77ef8ff9c98f5155f46cee29ab3284348
user-invocable: true
---

# Codex Game Studio Create Control Manifest

Use this skill for create control manifest work in Template Game.

## Objective

Define implementation rules, boundaries, allowed dependencies, validation commands, and review gates.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested define implementation rules, boundaries, allowed dependencies, validation commands, and review gates. and identify the current project stage.
2. Collect evidence for Layer Rules, Allowed Dependency, Validation Command.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Layer Rules
- Allowed Dependency
- Validation Command
- Review Gate
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Layer Rules
- Allowed Dependency
- Validation Command
- Review Gate
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
