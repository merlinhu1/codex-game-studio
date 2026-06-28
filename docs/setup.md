# Setup

This is the short setup reference. For full command usage, see the [User Guide](user-guide.md).

## Use from source checkout

Clone the repository, install dependencies, build TypeScript output, and then run the checked-in CLI wrapper. Generated bundled CLI artifacts are not committed.

```bash
git clone git@github.com:merlinhu1/codex-game-studio.git
cd codex-game-studio
npm install
npm run build
./codex-game-studio --help
./codex-game-studio init --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --engine-version "4.4.1"
./codex-game-studio templates list
./codex-game-studio validate --project projects/my-game
```

## Contributor development

Contributor workflow lives in [Development](development.md).

```bash
npm install
npm run typecheck
npm run build
npm test
npm run validate
```

## Package install smoke

After build/link/install, the package bin is available:

```bash
npm exec codex-game-studio -- --help
npm exec codex-game-studio -- templates show gdd
```
