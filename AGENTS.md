# Global Agent Instructions

Use `npm run validate` before any parity claim.

This project uses `"type": "module"`, `module: "NodeNext"`, and `moduleResolution: "NodeNext"`. Every relative TypeScript import must use the emitted `.js` specifier: write `import { x } from "./config.js"`, never `import { x } from "./config"`.

For local development before install/link, use npm scripts. Package scripts build first and exercise the built CLI through `node dist/cli.js`; use `npm run init -- ...`, `npm run manage -- ...`, `npm run templates -- list`, and `npm run validate -- ...`. Use `npm exec open-gamestudio -- ...` only after build/link/install or inside package-bin smoke fixtures. Bare `open-gamestudio ...` is only guaranteed after package install/link.

Keep generated game projects under `projects/<slug>/`.

Do not load all agents or all templates for a single role task.

`src/agents.ts` is the single owner for generated project `AGENTS.md`.

Direct Codex execution, telemetry, planner/next, ownership enforcement, and parallel orchestration are future-only.
