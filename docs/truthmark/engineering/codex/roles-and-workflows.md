---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-26
---

# Codex Roles And Workflows

## Purpose

Codex roles and workflows turn the generic Codex CLI into a bounded game-studio prompt surface.

They define role contracts, context boundaries, reusable templates, and render-only workflow shortcuts.

## Scope

This leaf doc owns role IDs, role package metadata, Codex session prompt rendering, workflow registry entries, and template registry behavior.

It also owns engine-reference prompt selection and generated workflow prompt content.

It does not own process execution, task persistence, package installation, or generated project initialization side effects.

## Current Implementation Behavior

- Studio role IDs are canonical hyphenated strings.
- Examples include `producer`, `gameplay-programmer`, `network-programmer`, `audio-director`, `accessibility-specialist`, `qa-playtester`, and `studio-orchestrator`.
- The roster covers audio, level, world, content, systems, and economy clusters.
- It also covers live ops, community, localization, accessibility, security, devops, performance, networking, AI, and UI programming clusters.
- Engine specialist role IDs are `godot-specialist`, `unity-specialist`, and `unreal-specialist`.
- Generated projects include only the specialist prompt for the active project engine.
- Each role package has a display name, system prompt, context strategy, responsibilities, expected inputs, and expected outputs.
- Role packages may also include an output schema, quality gates, collaboration notes, stop conditions, handoff wording, and review checklist.
- Shared role-contract guidance lives in reusable fragments.
- Fragments cover scope control, verification evidence, write-policy behavior, handoff discipline, and release readiness.
- Role packages select fragments instead of copying the same prose into every role.
- Generated project role prompts include the role display name, context strategy, role instructions, and structured sections.
- They also include selected active-engine references, expected outputs, review checklist, and handoff template.
- Programming and technical-art roles receive active-engine version, best-practice, and gameplay references.
- Engine and tools roles receive active-engine plugin references.
- Engine specialists receive the matching active-engine specialist reference.
- Module and plugin references remain task-keyword-selected.
- Unrelated engine references are excluded.
- Codex session prompts render role identity, phase, project root, objective, and engine context.
- They also render sandbox, write policy, file-edit permission, context files, expected outputs, verification command, review checklist, and completion-report instructions.
- When a context contract exists, the prompt includes a `# Context Contract` section.
- The context contract lists selected context, omissions, blockers, project stage, studio mode, phase, write policy, sandbox, and file-edit permission.
- Workflow prompt rendering uses the same phase and studio-mode eligibility fields as role runs.
- Render-only plan, review, and ship workflows stay read-only.
- Eligible implement workflows render with matching write permissions.
- The workflow registry is a curated prompt-only catalog.
- It covers onboarding, discovery, design, architecture, implementation planning, QA, testing, release, hotfix, localization, accessibility, and team coordination.
- Built-in production workflows include vertical-slice, production-milestone, handoff, review, ship-check, release-checklist, and hotfix.
- Built-in discovery and design workflows include market-analysis, analytics-setup, design-spec, game-feel-tuning, art-direction, ui-ux-review, onboard, brainstorm, and prototype.
- Built-in planning workflows include architecture-decision, architecture-review, create-epics, create-stories, sprint-plan, sprint-status, story-readiness, and story-done.
- Built-in QA and operations workflows include playtest, bugfix, qa-plan, regression-suite, security-audit, perf-profile, and localization-plan.
- Selected workflows expose local CLI aliases for render-only shortcuts.
- Template selection is task-, workflow-, role-, and project-pack-sensitive.
- Built-in templates are read from package assets.
- Project-local templates are read from `.codex/studio/config.json` references.
- Only selected templates are embedded into workflow prompts and role-run prompts.
- Behavioral evaluation scenarios render representative prompts locally.
- Scenario checks inspect required obligations, output-contract fields, selected context categories, and required workflow templates.
- They also inspect forbidden templates, forbidden future-only drift, and prompt-size bounds.
- Behavioral evaluation does not use LLM judges, hosted evaluators, telemetry, or hidden memory.
- Workflow scenarios without a project root still append selected built-in workflow templates.
- Project-local customization packs may add `custom-*` role, workflow, and template IDs.
- Custom overlays are extend-only and cannot replace built-in IDs.
- Custom role prompts render visible role ID, context strategy, expected outputs, review checklist, write policy, sandbox, and selected templates.
- Custom role review prompts reuse the built-in QA review surface.
- Custom role fix prompts append the configured custom role prompt.
- Custom workflow prompts use the generic `workflow <id>` command.
- Custom workflow prompts require the declared workflow Markdown file to exist.
- Custom workflow prompts include that file as selected context and render its body as workflow instructions.
- Custom workflows may target either a built-in role or a project-local custom role.
- Built-in targets render through the standard Codex session prompt and role contract.
- Custom targets append the project-local custom role prompt.
- Generated workflow files carry deterministic source-input and rendered-body hash metadata.
- Workflow hashes cover workflow definition fields plus the owning role display name, expected outputs, and review checklist.

