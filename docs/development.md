# Development

This document is for contributors working on Codex Game Studio itself.

For user-facing command usage, see the [User Guide](user-guide.md). For generated project layout, see [Project Anatomy](project-anatomy.md).

## Setup

```sh
npm install
npm run build
./codex-game-studio --help
```

This project uses ESM TypeScript with `module` and `moduleResolution` set to `NodeNext`. Relative TypeScript imports include emitted `.js` specifiers.

## Standard checks

Run these before publishing a change:

```sh
npm run typecheck
npm test
npm run validate
truthmark check --json
truthmark index --json
```

Use focused tests while developing, then run the full gate before committing.

## Source-checkout wrapper

The checked-in `./codex-game-studio` wrapper runs the built TypeScript entrypoint at `dist/cli.js`.

Generated bundled CLI artifacts are not committed. If the wrapper cannot find `dist/cli.js`, run:

```sh
npm install
npm run build
```

## Package-bin smoke

After build, link, install, or package smoke testing:

```sh
npm exec codex-game-studio -- --help
npm exec codex-game-studio -- templates show gdd
```

The package bin is `codex-game-studio` and points to `dist/cli.js`.

## Documentation maintenance

- Keep the root README concise and human-facing.
- Move command detail to [User Guide](user-guide.md).
- Move role detail to [Studio Roles](studio-roles.md).
- Move generated-file detail to [Project Anatomy](project-anatomy.md).
- Move contributor/build detail to this file.
- When the root README changes materially, update localized README storefronts under `docs/readmes/` in the same change or document the intentional deferral.
- Behavior-bearing changes should keep README claims, validation behavior, tests, and Truthmark-backed docs in sync.

## Truthmark-aware changes

This repository contains Truthmark-managed docs. Functional behavior changes should update the nearest canonical product or engineering truth doc and then run Truthmark validation.

Docs-only navigation changes do not require a Truth Sync workflow, but they should still pass `truthmark check` and `truthmark index` before publication.
