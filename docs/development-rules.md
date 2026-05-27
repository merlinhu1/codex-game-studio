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

The first build includes direct Codex execution through `run --exec`. It still intentionally excludes planner commands, telemetry, parallel orchestration, changed-file tracking, and ownership enforcement.
