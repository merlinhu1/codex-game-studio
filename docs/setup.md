# Setup

Install and verify with Node 24 or newer:

```bash
npm install
npm run typecheck
npm run build
npm test
npm run validate
```

Local development scripts build first and then run `node dist/cli.js`.

```bash
npm run init -- --name "My Game" --engine godot --mode prototype --non-interactive --competitor "Mini Metro" --engine-version "4.4.1"
npm run templates -- list
npm run validate -- --project projects/my-game
```

After build/link/install, the package bin is available:

```bash
npm exec opengamestudio -- --help
npm exec opengamestudio -- templates show gdd
```
