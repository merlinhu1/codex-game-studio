# System Verification

Required verification:

```bash
npm run typecheck
npm run build
npm test
node dist/cli.js --help
node dist/cli.js validate
npm exec open-gamestudio -- --help
npm exec open-gamestudio -- validate
npm exec open-gamestudio -- run --help
npm run validate
```

Engine smoke:

```bash
npm run init -- --name "Codex Godot Smoke" --engine godot --mode prototype --non-interactive
npm run init -- --name "Codex Unity Smoke" --engine unity --mode design --non-interactive
npm run init -- --name "Codex Unreal Smoke" --engine "Unreal Engine" --mode development --non-interactive
npm run validate -- --project projects/codex-godot-smoke
npm run validate -- --project projects/codex-unity-smoke
npm run validate -- --project projects/codex-unreal-smoke
rm -rf projects/codex-godot-smoke projects/codex-unity-smoke projects/codex-unreal-smoke
```
