# Role Prompt Sophistication Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Upgrade built-in role packages from compact prompts into richer structured role contracts while preventing prompt bloat and preserving Codex-native single-role execution.

**Architecture:** This plan is refined by OpenSpec change `catch-up-role-prompt-depth`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio roles are compact and maintainable, but CCGS agents include richer responsibilities, collaboration protocol, delegation guidance, output formats, domain standards, and quality gates.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-role-prompt-depth/`
- Proposal: `openspec/changes/catch-up-role-prompt-depth/proposal.md`
- Design: `openspec/changes/catch-up-role-prompt-depth/design.md`
- Requirements: `openspec/changes/catch-up-role-prompt-depth/specs/codex-studio-role-prompt-depth/spec.md`
- Tasks: `openspec/changes/catch-up-role-prompt-depth/tasks.md`

## Product Boundary Check

- Mission improvement: Upgrade built-in role packages from compact prompts into richer structured role contracts while preventing prompt bloat and preserving Codex-native single-role execution.
- In-scope surfaces: `src/roles.ts`, `src/codex-prompts.ts`, `src/agents.ts`, `src/generated-surfaces.ts`, `tests/codex-prompts.test.ts`, `tests/roles.test.ts`, `tests/agents-templates.test.ts`, `docs/truthmark/engineering/codex/roles-and-workflows.md`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Extend the role package model with optional structured sections: responsibilities, inputs to inspect, outputs, quality gates, collaboration notes, stop conditions, and handoff format.
- [ ] Move repeated guidance into shared compact fragments rendered only when relevant.
- [ ] Add role-specific output schemas/checklists for high-value roles before expanding every role.
- [ ] Add tests that rendered role prompts include required sections and remain under explicit size/breadth limits.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-role-prompt-depth --strict --json
openspec status --change catch-up-role-prompt-depth --json
git diff --check -- research/2026-06-17-catch-up-role-prompt-depth-plan.md openspec/changes/catch-up-role-prompt-depth
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
