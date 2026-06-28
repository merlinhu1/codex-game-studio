# Migration From Claude-Oriented Game Studio

Use the canonical TypeScript CLI with direct Codex execution:

```bash
npm exec codex-game-studio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro"
npm exec codex-game-studio -- run producer --project projects/my-game "Create the initial market overview."
```

For inspection-only runs, add `--dry-run` or `--print-prompt` to view the generated Codex prompt packet and metadata path before execution. Role runs inline the generated project role prompt and only selected package templates; workflow shortcuts still render prompts only.

`--allow-broad-context` performs bounded discovery of existing project artifacts. New generated prompts and workflows carry freshness metadata and body hashes; older generated files without metadata validate with regeneration-needed skip diagnostics.

Intentional differences: no interactive menu, no `startover`, no exact `template_info.md`, no eager competitor reports during init, no generated `project_orchestrator.md`, no `CODEX.md`, no legacy `.gamestudio` compatibility, and no unsupported upstream underscore role IDs. Supported aliases such as `new` for `init` remain available.

Future-only features are not implemented: `codex-game-studio next`, telemetry, changed-file tracking, hosted/background orchestration, unbounded parallelism, and ownership enforcement. Explicit local task orchestration is implemented through reviewable `.codex/**` task, lock, and run state.
