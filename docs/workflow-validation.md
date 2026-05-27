# Workflow Validation

Validation exits nonzero when any check fails.

Repo validation checks package scripts, build output, NodeNext import specifiers, package assets, engine configs, base agents, templates, package packing, and installed-bin asset loading.

Project validation checks schema-valid config, active agents, engine source root, engine project file, materialized agents, project `AGENTS.md` provenance and config hash, market seed, starter GDD, timeline sections, and read-only `status`/`resume` behavior.

Absence checks:

```bash
! npm exec open-gamestudio -- --help | grep -E " next|telemetry"
! npm exec open-gamestudio -- run --help | grep -- "--exec"
```

No generated `project_orchestrator.md` is required or produced.
