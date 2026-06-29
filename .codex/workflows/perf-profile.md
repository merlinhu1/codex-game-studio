---
model: gpt-5.4
model_reasoning_effort: medium
primary-agent: performance-analyst
linked-skills: [cgs-perf-profile, cgs-bugfix]
phase: review
risk: medium
argument-hint: Describe the perf-profile goal, target milestone/files, constraints, and required evidence.
source-reference: .codex/workflows/perf-profile.md
source-hash: e8b50d85075eea5dc75d5bd2f4a299591a615accbc074ab7307ab3d8a48e056b
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Perf Profile Workflow

## Purpose

Plan or review performance profiling across frame time, memory, loading, asset cost, bottlenecks, and measurement evidence.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/perf-profile.md

## Role

Performance Analyst (performance-analyst) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- performance profiling
- optimization triage

CLI aliases:
- perf-profile

## Outputs

- Performance report
- Optimization priorities
- Measurement plan

## Validation

- Budget and metric are named
- Measurement method is reproducible
- Risks and trade-offs are clear

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
