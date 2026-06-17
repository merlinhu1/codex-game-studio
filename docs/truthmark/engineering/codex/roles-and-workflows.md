---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-06-17
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

- The canonical studio role roster is defined by hyphenated Codex-native role IDs such as `producer`, `gameplay-programmer`, `network-programmer`, `audio-director`, `accessibility-specialist`, `qa-playtester`, and `studio-orchestrator`.
- The canonical studio role roster covers bounded specialist clusters for audio, level/world/content, systems/economy, live ops/community/localization/accessibility, and security/devops/performance/network/AI/UI programming.
- The canonical studio role roster includes compact engine specialist prompt roles `godot-specialist`, `unity-specialist`, and `unreal-specialist`; generated projects add only the active engine specialist to their project-scoped role roster and active-role list.
- Each role package contains a display name, system prompt, context strategy, structured responsibilities, expected inputs, expected outputs, optional output schema, quality gates, collaboration notes, stop conditions, shared compact guidance fragments, handoff wording, and a review checklist.
- Shared role-contract guidance lives in reusable fragments for scope control, verification evidence, write-policy behavior, handoff discipline, and release readiness; role packages select the fragments they need instead of copy-pasting the same prose into every role definition.
- Generated project role prompts include each role's display name, context strategy, role instructions, structured role-contract sections, selected active-engine reference paths, expected outputs, review checklist, and handoff template. Relevant programming and technical art roles receive active-engine version, current-best-practices, and gameplay references; engine/tools roles receive active-engine plugin references; engine specialists receive the matching active-engine specialist reference; module and plugin references remain task-keyword-selected rather than default prompt payload; unrelated engine references are excluded.
- Codex session prompts render the role display name, role ID, context strategy, phase, project root, objective, engine context, sandbox, active write policy when provided, file-edit permission, context files, structured role-contract sections, expected outputs, verification command, review checklist, and completion-report instructions.
- When a caller supplies a context contract, the standard prompt renderer includes a `# Context Contract` section with selected context, context omissions/blockers, project stage, studio mode, phase, write policy, sandbox, and file-edit permission.
- Workflow prompt rendering computes the same phase and studio-mode eligibility fields used by role runs so the context contract's write policy, sandbox, and file-edit permission remain consistent; render-only plan/review/ship workflows stay read-only, while eligible implement workflows render with matching write permissions.
- The workflow registry defines a curated prompt-only catalog across onboarding/discovery, design/architecture, implementation planning, QA/testing, release/hotfix, localization/accessibility, and team coordination categories.
- Built-in workflow prompts include vertical-slice, bugfix, playtest, market-analysis, analytics-setup, design-spec, game-feel-tuning, art-direction, ui-ux-review, production-milestone, handoff, review, ship-check, onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, and localization-plan.
- Selected workflows include CLI aliases for render-only shortcuts, including market, analytics, design-spec, feel-review, art-direction, ui-review, milestone, handoff, start, onboard, brainstorm, prototype, architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, story-done, qa-plan, regression-suite, security-audit, perf-profile, release-checklist, hotfix, and localization-plan.
- Template selection is task-, workflow-, role-, and project-pack-sensitive; built-in template files are read from package assets, project-local template files are read from `.codex/studio/config.json` references, and selected templates are embedded into applicable workflow prompts and role-run prompts without loading the entire template pack.
- Behavioral evaluation scenarios cover representative role/workflow prompt contracts by rendering prompts locally and checking required obligations, output-contract fields, selected context categories, required workflow templates, forbidden templates, forbidden future-only drift, and prompt-size bounds without LLM judges or hosted evaluators. Workflow scenarios without a project root still append the selected built-in workflow template bodies so repository-level behavioral validation exercises template rendering without requiring a temporary initialized project.
- Market analyst, data scientist, game-feel, UI/UX, QA, release, audio, content, systems/economy, accessibility/localization/live-ops/community, and technical specialist roles have bounded default role packages; reusable template selection remains task-specific rather than loading every role or template.
- Project-local customization packs may add `custom-*` role, workflow, and template IDs through `.codex/studio/config.json`; these overlays are extend-only and cannot replace built-in role/workflow/template IDs.
- Custom role prompts render the same visible role ID, context strategy, expected outputs, review checklist, write-policy, sandbox, and selected-template sections as built-in role runs, while custom workflow prompts use the generic `workflow <id>` command, require the declared workflow markdown file to exist, include that file as selected context, and render its body as workflow instructions rather than adding unbounded shortcut commands. Custom workflows may target either a built-in studio role or a project-local custom role; built-in targets render through the standard Codex session prompt and role contract, while custom targets append the project-local custom role prompt.
- Generated workflow files carry deterministic source-input and rendered-body hash metadata that covers workflow definition fields and the owning role display name, expected outputs, and review checklist used in the rendered workflow body.

## Core Rules

- Unknown role errors must point users toward Codex-native hyphenated role IDs rather than legacy agent names.
- Prompt rendering must include the role display name, project/session metadata, and the bounded structured role contract, including explicit sandbox and write-policy context when available, needed by Codex to operate without hidden state.
- Templates that require Markdown sections must have non-empty required sections; every built-in template records a description plus role/workflow use hints, and the project config template must parse as JSON.
- Workflow shortcuts render prompts; they do not imply hidden parallel orchestration or future planner behavior.
- Customization overlays are extend-only: custom IDs must use the `custom-*` prefix, required role prompt, workflow prompt, and template files must exist at project-safe relative paths, and custom entries must not replace built-in role/workflow/template IDs.
- Workflow prompt rendering may append only selected workflow templates and must not load every template.
- Role prompt rendering may list only selected active-engine reference paths and must not load every engine reference pack by default.
- Generated project prompt materialization may include only the specialist prompt matching the active project engine.

