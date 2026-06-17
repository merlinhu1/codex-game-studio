# Engine Reference Depth Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Deepen packaged engine references for Godot, Unity, and Unreal with module-level and plugin-level files that can be selected by relevance without bloating every prompt.

**Architecture:** This plan is refined by OpenSpec change `catch-up-engine-reference-depth`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio ships 12 compact engine-reference files while CCGS ships roughly 46 files with modules, plugins, deprecated APIs, breaking changes, and best-practice guidance for Godot, Unity, and Unreal.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-engine-reference-depth/`
- Proposal: `openspec/changes/catch-up-engine-reference-depth/proposal.md`
- Design: `openspec/changes/catch-up-engine-reference-depth/design.md`
- Requirements: `openspec/changes/catch-up-engine-reference-depth/specs/codex-studio-engine-reference-depth/spec.md`
- Tasks: `openspec/changes/catch-up-engine-reference-depth/tasks.md`

## Product Boundary Check

- Mission improvement: Deepen packaged engine references for Godot, Unity, and Unreal with module-level and plugin-level files that can be selected by relevance without bloating every prompt.
- In-scope surfaces: `engine_reference/`, `src/engine-reference.ts`, `src/engines.ts`, `src/prompt-context.ts`, `src/validation.ts`, `tests/engine-system.test.ts`, `tests/codex-context-files.test.ts`, `docs/truthmark/engineering/codex/runtime-and-tasks.md`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Add per-engine `current-best-practices.md`, `deprecated-apis.md`, `breaking-changes.md`, and module files for animation, audio, input, navigation, networking, physics, rendering, UI.
- [ ] Add plugin references for Unity Addressables/Cinemachine/DOTS and Unreal GAS/Common UI/PCG where in-scope.
- [ ] Add reference metadata: engine, version reviewed, source/review date, tags, applicable roles/workflows.
- [ ] Update context selection so engine-specialist prompts select only relevant module/plugin references.
- [ ] Validate package shipping and temp-cwd installed-bin access.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-engine-reference-depth --strict --json
openspec status --change catch-up-engine-reference-depth --json
git diff --check -- research/2026-06-17-catch-up-engine-reference-depth-plan.md openspec/changes/catch-up-engine-reference-depth
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
