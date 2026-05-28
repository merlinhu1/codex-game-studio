# Migration From Claude-Oriented Game Studio

Use the canonical TypeScript CLI with direct Codex execution:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro"
npm exec open-gamestudio -- run producer --project projects/my-game "Create the initial market overview."
```

For inspection-only runs, add `--dry-run` or `--print-prompt` to view the generated Codex prompt packet and metadata path before execution.

Intentional differences: no interactive menu, no `startover`, no exact `template_info.md`, no eager competitor reports during init, and no generated `project_orchestrator.md`.

Future-only features are not implemented: `open-gamestudio next`, telemetry, parallel orchestration, changed-file tracking, and ownership enforcement.
