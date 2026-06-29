# Codex Game Studio Docs

## Purpose

This directory keeps detailed usage, product, architecture, validation, and repository-truth material out of the root README.

The root [README](../README.md) is the concise human storefront. Use this index when you need the next layer of detail.

## Audience split

### For users

| Doc | Purpose |
| --- | --- |
| [User Guide](user-guide.md) | Installation, commands, role runs, workflows, tasks, validation, and troubleshooting. |
| [Setup](setup.md) | Short setup commands for source checkouts and package-bin smoke checks. |
| [Examples](examples/README.md) | Scenario-based examples inspired by the CCGS example-index style. |
| [Studio Roles](studio-roles.md) | Role catalog, role groups, and guidance for choosing the right Codex role. |
| [Project Anatomy](project-anatomy.md) | Template repository tree, file ownership, and validation-sensitive artifacts. |

### For contributors

| Doc | Purpose |
| --- | --- |
| [Development](development.md) | Build, test, validation, package, and documentation-maintenance workflow. |
| [Workflow Validation](workflow-validation.md) | What repository and project validation check. |
| [Known Upstream Differences](known-upstream-differences.md) | Intentional differences from the CCGS inspiration project. |
| [Migration from Claude](migration-from-claude.md) | Migration notes from Claude-oriented game-studio workflows. |
| [Product Boundary](architecture/product-boundary.md) | Implemented behavior, non-goals, and architecture boundaries. |

### For agents

| Doc | Purpose |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Agent entry point and repository instructions. |
| [Repo Rules](ai/repo-rules.md) | Mirrored repository-wide rules for Truthmark authority discovery. |
| [Truthmark routes](truthmark/routes/areas.md) | Route map for canonical truth docs. |
| [Product truth](truthmark/product/README.md) | Product capability promises and acceptance criteria. |
| [Engineering truth](truthmark/engineering/README.md) | Current implementation contracts, workflows, and operations. |

## Recommended reading order

### New user

1. [README](../README.md)
2. [User Guide](user-guide.md)
3. [Examples](examples/README.md)
4. [Project Anatomy](project-anatomy.md)

### Project maintainer

1. [README](../README.md)
2. [Development](development.md)
3. [Workflow Validation](workflow-validation.md)
4. [Product Boundary](architecture/product-boundary.md)
5. Relevant Truthmark product or engineering docs

### Agent changing behavior

1. [AGENTS.md](../AGENTS.md)
2. [Repo Rules](ai/repo-rules.md)
3. [Product Boundary](architecture/product-boundary.md)
4. [Truthmark routes](truthmark/routes/areas.md)
5. The nearest owning product or engineering truth doc

## Update rules

- Keep the root README concise. Move command reference, role catalog, generated-file detail, and contributor workflow detail into subdocs.
- When the root README changes materially, update localized README variants under `docs/readmes/` in the same change or state why they intentionally differ.
- When a command, workflow, generated artifact, role, or validation behavior changes, update the nearest user-facing doc and the owning Truthmark doc if it is behavior-bearing.
- Do not keep parallel current-state docs for the same subject. Link to the owning doc instead of duplicating details.
- Keep scenario examples concrete and outcome-oriented, not exhaustive command dumps.
