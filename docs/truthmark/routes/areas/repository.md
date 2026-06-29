---
status: active
doc_type: area-route
last_reviewed: 2026-06-25
---

# Repository Areas

## Codex Game Studio Product Capability

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/product/codex-game-studio-cli.md
    lane: product
    kind: product-capability
    realized_by:
      - docs/truthmark/engineering/projects/project-scaffolding.md
      - docs/truthmark/engineering/codex/roles-and-workflows.md
      - docs/truthmark/engineering/codex/runtime-and-tasks.md
      - docs/truthmark/engineering/codex/approval-stores.md
      - docs/truthmark/engineering/contracts/cli-and-validation.md
```

Code surface:
- docs/architecture/product-boundary.md
- docs/ai/repo-rules.md
- src/cli.ts
- src/projects.ts
- src/roles.ts
- src/workflows.ts
- src/runner.ts
- src/customization.ts
- src/validation.ts
- engine_reference/**
- templates/**
- tests/functionality-gap-pass.test.ts
- tests/project-workflow.test.ts
- tests/runner.test.ts
- tests/validation.test.ts

Update truth when:
- Codex Game Studio's mission, user-visible CLI/package capability, Codex-native product boundary, generated-project contract, product non-goals, or acceptance criteria change
- user-facing behavior crosses from optional/local repository workflow support into hosted orchestration, hidden memory, CI/release governance, or non-Codex runtime replacement

## Project Scaffolding

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/projects/project-scaffolding.md
    lane: engineering
    kind: engineering-behavior
    realizes:
      - docs/truthmark/product/codex-game-studio-cli.md
```

Code surface:
- src/projects.ts
- src/config.ts
- src/engines.ts
- src/agents.ts
- src/skills.ts
- src/context-manifest.ts
- src/engine-reference.ts
- src/generated-surfaces.ts
- src/customization.ts
- src/paths.ts
- engine_configs/**
- engine_reference/**
- tests/project-workflow.test.ts
- tests/template-repository-surfaces.test.ts
- tests/engine-system.test.ts
- tests/codex-context-files.test.ts

Update truth when:
- project initialization, generated project state, engine folder creation, engine reference materialization, role prompt materialization, or status/resume/freeze behavior changes
- template `AGENTS.md`, custom-agent template files, workflow template files, repository skills, or base prompt package ownership changes

## Codex Role And Workflow Surfaces

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/codex/roles-and-workflows.md
    lane: engineering
    kind: engineering-behavior
    realizes:
      - docs/truthmark/product/codex-game-studio-cli.md
```

Code surface:
- src/roles.ts
- src/codex-session.ts
- src/codex-prompts.ts
- src/behavioral-evaluation.ts
- src/customization.ts
- src/prompt-context.ts
- src/prompt-surface-metadata.ts
- src/workflows.ts
- src/workflow-catalog.ts
- src/ccgs-parity.ts
- scripts/audit-ccgs-surfaces.ts
- scripts/audit-prompt-surfaces.ts
- src/engine-reference.ts
- src/templates.ts
- src/generated-surfaces.ts
- references/ccgs-surface-parity-matrix.*
- references/prompt-surface-uplift-matrix.*
- references/prompt-uplift-eval-protocol.md
- templates/**
- tests/roles.test.ts
- tests/codex-session.test.ts
- tests/codex-prompts.test.ts
- tests/ccgs-parity-audit.test.ts
- tests/workflow-catalog.test.ts
- tests/functionality-gap-pass.test.ts
- tests/template-repository-surfaces.test.ts
- tests/prompt-surface-audit.test.ts
- tests/prompt-surface-metadata.test.ts
- tests/prompt-surface-validation.test.ts

Update truth when:
- studio role IDs, custom role IDs, role contracts, workflow registry entries, or prompt rendering change
- engine reference prompt selection, context strategies, or template selection rules change
- Codex-native workflow shortcuts or generated workflow prompt contents change

## Runtime And Task Execution

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/codex/runtime-and-tasks.md
    lane: engineering
    kind: engineering-workflow
    realizes:
      - docs/truthmark/product/codex-game-studio-cli.md
```

Code surface:
- src/runner.ts
- src/studio-policy.ts
- src/context.ts
- src/customization.ts
- src/context-manifest.ts
- src/prompt-context.ts
- src/tasks.ts
- src/orchestrator.ts
- src/orchestrator-locks.ts
- src/workflow-recipes.ts
- src/ccgs-adaptation.ts
- src/codex-runtime.ts
- src/verification.ts
- tests/runner.test.ts
- tests/studio-policy.test.ts
- tests/tasks.test.ts
- tests/orchestrator.test.ts
- tests/workflow-recipes.test.ts
- tests/ccgs-adaptation.test.ts
- tests/verification.test.ts
- tests/codex-runtime.test.ts

Update truth when:
- Codex execution, dry-run or print-prompt mutation rules, review/fix lifecycle behavior, task-store persistence, or verification timeout behavior changes
- task status transitions or Codex sandbox policies change

## Approval Stores

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/codex/approval-stores.md
    lane: engineering
    kind: engineering-behavior
    realizes:
      - docs/truthmark/product/codex-game-studio-cli.md
```

Code surface:
- src/approvals.ts
- tests/approval-gates.test.ts

Update truth when:
- approval store schema, canonical objective hashing, scope normalization, approval matching, expiry, revocation, or approval-store helper behavior changes

## CLI And Validation Contracts

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/contracts/cli-and-validation.md
    lane: engineering
    kind: engineering-contract
    realizes:
      - docs/truthmark/product/codex-game-studio-cli.md
```

Code surface:
- src/cli.ts
- src/validation.ts
- src/customization.ts
- src/context-manifest.ts
- src/engine-reference.ts
- src/generated-surfaces.ts
- tests/validation.test.ts
- tests/functionality-gap-pass.test.ts
- tests/codex-context-files.test.ts

Update truth when:
- public CLI commands, package scripts/bin/files, validation check IDs, or documentation claims change
- project-local customization checks, engine reference package checks, or package dependency contracts change
- future-only surfaces become exposed or are intentionally kept hidden

## Source References

- ../../../../.truthmark/config.yml