## Core Rules

- Unknown role errors point users toward Codex-native hyphenated role IDs.
- Prompt rendering includes role identity, project/session metadata, and a bounded role contract.
- Prompt rendering includes sandbox and write-policy context when available.
- Templates with required Markdown sections must have non-empty required sections.
- Every built-in template records description and role/workflow use hints.
- The project config template must parse as JSON.
- Workflow shortcuts render prompts only.
- `workflow create-tasks` is a separate explicit recipe path that writes file-backed tasks for supported workflows without launching Codex.
- Workflow shortcuts do not imply hidden planner, telemetry, ownership, hosted orchestration, background loops, or unbounded parallel behavior. Explicit local task orchestration is provided only through reviewable `.codex/**` task, lock, and run state.
- Custom IDs must use the `custom-*` prefix.
- Custom file references must be project-safe relative paths.
- Custom entries must not replace built-in role, workflow, or template IDs.
- Workflow prompt rendering may append only selected workflow templates.
- Role prompt rendering may list only selected active-engine references.
- Generated projects may include only the active engine specialist prompt.

## Flows And States

- Workflow prompt flow reads project stage, studio mode, and engine from `.codex/studio.json`.
- Workflow prompt flow selects declared context files through the path-safe selector.
- It computes phase and studio-mode eligibility.
- It creates a Codex studio session for the owning role and phase.
- It renders the standard prompt with a context contract and appends selected workflow templates.
- Custom workflow prompt flow resolves the workflow or alias from `.codex/studio/config.json`.
- It accepts a validated built-in role or project-local custom role target.
- It selects the declared workflow file plus other project-safe context files.
- It renders the workflow file body as workflow instructions.
- It renders either the built-in session role contract or the custom role prompt.
- It appends only the custom workflow's selected template IDs.
- Template selection matches role and task text against bounded keyword rules.
- Template selection returns only matching template IDs.

## Contracts

- Role IDs are stable strings exported from `src/roles.ts`.
- Role IDs are reused by config validation, project state, prompt generation, workflow routing, and task creation.
- Role-package structured-contract fields are rendered into standard Codex session prompts.
- The same fields are rendered into generated project role prompts.
- Generated role-prompt freshness inputs include those fields so stale prompt bodies fail validation.
- Engine reference prompt selection maps role IDs, optional task/workflow keywords, and active project engine to generated project paths under `docs/engine-reference/<engine>/`.
- Every engine pack includes version, current best practices, deprecated API, breaking-change, gameplay, specialist, module, and plugin references.
- Engine reference assets carry seed-review metadata.
- Workflow IDs map to `.codex/workflows/<workflow>.md` files, expected context files, taxonomy categories, gap-coverage notes, and optional CLI aliases.
- Behavioral scenario IDs map to representative roles or workflows in `src/behavioral-evaluation.ts`.
- Each scenario declares required phrases, forbidden drift phrases, selected-context categories, and workflow template expectations.
- Required template expectations apply to both project-backed and no-project workflow rendering.
- Template IDs map to package paths, project-local paths, descriptions, role/workflow hints, tags, and required-section validation.
- Current built-in templates cover design, analytics, engine setup, market analysis, feel tuning, art direction, UI/UX, production, playtest, and ship checks.
- They also cover ADRs, technical design, traceability, art, audio, UX, accessibility, testing, and sprints.
- Additional templates cover release, postmortems, risk, economy, difficulty, player journeys, and pitches.

