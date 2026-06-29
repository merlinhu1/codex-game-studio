## 1. Reference and Plan Conversion

- [x] 1.1 Record CCGS reference facts from `/opt/data/repos/Claude-Code-Game-Studios@984023d` in a maintainer-only reference doc outside root game-facing `docs/`.
- [x] 1.2 Replace `docs/plans/2026-06-29-codex-native-agent-skill-surfaces.md` with a compact index that points to this OpenSpec change as canonical.
- [x] 1.3 Run `openspec validate repository-root-codex-game-studio --strict --json` and fix proposal/spec/design/task issues.

## 2. Root Initialization Behavior

- [x] 2.1 Add failing tests in `tests/project-workflow.test.ts` proving default `init` writes `.codex/studio.json` under a temp cwd and does not create `projects/<slug>/`.
- [x] 2.2 Implement root-mode project resolution in `src/projects.ts` and `src/paths.ts` while keeping explicit nested mode available.
- [x] 2.3 Add protection tests for re-running `init` over an existing different root project without an explicit force-refresh option.
- [x] 2.4 Run `npm test -- tests/project-workflow.test.ts` and confirm root-mode tests pass.

## 3. Game-Facing Repository Boundary

- [x] 3.1 Add failing validation tests that reject Codex Game Studio implementation files under root `src/` in the distributed template.
- [x] 3.2 Document and implement a separate generated root template boundary for clone-style game roots; package implementation remains in maintainer checkout `src/**` and is not emitted into initialized game roots.
- [x] 3.3 Keep package scripts, TypeScript configs, and source-checkout wrapper paths on the maintainer checkout because the separate generated root template boundary was chosen.
- [x] 3.4 Add failing validation tests that reject package-maintainer plans, Truthmark maintenance docs, and package development docs under root `docs/**`.
- [x] 3.5 Exclude maintainer docs from generated game roots while keeping game-facing architecture, market, and engine reference docs under generated root `docs/**`.
- [x] 3.6 Generate game-facing `AGENTS.md` in initialized roots and keep package-maintainer instructions in the maintainer checkout.
- [x] 3.7 Run `npm run build` and `npm test -- tests/validation.test.ts tests/agents-templates.test.ts`.

## 4. Codex-Native Agent Surfaces

- [x] 4.1 Add failing tests in `tests/agents-templates.test.ts` for `.codex/agents/*.toml` generation with required `name`, `description`, and `developer_instructions` fields.
- [x] 4.2 Implement `renderProjectCustomAgentToml(role, config, engines)` in `src/agents.ts` or its moved equivalent.
- [x] 4.3 Materialize active role agents under root `.codex/agents/` during root `init`.
- [x] 4.4 Add tests proving a Godot root project includes Godot specialists and omits Unity/Unreal specialists.
- [x] 4.5 Add validation that rejects `.codex/agents/*.md`, wrong-engine agents, stale generated agents, and Truthmark maintenance agents in game mode.
- [x] 4.6 Run `npm test -- tests/agents-templates.test.ts tests/validation.test.ts`.

## 5. Codex-Native Skill Surfaces

- [x] 5.1 Add repository-skill coverage for `.agents/skills/<name>/SKILL.md` in `tests/project-workflow.test.ts` and `tests/validation.test.ts`.
- [x] 5.2 Implement a generated skill renderer with deterministic frontmatter, body, and provenance metadata.
- [x] 5.3 Generate onboarding skills `cgs-start`, `cgs-setup-engine`, and `cgs-adopt`.
- [x] 5.4 Generate first-pass workflow skills `cgs-bugfix`, `cgs-vertical-slice`, `cgs-ui-ux-review`, and `cgs-release-checklist`.
- [x] 5.5 Generate standards skills `cgs-standards-gameplay`, `cgs-standards-tests`, `cgs-standards-prototype`, and `cgs-standards-ui`.
- [x] 5.6 Add validation that rejects missing, stale, or malformed generated skill packages.
- [x] 5.7 Run `npm test -- tests/project-workflow.test.ts tests/validation.test.ts`.

## 6. Runtime Inspection and Compatibility

- [x] 6.1 Add failing `tests/runner.test.ts` coverage that root-mode `run --dry-run` resolves cwd when `.codex/studio.json` exists.
- [x] 6.2 Update dry-run output to show the runtime prompt path, custom-agent TOML path, and selected skill paths.
- [x] 6.3 Preserve explicit `--project` support for legacy nested projects during migration.
- [x] 6.4 Add `status` output that points to root `.codex/agents/` and `.agents/skills/` catalogs.
- [x] 6.5 Run `npm test -- tests/runner.test.ts tests/project-workflow.test.ts`.

## 7. Template Smoke and Optional Codex Probe

- [x] 7.1 Add `tests/template-root-smoke.test.ts` that builds a temp clone-style root and runs root initialization.
- [x] 7.2 Assert the temp root has game-facing `AGENTS.md`, `.codex/agents/*.toml`, `.agents/skills/**`, root game `src/`, and root game `docs/`.
- [x] 7.3 Assert no default `projects/<slug>/`, root maintainer docs, root package TypeScript source, `.codex/agents/*.md`, coding-standard `.codex/rules/*.rules`, or default `.codex/hooks.json` exists.
- [x] 7.4 Add an optional Codex availability probe that runs without failing offline environments; repository skills are verified by the generated root smoke test.
- [x] 7.5 Run `npm test -- tests/template-root-smoke.test.ts`.

## 8. Public Docs, Truth, and Final Validation

- [x] 8.1 Update user-facing setup docs and README to show `git clone <repo> my-game` as the primary install path.
- [x] 8.2 Document nested project mode only as a legacy migration escape hatch.
- [x] 8.3 Update truth docs only after functional code and tests land; keep Truthmark maintenance docs out of game-facing root `docs/`.
- [x] 8.4 Run `npm run validate` before any parity or completion claim.
- [x] 8.5 Run `truthmark check --json`, `truthmark index --json`, `git diff --check`, `openspec validate repository-root-codex-game-studio --strict --json`, and `openspec status --change repository-root-codex-game-studio --json`.
