# Workflow And Skill Catalog Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Expand workflow coverage into a curated Codex-native catalog of game-development actions without importing CCGS slash-command ceremony or turning OGS into a general task manager.

**Architecture:** This plan is refined by OpenSpec change `catch-up-workflow-skill-catalog`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio has 13 workflow shortcuts while CCGS exposes 73 skills across onboarding, design, QA, testing, release, sprint, team, localization, hotfix, and review workflows.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-workflow-skill-catalog/`
- Proposal: `openspec/changes/catch-up-workflow-skill-catalog/proposal.md`
- Design: `openspec/changes/catch-up-workflow-skill-catalog/design.md`
- Requirements: `openspec/changes/catch-up-workflow-skill-catalog/specs/codex-studio-workflow-catalog/spec.md`
- Tasks: `openspec/changes/catch-up-workflow-skill-catalog/tasks.md`

## Product Boundary Check

- Mission improvement: Expand workflow coverage into a curated Codex-native catalog of game-development actions without importing CCGS slash-command ceremony or turning OGS into a general task manager.
- In-scope surfaces: `src/workflows.ts`, `src/cli.ts`, `src/templates.ts`, `src/projects.ts`, `src/validation.ts`, `tests/functionality-gap-pass.test.ts`, `tests/cli-prompt-surface.test.ts`, `tests/project-workflow.test.ts`, `templates/`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Create a workflow taxonomy: onboarding/discovery, design/architecture, implementation planning, QA/testing, release/hotfix, localization/accessibility, and team coordination.
- [ ] Add high-value workflow prompt shortcuts before low-value aliases: start/onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, localization-plan.
- [ ] Keep workflow output prompt-only unless an existing CLI surface already owns state changes.
- [ ] Add tests for command help, workflow rendering, aliases, and project materialization.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-workflow-skill-catalog --strict --json
openspec status --change catch-up-workflow-skill-catalog --json
git diff --check -- research/2026-06-17-catch-up-workflow-skill-catalog-plan.md openspec/changes/catch-up-workflow-skill-catalog
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
