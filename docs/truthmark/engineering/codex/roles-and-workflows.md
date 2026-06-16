---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
source_of_truth:
  - ../../routes/areas/repository.md
---

# Codex Roles And Workflows

## Purpose

Codex roles and workflows provide the role-specific prompt contracts, context boundaries, templates, and render-only workflow shortcuts that make Open Game Studio a Codex-native game-development layer.

## Scope

This bounded leaf truth doc owns studio role IDs, role package metadata, Codex session prompt rendering, workflow registry entries, template registry behavior, selected engine reference prompt entries, and generated workflow prompt content. It does not own process execution, task persistence, package installation, or generated project initialization side effects.

This doc was created from the editable engineering-behavior template at docs/truthmark/templates/engineering-behavior.md.

## Current Implementation Behavior

- The canonical studio role roster is defined by hyphenated Codex-native role IDs such as `producer`, `gameplay-programmer`, `qa-playtester`, and `studio-orchestrator`.
- The canonical studio role roster includes compact engine specialist prompt roles `godot-specialist`, `unity-specialist`, and `unreal-specialist`; generated projects add only the active engine specialist to their project-scoped role roster and active-role list.
- Each role package contains a display name, system prompt, context strategy, expected outputs, handoff wording, and a review checklist.
- Generated project role prompts include selected active-engine reference paths and reasons. Relevant programming and technical art roles receive active-engine version/gameplay references, engine/tools roles receive active-engine plugin references, engine specialists receive the matching active-engine specialist reference, and unrelated engine references are excluded by default.
- Codex session prompts render the role display name, role ID, phase, project root, objective, engine context, sandbox, active write policy when provided, file-edit permission, context files, expected outputs, verification command, review checklist, and completion-report instructions.
- When a caller supplies a context contract, the standard prompt renderer includes a `# Context Contract` section with selected context, context omissions/blockers, project stage, studio mode, phase, write policy, sandbox, and file-edit permission.
- Workflow prompt rendering computes the same phase and studio-mode eligibility fields used by role runs so the context contract's write policy, sandbox, and file-edit permission remain consistent; render-only plan/review/ship workflows stay read-only, while eligible implement workflows render with matching write permissions.
- The workflow registry defines vertical-slice, bugfix, playtest, market-analysis, analytics-setup, design-spec, game-feel-tuning, art-direction, ui-ux-review, production-milestone, handoff, review, and ship-check workflow prompts.
- Selected workflows include CLI aliases for render-only shortcuts, including market, analytics, design-spec, feel-review, art-direction, ui-review, milestone, and handoff.
- Template selection is task- and role-sensitive; template files are read from package assets and embedded into applicable workflow prompts and role-run prompts.
- Market analyst, data scientist, game-feel, UI/UX, QA, and release roles have bounded default templates; other additions come from role-specific keyword rules.
- Generated workflow files carry deterministic source-input and rendered-body hash metadata that covers workflow definition fields and the owning role display name, expected outputs, and review checklist used in the rendered workflow body.

## Core Rules

- Unknown role errors must point users toward Codex-native hyphenated role IDs rather than legacy agent names.
- Prompt rendering must include the role display name and project/session metadata, including explicit sandbox and write-policy context when available, needed by Codex to operate without hidden state.
- Templates that require Markdown sections must have non-empty required sections; the project config template must parse as JSON.
- Workflow shortcuts render prompts; they do not imply hidden parallel orchestration or future planner behavior.
- Workflow prompt rendering may append only selected workflow templates and must not load every template.
- Role prompt rendering may list only selected active-engine reference paths and must not load every engine reference pack by default.
- Generated project prompt materialization may include only the specialist prompt matching the active project engine.

## Flows And States

- Workflow prompt flow: read project stage, studio mode, and engine from `.codex/studio.json`, select the workflow's declared context files through the path-safe selector, compute phase/studio-mode eligibility, create a Codex studio session for the owning role and phase, render the standard prompt with a context contract, then append any workflow template bodies.
- Template selection flow: match role and task text against bounded keyword rules and return only matching template IDs.

## Contracts

- Role IDs are stable strings exported from `src/roles.ts` and reused by config validation, project state, prompt generation, workflow routing, and task creation.
- Engine reference prompt selection maps role IDs and the active project engine to generated project paths under `docs/engine-reference/<engine>/`.
- Workflow IDs map to `.codex/workflows/<workflow>.md` files and expected context-file lists.
- Template IDs map to package template paths, role applicability, tags, and required-section validation. Current reusable templates include GDD, feature spec, handoff, analytics setup, engine setup, market analysis, project config, game-feel tuning, art direction, UI/UX review, production milestone, playtest report, and ship check.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Use Codex-native hyphenated role IDs as the canonical user- and project-facing role contract.
- Decision (2026-05-28): Keep workflow shortcuts render-only for this pass; future planner, next, telemetry, ownership enforcement, and parallel orchestration surfaces remain hidden.
- Decision (2026-06-13): Workflow prompts use the same context-contract renderer as role-run prompts and include only selected workflow context instead of broad prompt material.
- Decision (2026-06-14): Add only one specialist role ID per supported engine and keep engine reference prompt selection active-engine scoped.
- Decision (2026-06-14): Keep engine specialist IDs canonical while scoping generated project specialist prompts and active specialist eligibility to the active engine.

## Rationale

Role and workflow prompt generation is the user-facing contract that turns a generic Codex CLI into a specialized game-studio workflow. Keeping it render-only and declarative avoids overclaiming automation that is not implemented while still making the workflow packages inspectable and testable.

## Non-Goals

- This doc does not own whether Codex is installed or authenticated.
- This doc does not own task lifecycle mutations or verification command execution.

## Maintenance Notes

- Update this doc with changes to `src/roles.ts`, `src/codex-session.ts`, `src/codex-prompts.ts`, `src/workflows.ts`, `src/engine-reference.ts`, `src/templates.ts`, or `templates/**`.
- Relevant verification includes role, Codex prompt/session, workflow, template, and functionality-gap tests.

## Source References

- ../../routes/areas/repository.md
