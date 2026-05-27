# Open GameStudio

Open GameStudio is a Node/TypeScript CLI package for creating and managing local, agent-assisted game projects. It provides project scaffolding, engine-aware configuration, base agent prompts, reusable templates, bounded prompt packets, and validation gates that keep generated project artifacts predictable.

The package is a Codex-first agent workflow layer for game making. It keeps project state local and inspectable while integrating directly with `codex exec` for role-specific work. The CLI prepares bounded prompt packets, invokes Codex when requested, and preserves deterministic validation gates around generated artifacts.

## Why This Exists

Open GameStudio started as a port motivated by a simple need: make the game-studio workflow open, portable, local-first, scriptable, and usable outside a single assistant environment.

Claude Game Studio deserves real kudos for proving that role-based game-development workflows can be practical and useful. Open GameStudio is inspired by that idea, but it is an independent implementation with different priorities:

- CLI and package first, with deterministic npm scripts for local development.
- Codex-native by default, with direct `codex exec` integration for role-specific work.
- Generated game projects live under `projects/<slug>/`.
- Engine configs, templates, and base agents are package assets.
- Validation is explicit and hard-failing instead of advisory.
- Prompt packets are optimized for Codex and can be executed directly with `--exec`.
- Telemetry, planner/`next`, ownership enforcement, changed-file tracking, and parallel orchestration are future-only.

The goal is not to clone another tool. The goal is to make the workflow contract inspectable, portable, and easy to run in normal developer tooling.

## Requirements

- Node.js 20 or newer.
- npm.

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
node dist/cli.js run market_analyst --project projects/my-game --task "Create the initial market overview." --exec
```

Inspect the generated prompt packet without executing Codex:

```sh
node dist/cli.js run market_analyst --project projects/my-game --task "Create the initial market overview." --dry-run
```

The `run` command writes a bounded prompt packet and, with `--exec`, immediately invokes `codex exec` in the project root. Use `--dry-run` or `--print-prompt` when you want to inspect the exact Codex context first.

## CLI Commands

- `init` / `new`: create a project under `projects/<slug>/`.
- `status`: print project phase, status, engine, and next validation command.
- `resume`: print a read-only continuation summary.
- `freeze`: mark a project as frozen.
- `validate`: run repository or project validation and exit nonzero on failure.
- `templates list`: list packaged template IDs.
- `templates show <template-id>`: print a packaged template.
- `run <agent>`: prepare one bounded Codex prompt packet for a project agent; add `--exec` to invoke `codex exec` immediately.

## Project Layout

Repository assets:

- `src/`: TypeScript CLI implementation.
- `agents/base/`: base role prompts packaged with the CLI.
- `templates/`: reusable document and setup templates.
- `engine_configs/`: engine overlays for Godot, Unity, and Unreal.
- `docs/`: setup, migration, validation, and example notes.
- `tests/`: Vitest coverage for project workflow, templates, agents, runner prompts, validation, and engine behavior.

Generated project artifacts:

- `projects/<slug>/`: the project root created by `init`.
- `project.gamestudio.json`: project metadata and workflow state.
- `AGENTS.md`: generated project instructions owned by `src/agents.ts`.
- `documentation/`: generated game-design and workflow documents.
- `source/project-<slug>/`: engine project location contract.
- `.gamestudio/runs/`: prepared prompt packets and run metadata.

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
