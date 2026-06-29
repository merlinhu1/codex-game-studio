## 1. Reference and Plan Conversion

- [ ] 1.1 Record CCGS reference facts from `/opt/data/repos/Claude-Code-Game-Studios@984023d` in a maintainer-only reference doc outside root game-facing `docs/`.
- [ ] 1.2 Replace `docs/plans/2026-06-29-codex-native-agent-skill-surfaces.md` with a compact index that points to this OpenSpec change as canonical.
- [ ] 1.3 Run `openspec validate repository-root-codex-game-studio --strict --json` and fix proposal/spec/design/task issues.

## 2. Root Initialization Behavior

- [ ] 2.1 Add failing tests in `tests/project-workflow.test.ts` proving default `init` writes `.codex/studio.json` under a temp cwd and does not create `projects/<slug>/`.
- [ ] 2.2 Implement root-mode project resolution in `src/projects.ts` and `src/paths.ts` while keeping explicit nested mode available.
- [ ] 2.3 Add protection tests for re-running `init` over an existing different root project without an explicit force-refresh option.
- [ ] 2.4 Run `npm test -- tests/project-workflow.test.ts` and confirm root-mode tests pass.

## 3. Game-Facing Repository Boundary

- [ ] 3.1 Add failing validation tests that reject Codex Game Studio implementation files under root `src/` in the distributed template.
- [ ] 3.2 Move package implementation source from root `src/**` to an isolated maintenance path such as `tooling/codex-game-studio/src/**`, or document and implement a separate template export if the move is deferred.
- [ ] 3.3 Update package scripts, TypeScript configs, and source-checkout wrapper paths after the source move.
- [ ] 3.4 Add failing validation tests that reject package-maintainer plans, Truthmark maintenance docs, and package development docs under root `docs/**`.
- [ ] 3.5 Move maintainer docs out of root `docs/**` or exclude them from the distributed template; keep game-facing engine reference and game architecture docs in root `docs/**`.
- [ ] 3.6 Replace root `AGENTS.md` with game-facing guidance and move package-maintainer instructions to the isolated maintenance path.
- [ ] 3.7 Run `npm run build` and `npm test -- tests/validation.test.ts tests/agents-templates.test.ts`.

## 4. Codex-Native Agent Surfaces

- [ ] 4.1 Add failing tests in `tests/agents-templates.test.ts` for `.codex/agents/*.toml` generation with required `name`, `description`, and `developer_instructions` fields.
- [ ] 4.2 Implement `renderProjectCustomAgentToml(role, config, engines)` in `src/agents.ts` or its moved equivalent.
- [ ] 4.3 Materialize active role agents under root `.codex/agents/` during root `init`.
- [ ] 4.4 Add tests proving a Godot root project includes Godot specialists and omits Unity/Unreal specialists.
- [ ] 4.5 Add validation that rejects `.codex/agents/*.md`, wrong-engine agents, stale generated agents, and Truthmark maintenance agents in game mode.
- [ ] 4.6 Run `npm test -- tests/agents-templates.test.ts tests/validation.test.ts`.

## 5. Codex-Native Skill Surfaces

- [ ] 5.1 Add `tests/skills.test.ts` with failing coverage for repository skills under `.agents/skills/<name>/SKILL.md`.
- [ ] 5.2 Implement a generated skill renderer with deterministic frontmatter, body, and provenance metadata.
- [ ] 5.3 Generate onboarding skills `cgs-start`, `cgs-setup-engine`, and `cgs-adopt`.
- [ ] 5.4 Generate first-pass workflow skills `cgs-bugfix`, `cgs-vertical-slice`, `cgs-ui-ux-review`, and `cgs-release-checklist`.
- [ ] 5.5 Generate standards skills `cgs-standards-gameplay`, `cgs-standards-tests`, `cgs-standards-prototype`, and `cgs-standards-ui`.
- [ ] 5.6 Add validation that rejects missing, stale, or malformed generated skill packages.
- [ ] 5.7 Run `npm test -- tests/skills.test.ts tests/project-workflow.test.ts tests/validation.test.ts`.

## 6. Runtime Inspection and Compatibility

- [ ] 6.1 Add failing `tests/runner.test.ts` coverage that root-mode `run --dry-run` resolves cwd when `.codex/studio.json` exists.
- [ ] 6.2 Update dry-run output to show the runtime prompt path, custom-agent TOML path, and selected skill paths.
- [ ] 6.3 Preserve explicit `--project` support for legacy nested projects during migration.
- [ ] 6.4 Add `status` output that points to root `.codex/agents/` and `.agents/skills/` catalogs.
- [ ] 6.5 Run `npm test -- tests/runner.test.ts tests/project-workflow.test.ts`.

## 7. Template Smoke and Optional Codex Probe

- [ ] 7.1 Add `tests/template-root-smoke.test.ts` that builds a temp clone-style root and runs root initialization.
- [ ] 7.2 Assert the temp root has game-facing `AGENTS.md`, `.codex/agents/*.toml`, `.agents/skills/**`, root game `src/`, and root game `docs/`.
- [ ] 7.3 Assert no default `projects/<slug>/`, root maintainer docs, root package TypeScript source, `.codex/agents/*.md`, coding-standard `.codex/rules/*.rules`, or default `.codex/hooks.json` exists.
- [ ] 7.4 Add an optional Codex debug probe that runs only when `codex` is installed and authenticated, verifying repository skills are visible from the temp root.
- [ ] 7.5 Run `npm test -- tests/template-root-smoke.test.ts`.

## 8. Public Docs, Truth, and Final Validation

- [ ] 8.1 Update user-facing setup docs and README to show `git clone <repo> my-game` as the primary install path.
- [ ] 8.2 Document nested project mode only as a legacy migration escape hatch.
- [ ] 8.3 Update truth docs only after functional code and tests land; keep Truthmark maintenance docs out of game-facing root `docs/`.
- [ ] 8.4 Run `npm run validate` before any parity or completion claim.
- [ ] 8.5 Run `truthmark check --json`, `truthmark index --json`, `git diff --check`, `openspec validate repository-root-codex-game-studio --strict --json`, and `openspec status --change repository-root-codex-game-studio --json`.
