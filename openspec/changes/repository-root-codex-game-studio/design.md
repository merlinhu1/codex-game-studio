## Context

CCGS installs by cloning its repository as a new game. Its root contains game-oriented instruction and injection surfaces: `CLAUDE.md`, `.claude/agents/**`, `.claude/skills/**`, hooks, rules, `src/`, `design/`, `docs/`, and `production/`. The user wants Codex Game Studio to follow the same injection strategy while staying Codex-native.

Current Codex Game Studio is organized as a Node package source checkout. It writes generated game projects under `projects/<slug>`, uses root `src/` for TypeScript implementation, and uses root `docs/` for package architecture, implementation plans, Truthmark docs, migration notes, and development rules. That is appropriate for maintaining the tool but wrong for a cloned game workspace.

Current Codex documentation defines the native surfaces to use:

- project custom agents: `.codex/agents/*.toml`;
- repository skills: `.agents/skills/<name>/SKILL.md`;
- project instructions: `AGENTS.md`;
- Codex rules: `.codex/rules/*.rules` for sandbox command permissions;
- Codex hooks: `.codex/hooks.json` or `.codex/config.toml`, with trust review.

## Goals / Non-Goals

**Goals:**

- Make clone-root installation the primary user path.
- Make default `init` configure the current repository root.
- Expose Codex-native game agents and skills at root paths after clone.
- Keep game-facing root `src/` and `docs/` clear of package-maintainer material.
- Preserve explicit CLI runtime and validation while native Codex surfaces mature.
- Validate stale, wrong-engine, missing, and forbidden generated surfaces.

**Non-Goals:**

- Do not add `.claude/**` compatibility.
- Do not generate Codex hooks by default.
- Do not use `.codex/rules/*.rules` for coding standards.
- Do not remove the current `run <role>` runtime path until custom-agent orchestration has a stable noninteractive contract.
- Do not claim full CCGS parity without `npm run validate` and an explicit coverage audit.

## Decisions

### Repository root is the game root

Default installation is `git clone <repo> my-game`, then run Codex from `my-game`. Default `init` resolves `projectRoot = cwd` and writes root `.codex/studio.json`. Nested `projects/<slug>` generation is not retained.

Alternative rejected: keep nested `projects/<slug>` generation. That preserves package-maintenance cleanliness but fails the desired CCGS injection strategy and leaves first-session Codex context pointed at package-maintainer docs.

### Separate game-facing and maintainer-facing paths

Root `src/`, `assets/`, `design/`, `docs/`, `tests/`, `tools/`, and `production/` are game paths. Package implementation source, package tests, implementation plans, Truthmark maintenance docs, and repo-maintenance instructions move to `tooling/codex-game-studio/**` or to a separate maintainer repository.

Alternative rejected: leave package docs under root `docs/` and rely on instructions telling agents to ignore them. Automatic discovery, search, and user browsing would still surface tool-maintenance material during game work.

### Use Codex-native surface formats

Custom agents are generated as `.codex/agents/*.toml`. Skills are generated as `.agents/skills/<name>/SKILL.md`. `AGENTS.md` is the concise game instruction file. `.codex/prompts/**` and `.codex/workflows/**` remain CGS runtime artifacts during migration.

Alternative rejected: generate `.codex/agents/*.md`. Current Codex documentation requires standalone TOML for custom agents.

### Coding standards are skills and selected context, not Codex permission rules

Path/domain coding standards are encoded as skills and selected prompt context. `.codex/rules/*.rules` is reserved for sandbox command permission policy because Codex docs define rules as permission rules.

Alternative rejected: mirror CCGS `.claude/rules` into `.codex/rules`. That would overload the official Codex rules surface with the wrong meaning.

### Hooks are deferred

Do not generate `.codex/hooks.json` by default. Hooks are official but require trust review and can surprise users because matching hooks from multiple files all run. A later design can add hooks if it includes trust, review, disablement, and failure behavior.

Alternative rejected: copy CCGS hook automation immediately. That imports hidden lifecycle behavior before the Codex trust model is designed.

## Risks / Trade-offs

- Root-mode migration may break current users who rely on `projects/<slug>` → Keep explicit `--project` path selection for existing projects, but do not create new nested projects from init.
- Moving package source under `tooling/**` may disrupt package scripts and import paths → Add build, package-bin, and temp-cwd smoke tests before merging.
- Keeping package maintenance and game template in one repository may remain confusing → Treat `tooling/**` isolation as the first step and keep a separate template repository as the long-term option.
- Codex custom-agent noninteractive selection may not be stable → Keep current `.codex/prompts/**` runtime path until a stable custom-agent execution contract exists.
- Too many generated skills can crowd the initial skill list → Generate a first-pass skill set only, then expand after prompt-budget behavior is measured.

## Migration Plan

1. Add OpenSpec-backed requirements and task plan.
2. Add root-mode tests first.
3. Implement root `init` behavior and preserve explicit `--project` path selection for existing projects.
4. Move package-maintainer implementation/docs out of root game-facing paths.
5. Generate root Codex-native agents and skills.
6. Update validation and smoke tests.
7. Update user docs to show clone-root installation.
8. Run `npm run validate`, `truthmark check --json`, and `truthmark index --json` before claiming completion.

Rollback: keep explicit `--project` support for existing checkouts if root-mode migration blocks users. Do not roll back to Markdown custom agents or coding standards under `.codex/rules/**`.

## Open Questions

- Should the package-maintenance source stay under `tooling/codex-game-studio/**` in this repository, or should the game template be split into a separate repository before public release?
- What exact CLI flags should guard root refresh: `--force-refresh`, `--template-maintenance`, or another naming scheme?
- Should default clone state include a generic `studio.json`, or should the `cgs-start` skill be responsible for first-time project configuration before `studio.json` exists?
