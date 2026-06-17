# Domain Role Coverage Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Expand Open Game Studio role coverage across game-development specialties while preserving bounded Codex prompts and the AGENTS.md/.codex generated-surface contract.

**Architecture:** This plan is refined by OpenSpec change `catch-up-domain-role-coverage`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

Open Game Studio has 20 roles while CCGS has 49 agents. The missing value is not raw count; it is specialist coverage for production domains that a game developer reasonably expects.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-domain-role-coverage/`
- Proposal: `openspec/changes/catch-up-domain-role-coverage/proposal.md`
- Design: `openspec/changes/catch-up-domain-role-coverage/design.md`
- Requirements: `openspec/changes/catch-up-domain-role-coverage/specs/codex-studio-domain-role-coverage/spec.md`
- Tasks: `openspec/changes/catch-up-domain-role-coverage/tasks.md`

## Product Boundary Check

- Mission improvement: Expand Open Game Studio role coverage across game-development specialties while preserving bounded Codex prompts and the AGENTS.md/.codex generated-surface contract.
- In-scope surfaces: `src/roles.ts`, `src/codex-prompts.ts`, `src/projects.ts`, `src/validation.ts`, `tests/roles.test.ts`, `tests/codex-prompts.test.ts`, `tests/functionality-gap-pass.test.ts`, `docs/truthmark/engineering/codex/roles-and-workflows.md`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Add domain clusters for audio, level/world/content, systems/economy, live ops/community/localization/accessibility, security/devops/performance/network/AI/UI programming.
- [ ] Add only roles with clear game-studio outputs and selected context strategies; do not add a role just to mirror a CCGS name.
- [ ] Update role package rendering and generated project prompt materialization for every new role.
- [ ] Add validation coverage that all role packages render and no single role run loads all roles.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-domain-role-coverage --strict --json
openspec status --change catch-up-domain-role-coverage --json
git diff --check -- research/2026-06-17-catch-up-domain-role-coverage-plan.md openspec/changes/catch-up-domain-role-coverage
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
