# Migration From Claude-Oriented Game Studio

Use the canonical TypeScript CLI with direct Codex execution:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro"
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview." --exec
```

For inspection-only runs, omit `--exec` or add `--dry-run` to view the generated Codex prompt packet and metadata path before execution.

Intentional differences: no interactive menu, no `startover`, no exact `template_info.md`, no eager competitor reports during init, and no generated `project_orchestrator.md`.

Future-only features are not implemented: `open-gamestudio next`, telemetry, parallel orchestration, changed-file tracking, and ownership enforcement.
