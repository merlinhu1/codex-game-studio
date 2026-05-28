# Examples

Create and validate a project from this repository:

```sh
npm run build
npm run init -- --name "Rogue Core" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --competitor "Dorfromantik"
npm run manage -- --project projects/rogue-core
npm run validate -- --project projects/rogue-core
```

Run a studio role directly through Codex:

```sh
npm run build && node dist/cli.js run producer --project projects/rogue-core "Create the initial market overview."
```

Inspect prompts without launching Codex:

```sh
npm run build && node dist/cli.js run producer --project projects/rogue-core "Create the initial market overview." --dry-run
npm run build && node dist/cli.js market --project projects/rogue-core --dry-run
npm run build && node dist/cli.js analytics --project projects/rogue-core --dry-run
npm run build && node dist/cli.js handoff --project projects/rogue-core --dry-run
npm run build && node dist/cli.js design-spec --project projects/rogue-core --dry-run
npm run build && node dist/cli.js feel-review --project projects/rogue-core --dry-run
npm run build && node dist/cli.js ui-review --project projects/rogue-core --dry-run
```

Discover packaged templates:

```sh
npm run templates -- list
npm run templates -- show market_analysis
```
