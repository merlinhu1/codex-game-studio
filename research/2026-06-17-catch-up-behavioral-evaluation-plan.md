# Behavioral Evaluation Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a lightweight, local, deterministic behavioral evaluation framework for OGS roles/workflows/templates that catches weak prompt contracts without requiring hosted evaluators or telemetry.

**Architecture:** This plan is refined by OpenSpec change `catch-up-behavioral-evaluation`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio validates CLI and generated-surface mechanics, but CCGS includes a skill/agent testing framework and rubrics that evaluate workflow and prompt behavior more directly.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-behavioral-evaluation/`
- Proposal: `openspec/changes/catch-up-behavioral-evaluation/proposal.md`
- Design: `openspec/changes/catch-up-behavioral-evaluation/design.md`
- Requirements: `openspec/changes/catch-up-behavioral-evaluation/specs/codex-studio-behavioral-evaluation/spec.md`
- Tasks: `openspec/changes/catch-up-behavioral-evaluation/tasks.md`

## Product Boundary Check

- Mission improvement: Add a lightweight, local, deterministic behavioral evaluation framework for OGS roles/workflows/templates that catches weak prompt contracts without requiring hosted evaluators or telemetry.
- In-scope surfaces: `tests/`, `src/validation.ts`, `src/codex-prompts.ts`, `src/workflows.ts`, `docs/system-verification.md`, `docs/workflow-validation.md`, `package.json`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Define an evaluation fixture format for role/workflow scenarios with expected prompt obligations and forbidden drift.
- [ ] Add static behavior checks for required sections, relevant templates, selected context, forbidden future-only surfaces, and output contract coverage.
- [ ] Add representative scenarios for core workflows and new catch-up roles.
- [ ] Expose evaluation through npm scripts or validation subchecks only if it stays local and deterministic.
- [ ] Document how to add a scenario when a role/workflow is added.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-behavioral-evaluation --strict --json
openspec status --change catch-up-behavioral-evaluation --json
git diff --check -- research/2026-06-17-catch-up-behavioral-evaluation-plan.md openspec/changes/catch-up-behavioral-evaluation
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
