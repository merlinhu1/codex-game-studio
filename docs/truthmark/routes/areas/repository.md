---
status: active
doc_type: area-route
last_reviewed: 2026-05-28
source_of_truth:
  - ../../../../.truthmark/config.yml
---

# Repository Areas

## Project Scaffolding

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/projects/project-scaffolding.md
    lane: engineering
    kind: engineering-behavior
```

Code surface:
- src/projects.ts
- src/config.ts
- src/engines.ts
- src/agents.ts
- src/context-manifest.ts
- src/engine-reference.ts
- src/generated-surfaces.ts
- src/paths.ts
- engine_configs/**
- engine_reference/**
- tests/project-workflow.test.ts
- tests/agents-templates.test.ts
- tests/engine-system.test.ts
- tests/codex-context-files.test.ts

Update truth when:
- project initialization, generated project state, engine folder creation, engine reference materialization, role prompt materialization, or status/resume/freeze behavior changes
- generated project AGENTS.md or base prompt package ownership changes

## Codex Role And Workflow Surfaces

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/codex/roles-and-workflows.md
    lane: engineering
    kind: engineering-behavior
```

Code surface:
- src/roles.ts
- src/codex-session.ts
- src/codex-prompts.ts
- src/prompt-context.ts
- src/workflows.ts
- src/engine-reference.ts
- src/templates.ts
- src/generated-surfaces.ts
- templates/**
- tests/roles.test.ts
- tests/codex-session.test.ts
- tests/codex-prompts.test.ts
- tests/functionality-gap-pass.test.ts

Update truth when:
- studio role IDs, role contracts, workflow registry entries, prompt rendering, engine reference prompt selection, context strategies, or template selection rules change
- Codex-native workflow shortcuts or generated workflow prompt contents change

## Runtime And Task Execution

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/engineering/codex/runtime-and-tasks.md
    lane: engineering
    kind: engineering-workflow
```

Code surface:
- src/runner.ts
- src/studio-policy.ts
- src/context.ts
- src/context-manifest.ts
- src/prompt-context.ts
- src/tasks.ts
- src/codex-runtime.ts
- src/verification.ts
- tests/runner.test.ts
- tests/studio-policy.test.ts
- tests/tasks.test.ts
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
```

Code surface:
- src/cli.ts
- src/validation.ts
- src/context-manifest.ts
- src/engine-reference.ts
- src/generated-surfaces.ts
- tests/cli-prompt-surface.test.ts
- tests/validation.test.ts
- tests/functionality-gap-pass.test.ts

Update truth when:
- public CLI commands, package scripts/bin/files, validation check IDs, engine reference package checks, documentation claims, or package dependency contracts change
- future-only surfaces become exposed or are intentionally kept hidden
