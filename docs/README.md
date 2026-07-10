# Codex Game Studio Docs

This directory is intentionally small. Keep durable user-facing guidance here and keep game-studio operating surfaces in tracked template files:

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
| [Documentation Governance](standards/documentation-governance.md) | Ownership and maintenance rules for framework documentation. |

## Update rules

- Keep framework documentation separate from the design, architecture, production, and release records of an initialized game.
- Do not add dated plans or one-off implementation notes under `docs/`.
- Do not duplicate the agent, workflow, or skill catalogs in prose docs.
- Keep the root README concise and link here only for durable guidance.
- Prefer deleting stale docs over maintaining parallel current-state descriptions.
