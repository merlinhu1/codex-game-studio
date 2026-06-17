# Production Template Depth Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a richer built-in template pack for game production artifacts while keeping templates package-shipped, listed, selected by workflow relevance, and validated through npm pack smoke tests.

**Architecture:** This plan is refined by OpenSpec change `catch-up-production-templates`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio has 13 templates while CCGS has roughly 40 production templates spanning design, architecture, QA, release, UX, audio, art, risk, and postmortem artifacts.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-production-templates/`
- Proposal: `openspec/changes/catch-up-production-templates/proposal.md`
- Design: `openspec/changes/catch-up-production-templates/design.md`
- Requirements: `openspec/changes/catch-up-production-templates/specs/codex-studio-production-template-pack/spec.md`
- Tasks: `openspec/changes/catch-up-production-templates/tasks.md`

## Product Boundary Check

- Mission improvement: Add a richer built-in template pack for game production artifacts while keeping templates package-shipped, listed, selected by workflow relevance, and validated through npm pack smoke tests.
- In-scope surfaces: `templates/`, `src/templates.ts`, `src/prompt-context.ts`, `src/validation.ts`, `tests/agents-templates.test.ts`, `tests/functionality-gap-pass.test.ts`, `tests/validation.test.ts`, `package.json`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Add production templates for ADR, technical design, architecture traceability, art bible, sound bible, UX spec, accessibility requirements, test plan, test evidence, sprint plan, vertical-slice report, release notes, postmortem, risk register, economy model, difficulty curve, player journey, pitch document.
- [ ] Represent each template in the template registry with category, path, short description, and relevant workflow/role hints.
- [ ] Update package files and pack/install smoke checks so installed CLI can load the new templates from a temp cwd.
- [ ] Add relevance-selection tests that a workflow includes only its mapped templates, not the whole pack.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-production-templates --strict --json
openspec status --change catch-up-production-templates --json
git diff --check -- research/2026-06-17-catch-up-production-templates-plan.md openspec/changes/catch-up-production-templates
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
