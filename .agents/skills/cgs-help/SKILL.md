---
name: cgs-help
description: Use for help tasks that summarize available CGS workflows, next phase options, required artifacts, and safe commands; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: luna
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the help objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/help/SKILL.md
source-hash: 9519e9b275a58b3d45391f1fc47e6f8ac1a469e468959cccf6f37bd13e71ee04
user-invocable: true
---

# Codex Game Studio Help

Use this skill for help work in Template Game.

## Objective

Summarize available CGS workflows, next phase options, required artifacts, and safe commands.

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

1. Clarify the requested summarize available cgs workflows, next phase options, required artifacts, and safe commands. and identify the current project stage.
2. Collect evidence for Available Workflows, Next Step, Required Artifact.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Available Workflows
- Next Step
- Required Artifact
- Command Help
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Available Workflows
- Next Step
- Required Artifact
- Command Help
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
