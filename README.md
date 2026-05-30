# Open GameStudio

Codex Game Studio is a Node/TypeScript CLI package for creating and managing local, Codex-assisted game projects. It provides project scaffolding, engine-aware Codex context, role prompts, reusable templates, file-backed tasks, and validation gates that keep generated project artifacts predictable.

The package is a Codex-native workflow layer for game making. It keeps project state local and inspectable under `.codex/`, invokes `codex exec` by default for role-specific work, and uses `--dry-run` or `--print-prompt` for non-executing inspection.

## Why This Exists

Open GameStudio started as a port motivated by a simple need: make the game-studio workflow open, portable, local-first, scriptable, and usable outside a single assistant environment.

Claude Game Studio deserves real kudos for proving that role-based game-development workflows can be practical and useful. Open GameStudio is inspired by that idea, but it is an independent implementation with different priorities:

- CLI and package first, with deterministic npm scripts for local development.
- Codex-native by default, with direct `codex exec` integration for role-specific work.
- Generated game projects live under `projects/<slug>/`.
- Engine configs, templates, and base agents are package assets.
- Validation is explicit and hard-failing instead of advisory.
- Prompt packets are optimized for Codex and execute by default through `run <role>`.
- Telemetry, planner/`next`, ownership enforcement, changed-file tracking, and parallel orchestration are future-only.

The goal is not to clone another tool. The goal is to make the workflow contract inspectable, portable, and easy to run in normal developer tooling.

## Requirements

- Node.js 20 or newer.
- npm.
- Codex CLI for normal execution and repository validation.

## Install

For package use after installation or linking:

```sh
npm exec open-gamestudio -- --help
npm exec open-gamestudio -- templates list
```

For local development from this repository, use the npm scripts. They build first and then exercise the built CLI through `node dist/cli.js`:

```sh
npm run init -- --name "My Game" --engine godot --mode prototype --non-interactive
npm run manage -- --project projects/my-game
npm run templates -- list
npm run validate -- --project projects/my-game
```

## Quick Start

Create a project:

```sh
npm run init -- --name "My Game" --engine godot --mode prototype --non-interactive --concept "A compact puzzle game about routing trains"
```

Inspect project status:

```sh
npm run manage -- --project projects/my-game
```

List templates:

```sh
npm run templates -- list
```

Show a template:

```sh
npm run templates -- show gdd
```

Validate the repository or a generated project:

```sh
npm run validate
npm run validate -- --project projects/my-game
```

Run a project agent through Codex:

```sh
npm run build --silent
node dist/cli.js run producer --project projects/my-game "Create the initial market overview."
```

Inspect the generated prompt packet without executing Codex:

```sh
node dist/cli.js run producer --project projects/my-game "Create the initial market overview." --dry-run
```

The `run` command writes a bounded prompt packet and immediately invokes `codex exec` in the project root. The packet inlines the generated project role prompt from `.codex/prompts/<role>.md` and only the package templates selected for that role and task. `--fix` uses the same generated role prompt and selected templates as the primary implementation prompt. Use `--dry-run` or `--print-prompt` when you want to inspect the exact Codex context first.

`--allow-broad-context` adds bounded project artifact discovery for existing files such as the GDD, production timeline, market overview, `AGENTS.md`, and `.codex/studio.json`; it does not recursively load every prompt, workflow, or template.

## CLI Commands

- `init` / `new`: create a project under `projects/<slug>/`.
- `status`: print project phase, status, engine, and next validation command.
- `resume`: print a read-only continuation summary.
- `freeze`: mark a project as frozen.
- `validate`: run repository or project validation and exit nonzero on failure.
- `templates list`: list packaged template IDs.
- `templates show <template-id>`: print a packaged template.
- `run <role>`: prepare one bounded Codex prompt packet for a studio role and invoke `codex exec` by default.
- `task create` / `task run`: manage file-backed `.codex/tasks.json` tasks.
- `review`, `ship-check`: render existing baseline Codex workflow prompts.
- `market`, `analytics`, `design-spec`, `feel-review`, `art-direction`, `ui-review`, `milestone`, `handoff`: render workflow prompts only; these shortcuts do not launch Codex.

## Studio Roles

The Codex-native role roster is `studio-orchestrator`, `producer`, `market-analyst`, `data-scientist`, `creative-director`, `senior-game-designer`, `game-designer`, `narrative-designer`, `game-feel-designer`, `gameplay-programmer`, `engine-programmer`, `tools-programmer`, `senior-game-artist`, `technical-artist`, `ui-ux-designer`, `qa-playtester`, and `release-manager`.

This preserves Claude Game Studio functional coverage without legacy underscore role IDs. `narrative-designer` remains a first-class Codex-native story/content owner.

Supported aliases remain intentional: `new` is an alias for `init`, and registered workflow shortcuts render their prompts. Unsupported upstream or legacy underscore role IDs are rejected.

## Project Layout

Repository assets:

- `src/`: TypeScript CLI implementation.
- `src/roles.ts`: Codex role packages compiled into the CLI.
- `templates/`: reusable document and setup templates.
- `engine_configs/`: engine overlays for Godot, Unity, and Unreal.
- `docs/`: setup, migration, validation, and example notes.
- `tests/`: Vitest coverage for project workflow, templates, agents, runner prompts, validation, and engine behavior.

Generated project artifacts:

- `projects/<slug>/`: the project root created by `init`.
- `AGENTS.md`: primary generated Codex project instructions, owned by `src/agents.ts`.
- `.codex/studio.json`: authoritative project metadata and workflow state.
- `.codex/prompts/`: generated role prompts.
- `.codex/workflows/`: generated workflow prompts.
- `.codex/runs/`: prepared prompt packets and run metadata.
- `documentation/`: generated game-design and workflow documents.
- `source/project-<slug>/`: engine project location contract.

Generated role prompts and workflow files include deterministic freshness metadata and rendered-body hashes. Project validation checks new generated surfaces for stale registry inputs or manual body tampering, and reports legacy generated files without metadata as regeneration-needed skip diagnostics rather than silently treating them as fresh.

## Development

Use the repository scripts:

```sh
npm run build
npm run typecheck
npm run test
npm run validate
```

This project uses ESM TypeScript with `module` and `moduleResolution` set to `NodeNext`. Relative TypeScript imports include the emitted `.js` specifier.

## License

Open GameStudio is released under the MIT License. See `LICENSE`.
