# Codex Game Studio Docs

This directory is intentionally small. Keep durable user-facing guidance here and keep game-studio operating surfaces in the tracked template files:

- `AGENTS.md`
- `.codex/agents/*.toml`
- `.codex/workflows/*.md`
- `.agents/skills/*/SKILL.md`

## Start here

| Doc | Purpose |
| --- | --- |
| [User Guide](user-guide.md) | Installation, commands, role runs, workflow prompts, tasks, validation, and troubleshooting. |
| [Examples](examples/README.md) | Scenario-based examples for common local workflows. |
| [Product Boundary](architecture/product-boundary.md) | Implemented scope, non-goals, and boundaries. |

## Repository support docs

| Doc | Purpose |
| --- | --- |
| [Repo Rules](ai/repo-rules.md) | Repository rules mirrored for agent discovery. |
| [Documentation Governance](standards/documentation-governance.md) | Rules for keeping docs concise and linked. |
| [Default Principles](standards/default-principles.md) | General project documentation principles. |

## Truthmark support

Truthmark support files under `docs/truthmark/` are retained only where they match the Truthmark support surface. Do not add broad product-specific truth-doc sprawl here; use tracked template files, tests, and the README/user guide first.

## Update rules

- Do not add dated plans or one-off implementation notes under `docs/`.
- Do not duplicate the agent, workflow, or skill catalogs in prose docs.
- Keep the root README concise and link here only for durable guidance.
- Prefer deleting stale docs over maintaining parallel current-state descriptions.
