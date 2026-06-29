# System Verification

Required verification:

```bash
npm test -- tests/behavioral-evaluation.test.ts tests/customization.test.ts
npm run typecheck
npm run build
npm test
./codex-game-studio --help
./codex-game-studio validate
npm run validate
```

`npm run validate` includes the temporary packed-package install smoke for the published `codex-game-studio` bin.

Engine smoke:

```bash
./codex-game-studio init --name "Codex Godot Smoke" --engine godot --mode prototype --non-interactive
./codex-game-studio init --name "Codex Unity Smoke" --engine unity --mode design --non-interactive
./codex-game-studio init --name "Codex Unreal Smoke" --engine "Unreal Engine" --mode development --non-interactive
./codex-game-studio validate --project projects/codex-godot-smoke
./codex-game-studio validate --project projects/codex-unity-smoke
./codex-game-studio validate --project projects/codex-unreal-smoke
rm -rf projects/codex-godot-smoke projects/codex-unity-smoke projects/codex-unreal-smoke
```
