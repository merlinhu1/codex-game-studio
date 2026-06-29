# Workflow Validation

Validation exits nonzero when any check fails.

Repo validation checks package scripts, build output, package assets, engine configs, expanded role rendering, canonical workflow rendering, deterministic behavioral-evaluation scenarios, templates, package packing, installed-bin asset loading, future-only CLI surfaces, and Codex CLI readiness. Tests also cover explicit task orchestration, workflow task recipes, and curated CCGS adaptation registry consistency.

Project validation checks `.codex/studio.json` full `roles`, mode-specific `activeRoles`, registry-derived `workflows`, `.codex/studio/config.json` customization packs, tracked `AGENTS.md`, `.codex/agents/*.toml`, `.codex/workflows/*.md`, `.agents/skills/*/SKILL.md`, engine source files, starter docs, timeline sections, forbidden legacy artifacts, and read-only `status`/`resume` behavior.

CLI surface checks:

```bash
./codex-game-studio run --help | grep -- "--dry-run"
! ./codex-game-studio --help | grep -E " next|telemetry"
```

Workflow shortcut commands such as `market`, `analytics`, `design-spec`, `feel-review`, `art-direction`, `ui-review`, `milestone`, and `handoff` render prompts only. They do not launch Codex or create run records. `workflow create-tasks <workflow-id>` is the explicit path for turning supported workflow recipes into `.codex/tasks.json` tasks; it still does not launch Codex.

Behavioral evaluation scenarios are local deterministic validation subchecks. They render built-in role and workflow prompts, assert required prompt obligations, selected context categories, relevant templates, output-contract coverage, and forbidden future-only drift. They do not call hosted evaluators, telemetry, hidden memory, or LLM judges.

Project-local customization uses `.codex/studio/config.json` as an extend-only overlay. Custom role, workflow, and template IDs must use `custom-*`, must not override built-ins, and all referenced prompt/context/template paths must remain inside the project root.

No generated `CODEX.md`, `.gamestudio/runs`, or `project_orchestrator.md` is required or produced.

## Codex prompt model routing

Prompt surfaces declare exact Codex model policy in tracked template files. Complex design, architecture, production, and release-gate surfaces use `gpt-5.5`; moderate implementation, QA, docs, bugfix, and bounded workflow surfaces use `gpt-5.4`; simple help, status, classification, checklist, and lookup surfaces use `gpt-5.4-mini`. Runtime dry-runs and run metadata expose the selected model and reasoning effort, and Codex execution receives the exact selected model instead of a generic tier name.
