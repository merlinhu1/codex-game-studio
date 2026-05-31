# Workflow Validation

Validation exits nonzero when any check fails.

Repo validation checks package scripts, build output, package assets, engine configs, expanded role rendering, canonical workflow rendering, templates, package packing, installed-bin asset loading, future-only CLI surfaces, and Codex CLI readiness.

Project validation checks `.codex/studio.json` full `roles`, mode-specific `activeRoles`, registry-derived `workflows`, `AGENTS.md`, generated project-specific role prompts, workflow files, engine source files, starter docs, timeline sections, forbidden legacy artifacts, and read-only `status`/`resume` behavior.

CLI surface checks:

```bash
npm exec opengamestudio -- run --help | grep -- "--dry-run"
! npm exec opengamestudio -- --help | grep -E " next|telemetry"
```

Workflow shortcut commands such as `market`, `analytics`, `design-spec`, `feel-review`, `art-direction`, `ui-review`, `milestone`, and `handoff` render prompts only. They do not launch Codex or create run records.

No generated `CODEX.md`, `.gamestudio/runs`, or `project_orchestrator.md` is required or produced.
