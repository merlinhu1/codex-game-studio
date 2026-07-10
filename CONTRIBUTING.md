# Contributing

Use Node 24 or newer.

Before opening changes:

```bash
npm run typecheck
npm run build
npm test
npm run validate
```

Do not add Python compatibility files, duplicate script-wrapper logic, telemetry, direct Codex execution, planner behavior, hosted/background orchestration, unbounded parallelism, or ownership enforcement without a new design. Explicit local task orchestration is allowed only under the product boundary and must include tests and docs.
