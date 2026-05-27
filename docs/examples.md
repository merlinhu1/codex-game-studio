# Examples

Create and validate a project:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --competitor "Dorfromantik"
npm exec open-gamestudio -- status --project projects/my-game
npm exec open-gamestudio -- validate --project projects/my-game
```

Prepare a bounded prompt packet:

```bash
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview."
```

Manual external Codex command; `open-gamestudio` does not spawn Codex in the first build:

```bash
codex exec --cd projects/my-game "Read .gamestudio/runs/<run-id>/prompt.md and perform the requested task."
```

Discover templates:

```bash
npm exec open-gamestudio -- templates list
npm exec open-gamestudio -- templates show market_analysis
```