## Flows And States

- Workflow prompt flow: read project stage, studio mode, and engine from `.codex/studio.json`, select the workflow's declared context files through the path-safe selector, compute phase/studio-mode eligibility, create a Codex studio session for the owning role and phase, render the standard prompt with a context contract, then append any workflow template bodies.
- Custom workflow prompt flow: resolve the workflow or alias from `.codex/studio/config.json`, accept a validated built-in studio role or project-local custom role target, select the declared workflow file plus other project-safe context files, render the workflow file body as workflow instructions, render the built-in session role contract or custom role prompt for the target role, then append only the custom workflow's template IDs.
- Template selection flow: match role and task text against bounded keyword rules and return only matching template IDs.

## Contracts

- Role IDs are stable strings exported from `src/roles.ts` and reused by config validation, project state, prompt generation, workflow routing, and task creation. Role-package structured-contract fields are also rendered into both standard Codex session prompts and generated project role prompts, and generated role-prompt freshness inputs include those fields so stale prompt bodies fail validation.
- Engine reference prompt selection maps role IDs, optional task/workflow keywords, and the active project engine to generated project paths under `docs/engine-reference/<engine>/`; every engine pack includes version, current best practices, deprecated API, breaking-change, gameplay, specialist, module, and plugin references with seed-review metadata.
- Workflow IDs map to `.codex/workflows/<workflow>.md` files, expected context-file lists, taxonomy categories, CCGS-derived gap coverage notes, and optional CLI aliases.
- Behavioral scenario IDs map to representative built-in roles or workflows in `src/behavioral-evaluation.ts`; each scenario declares required phrases, forbidden drift phrases, selected-context categories, and workflow template expectations, and required template expectations are enforced for both project-backed and no-project workflow scenario rendering.
- Template IDs map to package template paths, project-local template paths, descriptions, role/workflow applicability hints, tags, and required-section validation. Current reusable built-in templates include GDD, feature spec, handoff, analytics setup, engine setup, market analysis, project config, game-feel tuning, art direction, UI/UX review, production milestone, playtest report, ship check, ADR, technical design, architecture traceability, art bible, sound bible, UX spec, accessibility requirements, test plan, test evidence, sprint plan, vertical-slice report, release notes, postmortem, risk register, economy model, difficulty curve, player journey, and pitch document.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Use Codex-native hyphenated role IDs as the canonical user- and project-facing role contract.
- Decision (2026-05-28): Keep workflow shortcuts render-only for this pass; future planner, next, telemetry, ownership enforcement, and parallel orchestration surfaces remain hidden.
- Decision (2026-06-13): Workflow prompts use the same context-contract renderer as role-run prompts and include only selected workflow context instead of broad prompt material.
- Decision (2026-06-14): Add only one specialist role ID per supported engine and keep engine reference prompt selection active-engine scoped.
- Decision (2026-06-14): Keep engine specialist IDs canonical while scoping generated project specialist prompts and active specialist eligibility to the active engine.
- Decision (2026-06-17): Expand role coverage through bounded Codex-native specialist clusters rather than mirroring CCGS file-for-file; each new role remains a renderable role package with selected context strategy, expected outputs, and review checklist.
- Decision (2026-06-17): Expand workflow coverage as a categorized, prompt-only Codex-native catalog with local aliases and generated workflow metadata rather than importing slash-command lifecycle machinery.
- Decision (2026-06-17): Expand production template depth as package-shipped, metadata-rich templates selected by role/workflow relevance rather than broad prompt loading.
- Decision (2026-06-17): Expand engine reference depth as package-shipped, metadata-validated active-engine assets with default role references plus task/workflow-keyword-selected module and plugin references.
- Decision (2026-06-17): Expand role prompt depth through structured compact role contracts and reusable shared fragments rendered in both standard Codex session prompts and generated project role prompts, while keeping role/task context bounded.
- Decision (2026-06-17): Add representative behavioral-evaluation fixtures as deterministic prompt-contract checks instead of adopting hosted/LLM agent-evaluation infrastructure.
- Decision (2026-06-17): Add project-local customization as an extend-only overlay so users can define local `custom-*` roles, workflows, and templates while preserving built-in registries and bounded context selection; custom workflows may reuse built-in roles rather than requiring duplicate local role definitions.

## Rationale

Role and workflow prompt generation is the user-facing contract that turns a generic Codex CLI into a specialized game-studio workflow. Keeping it render-only and declarative avoids overclaiming automation that is not implemented while still making the workflow packages inspectable and testable.

## Non-Goals

- This doc does not own whether Codex is installed or authenticated.
- This doc does not own task lifecycle mutations or verification command execution.

## Maintenance Notes

- Update this doc with changes to `src/roles.ts`, `src/codex-session.ts`, `src/codex-prompts.ts`, `src/customization.ts`, `src/workflows.ts`, `src/engine-reference.ts`, `src/templates.ts`, or `templates/**`.
- Relevant verification includes role, Codex prompt/session, workflow, customization, template, and functionality-gap tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/workflows.ts
- ../../../../src/customization.ts
- ../../../../tests/customization.test.ts
