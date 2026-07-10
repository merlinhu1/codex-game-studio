# Codex Game Studio User Guide

This guide is the detailed companion to the root [README](../README.md).

Use the README for quick orientation. Use this guide for installation, commands, role execution, workflow prompts, task orchestration, validation, and troubleshooting.

## How Codex Game Studio runs

Codex Game Studio runs locally against the current repository checkout. `init` turns the current repository root into the game workspace and keeps project state in files that can be reviewed in Git.

The checked-in wrapper runs the built TypeScript entrypoint at `dist/cli.js`. This repository does not commit generated bundled CLI artifacts.

Role execution uses Codex directly. `run <role>` prepares a bounded prompt packet under the project root and invokes `codex exec` from that project.

## Installation from a source checkout

Requirements:

- Node.js 24 or newer.
- Codex CLI on `PATH` for `run <role>` and full validation.

```sh
git clone git@github.com:merlinhu1/codex-game-studio.git
cd codex-game-studio
npm install
npm run build
./codex-game-studio --help
```

Create a project:

```sh
./codex-game-studio init --name "My Game" --engine godot --mode prototype --non-interactive \
  --concept "A compact puzzle game about routing trains"

./codex-game-studio status
./codex-game-studio validate
```

By default, `init` converts a cloned template checkout into a game workspace. It preserves the game-facing studio surfaces and runtime assets, then removes maintainer-only authoring artifacts such as `eval-framework/`, stale research/reference folders, OpenSpec change files, repository TypeScript source files, and repository validation tests. Use `--keep-template-authoring` only when you are maintaining Codex Game Studio itself.

## Package-bin usage

After publishing, installing, or linking the package:

```sh
npm exec codex-game-studio -- --help
npm exec codex-game-studio -- templates list
```

The package bin is `codex-game-studio` and points to the built `dist/cli.js` entrypoint.

## Project lifecycle

### Create or inspect state

```sh
./codex-game-studio init --name "My Game" --engine godot --mode prototype --non-interactive
./codex-game-studio status
./codex-game-studio resume
```

`status` and `resume` are read-only. `freeze` is the explicit command that changes project status.

### Use templates and workflow prompts

```sh
./codex-game-studio templates list
./codex-game-studio templates show gdd
./codex-game-studio market
./codex-game-studio ship-check
```

Workflow shortcuts render focused prompts. They do not launch Codex unless you explicitly use `run <role>` or a task execution command.

### Run a studio role

```sh
./codex-game-studio run producer \
  "Create the initial market overview."
```

Inspect first when the task is risky or broad:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --dry-run

./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

`run <role>` assembles a runtime prompt packet from tracked custom agents, project state, selected templates, and bounded context for that role/task. `--allow-broad-context` adds bounded discovery for existing artifacts such as the GDD, production timeline, market overview, `AGENTS.md`, and `.codex/studio.json`; it does not recursively dump the project into the prompt.

### Validate before trusting output

```sh
./codex-game-studio validate
./codex-game-studio validate
```

Repository validation checks package contracts, build output, packaged assets, template availability, hidden future-only surfaces, role/workflow rendering, and Codex CLI readiness.

Project validation checks project state, tracked template surfaces, context metadata integrity, starter docs, read-only command behavior, and forbidden legacy artifacts.

## Command reference

| Command | What it does |
| --- | --- |
| `init` / `new` | Initialize the current repository root as the game workspace. |
| `status` | Print project phase, status, engine, and the next validation command. |
| `resume` | Print a read-only continuation summary. |
| `refresh-context` | Regenerate `.codex/context-manifest.json` after selected context files change. |
| `freeze` | Mark a project as frozen. |
| `validate` | Run hard-failing repository or project validation; pass `--base <ref>` to include documentation-impact checks. |
| `docs-impact --base <ref>` | Verify an active-session documentation-impact decision against functional changes from a Git base. |
| `templates list` | List packaged template IDs. |
| `templates show <template-id>` | Print a packaged template. |
| `run <role>` | Prepare one bounded Codex prompt packet and invoke `codex exec`. |
| `task create` / `task run` / `task orchestrate` | Manage file-backed `.codex/tasks.json` work and bounded local orchestration. |
| `workflow create-tasks <workflow-id>` | Create explicit tasks from recipes such as `vertical-slice`, `bugfix`, `ui-ux-review`, and `release-checklist`. |
| `market`, `analytics`, `design-spec`, `feel-review`, `art-direction`, `ui-review`, `milestone`, `handoff`, `review`, `ship-check` | Render focused workflow prompts. |

## Workflow prompts

Workflow shortcut commands render focused prompts for a human or Codex session to use. They are inspection and preparation surfaces.

They do not launch Codex, create run records, or mutate task state unless the command explicitly says it creates tasks.

Common shortcuts:

- `market`
- `analytics`
- `design-spec`
- `feel-review`
- `art-direction`
- `ui-review`
- `milestone`
- `handoff`
- `review`
- `ship-check`

Use `workflow create-tasks <workflow-id>` when you want a supported recipe to become explicit entries in `.codex/tasks.json`.

## File-backed tasks

Task commands manage work inside the project instead of relying on chat memory.

- `task create` adds explicit project tasks.
- `task run` runs a selected task through the configured role path.
- `task orchestrate` runs bounded local orchestration.
- `.codex/locks/` stores transient locks for bounded orchestration.

Task orchestration is local and bounded. Hosted background loops, unbounded parallelism, and planner/next automation are outside the current product boundary.

## Troubleshooting

### The wrapper cannot find `dist/cli.js`

Run:

```sh
npm install
npm run build
```

Generated bundled CLI artifacts are intentionally not committed.

### `run <role>` cannot launch Codex

Verify that the Codex CLI is installed and available on `PATH`:

```sh
codex --help
```

Use `--dry-run` or `--print-prompt` when you only need to inspect the prompt packet.

### Validation fails on template or project files

Inspect the relevant tracked template surface or project-state file before trusting the output. Project validation is intentionally strict about missing template files, malformed context metadata, and malformed project state.

## Codex prompt model routing

Prompt surfaces declare concrete Codex model and reasoning-effort policy in tracked template files. The model family (`gpt-5.6-sol`, `gpt-5.6-terra`, or `gpt-5.6-luna`) is chosen by capability and blast radius, while reasoning effort is chosen independently per prompt surface. For example, a cheap-but-careful routine review can use Luna/medium, bounded routine production work can use Terra/low, difficult implementation can use Terra/high, and Sol can use medium or high effort depending on risk. Runtime dry-runs and run metadata expose both selected values, and Codex execution receives the exact model and effort instead of a generic tier name.
