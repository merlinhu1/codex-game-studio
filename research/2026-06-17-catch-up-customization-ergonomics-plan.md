# Customization Ergonomics Catch-Up Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add project-local customization packs for roles, workflows, templates, and studio policy that are schema-validated, visible in the repo, and safely merged with built-ins without becoming a general plugin/orchestrator platform.

**Architecture:** This plan is refined by OpenSpec change `catch-up-customization-ergonomics`. The markdown file is the human-facing research index; the canonical refined implementation contract lives in the OpenSpec proposal, design, requirements, and tasks listed below.

**Tech Stack:** TypeScript, NodeNext, npm package assets, Vitest, OpenSpec, Truthmark repository-truth validation.

---

## Gap Summary

CCGS users can edit `.claude/agents`, `.claude/skills`, `.claude/rules`, and hooks directly. OGS is cleaner as a package but less no-code/custom-pack friendly because built-ins live primarily in TypeScript registries.

Current comparison baseline:
- Open Game Studio: 20 roles, 13 workflow prompt shortcuts, 13 templates, 12 engine-reference files, TypeScript CLI/package, Codex-native run path, validation gate.
- Claude Code Game Studios: 49 agents, 73 skills, 40 templates, 46 engine-reference files, richer authored specialist prompts and skill/testing framework.
- Explicitly ignored/deferred for Open Game Studio: telemetry, planner/next, parallel orchestration, hard output-ownership enforcement, hosted service/daemon/background controller, hidden memory/checkpoints, non-Codex runtime replacements, mandatory heavyweight lifecycle.


## OpenSpec Refinement

- Change: `openspec/changes/catch-up-customization-ergonomics/`
- Proposal: `openspec/changes/catch-up-customization-ergonomics/proposal.md`
- Design: `openspec/changes/catch-up-customization-ergonomics/design.md`
- Requirements: `openspec/changes/catch-up-customization-ergonomics/specs/codex-studio-customization-ergonomics/spec.md`
- Tasks: `openspec/changes/catch-up-customization-ergonomics/tasks.md`

## Product Boundary Check

- Mission improvement: Add project-local customization packs for roles, workflows, templates, and studio policy that are schema-validated, visible in the repo, and safely merged with built-ins without becoming a general plugin/orchestrator platform.
- In-scope surfaces: `src/config.ts`, `src/roles.ts`, `src/workflows.ts`, `src/templates.ts`, `src/validation.ts`, `src/projects.ts`, `tests/validation.test.ts`, `tests/project-workflow.test.ts`, `docs/setup.md`, `docs/examples.md`
- Lightweight mode preserved: yes; additions are opt-in/discoverable and selected by relevance.
- Codex-native preserved: yes; no `.claude/**` clone, no hosted runtime, no daemon.
- Reviewable local outputs: OpenSpec artifacts, source diffs, generated project files, package assets, validation output.
- Explicitly excluded from this plan: telemetry, planner/next, parallel orchestration, hard ownership enforcement, hidden memory/checkpoints, non-Codex runtime replacement, mandatory heavyweight lifecycle.

## Bite-Sized Implementation Tasks

- [ ] Design `opengamestudio.config.json` or `.codex/studio/config.json` extension points for project-local role/workflow/template packs.
- [ ] Define schema rules for custom role ids, workflow ids, template metadata, path containment, override/extend behavior, and conflict diagnostics.
- [ ] Update init/validate/status/templates list/run prompt paths to load validated local packs.
- [ ] Add tests for valid custom packs, duplicate ids, unsafe paths, missing template files, and built-in override policy.
- [ ] Document examples that edit local pack files instead of editing package source.
- [ ] Add focused failing tests before each implementation slice.
- [ ] Implement the smallest code/asset changes to pass each focused test.
- [ ] Update validation and package smoke coverage for every new generated or packaged surface.
- [ ] Update routed Truthmark docs only for behavior that actually ships.
- [ ] Run `git diff --check`, focused tests, `npm run validate`, and applicable Truthmark gates.

## Verification Commands

```bash
openspec validate catch-up-customization-ergonomics --strict --json
openspec status --change catch-up-customization-ergonomics --json
git diff --check -- research/2026-06-17-catch-up-customization-ergonomics-plan.md openspec/changes/catch-up-customization-ergonomics
npm run validate
```

## Notes For Implementers

Do not treat CCGS parity as file-for-file cloning. Translate useful CCGS coverage into Open Game Studio's local, Codex-native, package-friendly boundary. Keep prompt depth selected and bounded.
