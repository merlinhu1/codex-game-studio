---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-30
source_of_truth:
  - ../../truthmark/areas/repository.md
---

# Codex Roles And Workflows

## Purpose

Codex roles and workflows provide the role-specific prompt contracts, context boundaries, templates, and render-only workflow shortcuts that make Open GameStudio a Codex-native game-development layer.

## Scope

This bounded leaf truth doc owns studio role IDs, role package metadata, Codex session prompt rendering, workflow registry entries, template registry behavior, and generated workflow prompt content. It does not own process execution, task persistence, package installation, or generated project initialization side effects.

This doc was created from the editable behavior-doc template at docs/templates/behavior-doc.md.

## Current Behavior

- The canonical studio role roster is defined by hyphenated Codex-native role IDs such as `producer`, `gameplay-programmer`, `qa-playtester`, and `studio-orchestrator`.
- Each role package contains a display name, system prompt, context strategy, expected outputs, handoff wording, and a review checklist.
- Codex session prompts render the role display name, role ID, phase, project root, objective, engine context, context files, expected outputs, verification command, review checklist, and completion-report instructions.
- The workflow registry defines vertical-slice, bugfix, playtest, market-analysis, analytics-setup, design-spec, game-feel-tuning, art-direction, ui-ux-review, production-milestone, handoff, review, and ship-check workflow prompts.
- Selected workflows include CLI aliases for render-only shortcuts, including market, analytics, design-spec, feel-review, art-direction, ui-review, milestone, and handoff.
- Template selection is task- and role-sensitive; template files are read from package assets and embedded into applicable workflow prompts and role-run prompts.
- Market analyst, data scientist, game-feel, UI/UX, QA, and release roles have bounded default templates; other additions come from role-specific keyword rules.
- Generated workflow files carry deterministic source-input and rendered-body hash metadata that covers workflow definition fields and the owning role display name, expected outputs, and review checklist used in the rendered workflow body.

## Core Rules

- Unknown role errors must point users toward Codex-native hyphenated role IDs rather than legacy agent names.
- Prompt rendering must include the role display name and project/session metadata needed by Codex to operate without hidden state.
- Templates that require Markdown sections must have non-empty required sections; the project config template must parse as JSON.
- Workflow shortcuts render prompts; they do not imply hidden parallel orchestration or future planner behavior.
- Workflow prompt rendering may append only selected workflow templates and must not load every template.

## Flows And States

- Workflow prompt flow: read project engine from `.codex/studio.json`, look up the workflow registry entry, create a Codex studio session for the owning role and phase, render the standard prompt, then append any workflow template bodies.
- Template selection flow: match role and task text against bounded keyword rules and return only matching template IDs.

## Contracts

- Role IDs are stable strings exported from `src/roles.ts` and reused by config validation, project state, prompt generation, workflow routing, and task creation.
- Workflow IDs map to `.codex/workflows/<workflow>.md` files and expected context-file lists.
- Template IDs map to package template paths, role applicability, tags, and required-section validation. Current reusable templates include GDD, feature spec, handoff, analytics setup, engine setup, market analysis, project config, game-feel tuning, art direction, UI/UX review, production milestone, playtest report, and ship check.

## Product Decisions

- Decision (2026-05-28): Use Codex-native hyphenated role IDs as the canonical user- and project-facing role contract.
- Decision (2026-05-28): Keep workflow shortcuts render-only for this pass; future planner, next, telemetry, ownership enforcement, and parallel orchestration surfaces remain hidden.

## Rationale

Role and workflow prompt generation is the user-facing contract that turns a generic Codex CLI into a specialized game-studio workflow. Keeping it render-only and declarative avoids overclaiming automation that is not implemented while still making the workflow packages inspectable and testable.

## Non-Goals

- This doc does not own whether Codex is installed or authenticated.
- This doc does not own task lifecycle mutations or verification command execution.

## Maintenance Notes

- Update this doc with changes to `src/roles.ts`, `src/codex-session.ts`, `src/codex-prompts.ts`, `src/workflows.ts`, `src/templates.ts`, or `templates/**`.
- Relevant verification includes role, Codex prompt/session, workflow, template, and functionality-gap tests.
