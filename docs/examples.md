# Examples

Create and validate a project from this repository:

```sh
./codex-game-studio init --name "Rogue Core" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --competitor "Dorfromantik"
./codex-game-studio status --project projects/rogue-core
./codex-game-studio validate --project projects/rogue-core
```

Run a studio role directly through Codex:

```sh
./codex-game-studio run producer --project projects/rogue-core "Create the initial market overview."
```

Inspect prompts without launching Codex:

```sh
./codex-game-studio run producer --project projects/rogue-core "Create the initial market overview." --dry-run
./codex-game-studio market --project projects/rogue-core --dry-run
./codex-game-studio analytics --project projects/rogue-core --dry-run
./codex-game-studio handoff --project projects/rogue-core --dry-run
./codex-game-studio design-spec --project projects/rogue-core --dry-run
./codex-game-studio feel-review --project projects/rogue-core --dry-run
./codex-game-studio ui-review --project projects/rogue-core --dry-run
```

Discover packaged templates:

```sh
./codex-game-studio templates list
./codex-game-studio templates show market_analysis
```
