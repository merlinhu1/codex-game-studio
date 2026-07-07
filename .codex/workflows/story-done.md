---
model: gpt-5.4
model_reasoning_effort: medium
primary-agent: qa-playtester
linked-skills: [cgs-story-done, cgs-bugfix]
phase: review
risk: medium
argument-hint: Provide a story done request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/story-done.md
source-hash: 97ca471f7ddb731db208cd9f4b9ddab320ceab5bc6fbfeccf4c933892e99a8ab
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Story Done Workflow

## Purpose

Review whether a story is done by checking acceptance criteria, changed artifacts, verification evidence, risks, and follow-up ownership.

## Compact Context First

- `npm run ctx:workflow -- story-done`
- `npm run ctx:role -- qa-playtester`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/story-done.md

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- definition of done
- completion review

CLI aliases:
- story-done

## Outputs

- Issue list
- Repro steps
- Severity notes

## Validation

- Repro steps are actionable
- Evidence is attached or described
- Blocking issues are separated from polish

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Load AGENTS.md, .codex/studio.json, this workflow, the primary agent, linked skills, and only task-relevant project files.
- Avoid broad context unless the user explicitly approves it.

## Output Contract

- Decision or change summary.
- Step-by-step work performed or planned.
- Evidence, blockers, warnings, and next owner.

## Stop Conditions

- Required project state, approval, target files, or verification path is missing.
- The task crosses into another role without an explicit handoff.
- The workflow would require generated prompt mirrors or hidden automation.

## Handoff

Report changed files, validation evidence, residual risks, and the next owner only when ownership changes.