## Product Truth Links

- docs/truthmark/product/open-game-studio-cli.md

## Engineering Decisions

- Decision (2026-05-28): Use Codex-native hyphenated role IDs as the user- and project-facing role contract.
- Decision (2026-06-26): Workflow shortcut aliases render prompts and do not execute Codex.
- Decision (2026-06-26): Keep planner/next, telemetry, ownership enforcement, hosted orchestration, background loops, and unbounded parallelism absent from role and workflow prompt surfaces.
- Decision (2026-06-26): Keep local task orchestration ownership in runtime/task execution; role and workflow surfaces provide prompt and recipe inputs.
- Decision (2026-06-13): Workflow prompts use the same context-contract renderer as role-run prompts.
- Decision (2026-06-13): Workflow prompts include only selected workflow context.
- Decision (2026-06-14): Add one specialist role ID per supported engine.
- Decision (2026-06-14): Keep engine reference prompt selection scoped to the active engine.
- Decision (2026-06-14): Keep engine specialist IDs canonical.
- Decision (2026-06-14): Scope generated project specialist prompts to the active engine.
- Decision (2026-06-17): Expand role coverage through bounded specialist clusters instead of mirroring CCGS file-for-file.
- Decision (2026-06-17): Keep each new role as a renderable package with selected context, expected outputs, and a review checklist.
- Decision (2026-06-17): Expand workflow coverage as a prompt-only catalog with local aliases and generated metadata.
- Decision (2026-06-17): Do not import slash-command lifecycle machinery.
- Decision (2026-06-17): Expand production templates as package-shipped, metadata-rich templates selected by relevance.
- Decision (2026-06-17): Expand engine reference depth as package-shipped, metadata-validated active-engine assets.
- Decision (2026-06-17): Select module and plugin references by task or workflow keywords.
- Decision (2026-06-17): Expand role prompt depth through compact structured contracts and reusable shared fragments.
- Decision (2026-06-17): Render shared fragments in both standard session prompts and generated project prompts.
- Decision (2026-06-17): Add deterministic behavioral-evaluation fixtures instead of hosted or LLM-based evaluators.
- Decision (2026-06-17): Add project-local customization as an extend-only overlay for `custom-*` roles, workflows, and templates.
- Decision (2026-06-17): Let custom workflows reuse built-in roles instead of requiring duplicate local role definitions.
- Decision (2026-06-17): Reuse the built-in QA review surface for custom role review passes.
- Decision (2026-06-17): Use the configured custom role prompt for custom fix passes.

## Rationale

Role and workflow prompt generation is the user-facing contract that makes Codex act like a game-studio workflow.

Keeping the system render-only avoids overclaiming automation that is not implemented.

Declarative packages also keep role and workflow surfaces inspectable and testable.

## Non-Goals

- This doc does not own whether Codex is installed or authenticated.
- This doc does not own task lifecycle mutations.
- This doc does not own verification command execution.

## Maintenance Notes

- Update this doc when role, prompt, workflow, customization, engine-reference, or template behavior changes.
- Relevant verification includes role tests, Codex prompt/session tests, workflow tests, customization tests, template tests, and functionality-gap tests.

## Source References

- ../../routes/areas/repository.md
- ../../../../src/roles.ts
- ../../../../src/codex-session.ts
- ../../../../src/codex-prompts.ts
- ../../../../src/workflows.ts
- ../../../../src/templates.ts
- ../../../../src/customization.ts
- ../../../../src/prompt-context.ts
- ../../../../src/engine-reference.ts
- ../../../../src/behavioral-evaluation.ts
- ../../../../src/generated-surfaces.ts
- ../../../../templates/**
- ../../../../tests/roles.test.ts
- ../../../../tests/codex-session.test.ts
- ../../../../tests/codex-prompts.test.ts
- ../../../../tests/behavioral-evaluation.test.ts
- ../../../../tests/customization.test.ts
- ../../../../tests/functionality-gap-pass.test.ts
