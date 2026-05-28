---
status: active
doc_type: area-route
last_reviewed: 2026-05-28
source_of_truth:
  - ../../../.truthmark/config.yml
---

# Repository Areas

## Project Scaffolding

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/projects/project-scaffolding.md
    kind: behavior
```

Code surface:
- src/projects.ts
- src/config.ts
- src/engines.ts
- src/agents.ts
- src/paths.ts
- engine_configs/**
- tests/project-workflow.test.ts
- tests/agents-templates.test.ts
- tests/engine-system.test.ts
- tests/codex-context-files.test.ts

Update truth when:
- project initialization, generated project state, engine folder creation, role prompt materialization, or status/resume/freeze behavior changes
- generated project AGENTS.md or base prompt package ownership changes

## Codex Role And Workflow Surfaces

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/codex/roles-and-workflows.md
    kind: behavior
```

Code surface:
- src/roles.ts
- src/codex-session.ts
- src/codex-prompts.ts
- src/workflows.ts
- src/templates.ts
- templates/**
- tests/roles.test.ts
- tests/codex-session.test.ts
- tests/codex-prompts.test.ts
- tests/functionality-gap-pass.test.ts

Update truth when:
- studio role IDs, role contracts, workflow registry entries, prompt rendering, context strategies, or template selection rules change
- Codex-native workflow shortcuts or generated workflow prompt contents change

## Runtime And Task Execution

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/codex/runtime-and-tasks.md
    kind: workflow
```

Code surface:
- src/runner.ts
- src/tasks.ts
- src/codex-runtime.ts
- src/verification.ts
- tests/runner.test.ts
- tests/tasks.test.ts
- tests/verification.test.ts
- tests/codex-runtime.test.ts

Update truth when:
- Codex execution, dry-run or print-prompt mutation rules, review/fix lifecycle behavior, task-store persistence, or verification timeout behavior changes
- task status transitions or Codex sandbox policies change

## CLI And Validation Contracts

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/contracts/cli-and-validation.md
    kind: contract
```

Code surface:
- src/cli.ts
- src/validation.ts
- tests/validation.test.ts
- tests/functionality-gap-pass.test.ts

Update truth when:
- public CLI commands, package scripts/bin/files, validation check IDs, documentation claims, or package dependency contracts change
- future-only surfaces become exposed or are intentionally kept hidden
