# Examples

Create and validate a project:

```bash
npm exec open-gamestudio -- init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --competitor "Dorfromantik"
npm exec open-gamestudio -- status --project projects/my-game
npm exec open-gamestudio -- validate --project projects/my-game
```

Run a role agent directly through Codex:

```bash
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview." --exec
```

Inspect the bounded Codex prompt packet first:

```bash
npm exec open-gamestudio -- run market_analyst --project projects/my-game --task "Create the initial market overview." --dry-run
```

Discover templates:

```bash
npm exec open-gamestudio -- templates list
npm exec open-gamestudio -- templates show market_analysis
```
