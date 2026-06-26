# Development Rules

This repository is TypeScript/Node only.

Use `.js` specifiers for all relative TypeScript imports because the package uses NodeNext.

Run validation before claiming parity:

```bash
npm run typecheck
npm run build
npm test
npm run validate
```

Keep generated projects under `projects/<slug>/`.

The current build invokes Codex by default through `run <role>`. Use `--dry-run` or `--print-prompt` for inspection-only paths. Explicit local task orchestration is now inside the product boundary, but runtime claims require implementation and validation. The build still intentionally excludes planner commands, telemetry, changed-file tracking, hosted/background orchestration, unbounded parallelism, and ownership enforcement.
