# Migration From Claude-Oriented Game Studio

Use the canonical TypeScript CLI:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro"
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview."
```

Manual external Codex command; `open-gamestudio` does not spawn Codex in the first build:

```bash
codex exec --cd projects/my-game "Read .gamestudio/runs/<run-id>/prompt.md and perform the requested task."
```

Intentional differences: no interactive menu, no `startover`, no exact `template_info.md`, no eager competitor reports during init, and no generated `project_orchestrator.md`.

Future-only features are not implemented: `open-gamestudio next`, `run --exec`, telemetry, parallel orchestration, changed-file tracking, and ownership enforcement.
