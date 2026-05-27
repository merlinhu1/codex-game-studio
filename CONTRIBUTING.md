# Contributing

Use Node 20 or newer.

Before opening changes:

```bash
npm run typecheck
npm run build
npm test
npm run validate
```

Do not add Python compatibility files, duplicate script-wrapper logic, telemetry, direct Codex execution, planner behavior, parallel orchestration, or ownership enforcement without a new design.

Do not edit `research/*` as part of implementation changes unless the task explicitly asks for research updates.
