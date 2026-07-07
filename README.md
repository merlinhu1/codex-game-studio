<p align="center">
  <h1 align="center">Codex Game Studio</h1>
  <p align="center">
    Turn a Codex session into a structured, local-first game studio.
    <br />
    38 agents. 79 skills. 31 workflows. One Git-reviewable studio template.
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href=".codex/agents"><img src="https://img.shields.io/badge/agents-38-blueviolet" alt="38 Agents"></a>
  <a href=".agents/skills"><img src="https://img.shields.io/badge/skills-79-green" alt="79 Skills"></a>
  <a href=".codex/workflows"><img src="https://img.shields.io/badge/workflows-31-orange" alt="31 Workflows"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D24-339933.svg" alt="Node.js >=24"></a>
  <a href="https://github.com/openai/codex"><img src="https://img.shields.io/badge/built%20for-Codex-f5f5f5" alt="Built for Codex"></a>
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> |
  <a href="docs/readmes/README.zh.md">🇨🇳 简体中文</a> |
  <a href="docs/readmes/README.ja.md">🇯🇵 日本語</a> |
  <a href="docs/readmes/README.ko.md">🇰🇷 한국어</a>
</p>

---

## Why This Exists

A blank AI coding chat is flexible, but game development needs repeatable studio structure. Someone has to protect the vision, keep milestones visible, review technical choices, validate gameplay changes, check accessibility, prepare release notes, and make sure decisions are not trapped in chat history.

**Codex Game Studio** gives a Codex session the shape of a game studio without turning it into a hosted project manager or game engine. You get tracked agents, skills, workflows, project state, and validation in ordinary files that humans can inspect in Git.

The template is deliberately clone-first: the visible `AGENTS.md`, `.codex/agents/*.toml`, `.codex/workflows/*.md`, and `.agents/skills/*/SKILL.md` files are the studio surface. `init` records project state; it does not regenerate or overwrite the studio template.

---

## Table of Contents

