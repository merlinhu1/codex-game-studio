---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: technical-director
linked-skills: [cgs-code-review, cgs-tech-debt]
phase: review
risk: high
argument-hint: Provide a code review request with changed files or diff summary, design intent, test evidence, risk constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/code-review.md
source-hash: 1111111111111111111111111111111111111111111111111111111111111111
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Code Review Workflow

## Purpose

Review code changes for correctness, architecture fit, engine conventions, testing evidence, risk, and release readiness.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/code-review.md
- Changed files, diff, design intent, and verification output

## Role

Technical Director (technical-director) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- code review
- implementation quality gate
CLI aliases:
- code-review

## Outputs

- Blocking, important, and minor findings.
- Evidence-backed approval or requested changes.
- Architecture, engine, test, and release-risk notes.

## Validation

- Findings cite concrete files, behavior, or missing evidence.
- Review distinguishes correctness from style preference.
- Required follow-up owners and verification commands are named.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
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

## Documentation Impact

- After functional source, engine, or asset changes, update the owning game document or record a fresh `## Documentation Impact` decision in `production/session-state/active.md`.
- Run `./codex-game-studio docs-impact --base <review-base>` before handoff.
- A `no-update` decision must state why no player, architecture, production, or release document changed.