- [What's Included](#whats-included)
- [Studio Hierarchy](#studio-hierarchy)
- [Skills](#skills)
- [Workflows](#workflows)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Model Routing](#model-routing)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [License](#license)

---

## What's Included

| Category | Count | Description |
|----------|-------|-------------|
| **Agents** | 38 | Codex custom agents across production, design, programming, art, audio, narrative, QA, localization, live ops, release, and engine support |
| **Skills** | 79 | Reusable studio actions under `.agents/skills/*/SKILL.md`, from onboarding and design through QA, release, team orchestration, and standards |
| **Workflows** | 31 | Tracked prompt workflows for market review, specs, stories, sprints, QA, security, release, hotfixes, vertical slices, and handoffs |
| **Engine Tracks** | 3 | Godot, Unity, and Unreal specialist context with engine references and validation checks |
| **Templates** | 31 | Packaged document templates for GDDs, ADRs, technical designs, playtests, releases, postmortems, risk registers, pitch docs, and more |
| **Validation** | built in | Hard-failing checks for package assets, template surfaces, project state, metadata, engine references, and future-only CLI drift |

## Studio Hierarchy

Agents are organized like a small game studio: directors own vision and technical coherence, leads own domain direction, and specialists handle focused execution.

```text
Tier 1 — Direction
  creative-director       technical-director      producer
  studio-orchestrator

Tier 2 — Department Leads
  game-designer           senior-game-designer    senior-game-artist
  audio-director          localization-lead       release-manager
  market-analyst          narrative-designer

Tier 3 — Specialists
  gameplay-programmer     engine-programmer       ai-programmer
  network-programmer      tools-programmer        ui-programmer
  systems-designer        level-designer          economy-designer
  game-feel-designer      technical-artist        sound-designer
  writer                  world-builder           ui-ux-designer
  qa-playtester           accessibility-specialist performance-analyst
  devops-engineer         security-engineer       data-scientist
  community-manager       live-ops-designer
```

### Engine Specialists

| Engine | Lead Agent | Focus |
|--------|------------|-------|
| **Godot 4** | `godot-specialist` | GDScript, scenes, nodes, resources, signals, plugins, and Godot-specific validation |
| **Unity** | `unity-specialist` | C#, packages, scenes, prefabs, UI Toolkit, Addressables, Cinemachine, and DOTS/ECS context |
| **Unreal Engine 5** | `unreal-specialist` | C++, Blueprints, GAS, replication, UMG/CommonUI, plugins, and Unreal project conventions |

## Skills

Skills are tracked under `.agents/skills/*/SKILL.md`. They are the reusable studio actions Codex can apply while working inside the template.

**Onboarding & Navigation**
`cgs-start` `cgs-help` `cgs-project-stage-detect` `cgs-setup-engine` `cgs-adopt` `cgs-onboard`

**Game Design**
`cgs-brainstorm` `cgs-map-systems` `cgs-design-system` `cgs-quick-design` `cgs-review-all-gdds` `cgs-propagate-design-change` `cgs-balance-check`

**Art & Assets**
`cgs-art-bible` `cgs-asset-spec` `cgs-asset-audit`

**UX & Interface**
`cgs-ux-design` `cgs-ux-review` `cgs-ui-ux-review`

**Architecture & Technical Planning**
`cgs-create-architecture` `cgs-architecture-decision` `cgs-architecture-review` `cgs-create-control-manifest`

**Stories & Sprints**
`cgs-create-epics` `cgs-create-stories` `cgs-dev-story` `cgs-sprint-plan` `cgs-sprint-status` `cgs-story-readiness` `cgs-story-done` `cgs-estimate` `cgs-vertical-slice`

**Reviews & Analysis**
`cgs-design-review` `cgs-code-review` `cgs-scope-check` `cgs-perf-profile` `cgs-tech-debt` `cgs-gate-check` `cgs-consistency-check` `cgs-security-audit` `cgs-content-audit`

**QA & Testing**
`cgs-qa-plan` `cgs-smoke-check` `cgs-soak-test` `cgs-regression-suite` `cgs-test-setup` `cgs-test-helpers` `cgs-test-evidence-review` `cgs-test-flakiness` `cgs-skill-test` `cgs-skill-improve`

**Production**
`cgs-milestone-review` `cgs-retrospective` `cgs-bug-report` `cgs-bug-triage` `cgs-bugfix` `cgs-reverse-document` `cgs-playtest-report`

**Release**
`cgs-release-checklist` `cgs-launch-checklist` `cgs-changelog` `cgs-patch-notes` `cgs-hotfix` `cgs-day-one-patch`

**Creative & Content**
`cgs-prototype` `cgs-localize`

**Team Orchestration**
`cgs-team-combat` `cgs-team-narrative` `cgs-team-ui` `cgs-team-release` `cgs-team-polish` `cgs-team-audio` `cgs-team-level` `cgs-team-live-ops` `cgs-team-qa`

**Path Standards**
`cgs-standards-gameplay` `cgs-standards-prototype` `cgs-standards-tests` `cgs-standards-ui`

## Workflows

Workflow prompts live under `.codex/workflows/*.md`. They are inspection-friendly prompt surfaces; shortcut commands render prompts and do not launch Codex unless you explicitly run a role or task.

| Phase | Workflows |
|-------|-----------|
| **Discovery** | `brainstorm`, `market-analysis`, `analytics-setup`, `onboard` |
| **Design** | `design-spec`, `game-feel-tuning`, `art-direction`, `localization-plan`, `ui-ux-review` |
| **Architecture** | `architecture-decision`, `architecture-review`, `security-audit`, `perf-profile` |
| **Planning** | `create-epics`, `create-stories`, `sprint-plan`, `sprint-status`, `story-readiness` |
| **Implementation** | `vertical-slice`, `prototype`, `bugfix`, `hotfix`, `story-done` |
| **QA & Review** | `qa-plan`, `regression-suite`, `playtest`, `review`, `handoff` |
| **Release** | `production-milestone`, `release-checklist`, `ship-check` |

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- Node.js 24 or newer
- Codex CLI on `PATH` for `run <role>` and full validation

### Setup

1. **Clone the template repository**:

   ```sh
   git clone git@github.com:merlinhu1/codex-game-studio.git signal-cartographer
   cd signal-cartographer
   ```

2. **Install and build the CLI**:

   ```sh
   npm install
   npm run build
   ```

3. **Initialize project state**:

   ```sh
   ./codex-game-studio init --name "Signal Cartographer" --engine godot --mode prototype --non-interactive \
     --concept "A compact puzzle game about routing trains through haunted switchyards"
   ```

   `init` turns the checkout into a game workspace: it keeps the game-facing agents, workflows, skills, templates, engine references, and CLI runtime, then prunes maintainer-only template-authoring artifacts such as `eval-framework/`, OpenSpec/research/reference scratch files, TypeScript source files, and repository validation tests. Template maintainers can pass `--keep-template-authoring` when intentionally working on this repository itself.

4. **Inspect and validate**:

   ```sh
   ./codex-game-studio status
   ./codex-game-studio validate
   ./codex-game-studio run producer \
     "Create the initial market overview." --print-prompt
   ```

## Project Structure

```text
AGENTS.md                         # Game-facing Codex instructions
codex-game-studio                 # Source-checkout CLI wrapper
.codex/
  agents/                         # 38 Codex custom agents
  workflows/                      # 31 tracked workflow prompts
  studio.json                     # Project state written by init
  tasks.json                      # File-backed task state
  runs/                           # Runtime metadata for role/task runs
  locks/                          # Local orchestration locks
.agents/
  skills/                         # 79 reusable studio skills
engine_configs/                   # Engine setup metadata
engine_reference/                 # Godot, Unity, Unreal reference packs
templates/                        # Document templates used by workflows
production/                       # Timeline, milestones, session state
docs/                             # Small user/docs support surface
src/                              # Game engine source root; maintainer TypeScript files are pruned by init
tests/                            # Game tests; repository validation tests are pruned by init
```

## How It Works

### Template First

The clone is the studio. Agents, workflows, skills, and instruction files are committed template surfaces, not hidden generated output. `init` records project state and engine choices without copying the studio back into itself.

### Codex-Native Execution

`run <role>` assembles a bounded prompt packet from the selected role, task, project state, tracked templates, and relevant context. Use `--dry-run` or `--print-prompt` to inspect before execution.

### Reviewable State

Tasks, approvals, locks, context manifests, and run metadata live under `.codex/**`. The workflow favors ordinary Git review over opaque chat memory.

### Strict Validation

`./codex-game-studio validate` checks package assets, template surfaces, role/workflow metadata, project state, engine references, and hidden future-only surfaces before readiness claims.

## Model Routing

Prompt surfaces declare exact Codex model policy in tracked files:

| Work type | Model |
|-----------|-------|
| Complex design, architecture, production, and release gates | `gpt-5.5` |
| Moderate implementation, QA, docs, bugfix, and bounded workflows | `gpt-5.4` |
| Simple help, status, classification, checklist, and lookup work | `gpt-5.4-mini` |

Runtime dry-runs and run metadata expose the selected model and reasoning effort. Codex execution receives the exact selected model instead of a generic tier name.

## Documentation

| Need | Start Here |
|------|------------|
| Install, commands, workflows, validation | [User Guide](docs/user-guide.md) |
| Realistic usage scenarios | [Examples](docs/examples/README.md) |
| Full documentation map | [Docs Index](docs/README.md) |
| Product boundaries and non-goals | [Product Boundary](docs/architecture/product-boundary.md) |

## Project Status

Codex Game Studio currently supports template-repository setup, Codex role execution, workflow prompt rendering, file-backed task orchestration, and repository/project validation.

It deliberately does **not** expose a planner or `next` command, telemetry, hosted orchestration, unbounded parallelism, hard output-ownership enforcement, or generated `CODEX.md` / `project_orchestrator.md` surfaces.

## License

Codex Game Studio is released under the MIT License. See [`LICENSE`](LICENSE).
