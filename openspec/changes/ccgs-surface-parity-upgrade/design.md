## Context

The previous repository-root change made CGS clone-injectable and Codex-native, but the generated content is still shallow. For example, current `cgs-vertical-slice` is a short generic wrapper, while CCGS `.claude/skills/vertical-slice/SKILL.md` is a long phase-based production validation workflow with scope rules, recovery checkpoints, playtest debrief questions, verdicts, and report shape.

A preliminary inventory from this checkout found:

| Surface | CGS current | CCGS reference | Immediate gap |
| --- | ---: | ---: | --- |
| Agents / role packages | 38 | 49 | Missing sub-specialists and several renamed or collapsed domains need one-by-one decisions. |
| Generated skills | 11 | 73 | Most CCGS command skills have no CGS equivalent yet. |
| Workflows / workflow catalog steps | 31 workflow IDs | 30 unmatched workflow-catalog step IDs plus phase metadata | CGS has workflows but lacks CCGS phase progression, artifact checks, and gate semantics. |

The plan must compare content quality, not only count files. CCGS agents often include frontmatter, tool/model hints, skills links, collaboration protocol, key responsibilities, forbidden actions, gate verdict formats, output templates, and escalation maps. CCGS skills often include invocation metadata, phase-by-phase context loading, artifact writes, user approval points, recovery checkpoints, quality standards, and concrete report templates.

CGS must adapt those strengths to Codex-native surfaces:

- `.codex/agents/*.toml` for custom agents;
- `.agents/skills/<name>/SKILL.md` for repository skills;
- `.codex/workflows/*.md` and `.codex/prompts/*.md` for current CGS runtime surfaces;
- `AGENTS.md` for project instructions.

CGS must not copy Claude-only mechanics as product behavior. CCGS hooks, AskUserQuestion UI details, `.claude/rules/**`, `.claude/settings.json`, and Claude model/tool metadata are evidence for intent, not implementation formats.

## Goals / Non-Goals

**Goals:**

- Produce a complete machine-readable and human-reviewable parity matrix for every CCGS agent, skill, and workflow-catalog step.
- Decide one action for every row: `adopt`, `adapt`, `merge`, `rename-alias`, `defer`, or `out-of-scope`.
- Upgrade CGS surfaces where CGS is lower quality and the CCGS behavior fits Codex Game Studio.
- Preserve Codex-native file formats and root-mode generated surfaces.
- Add validation and tests so upgraded generated surfaces cannot silently regress to generic wrappers.
- Add cheap deterministic tests by default and keep real agent/LLM behavioral evals manual unless explicitly enabled.

**Non-Goals:**

- Do not promise full CCGS parity based on counts or README claims.
- Do not bulk copy CCGS `.claude/**` files into CGS.
- Do not add hidden lifecycle hooks or autonomous background orchestration.
- Do not use `.codex/rules/*.rules` for coding standards.
- Do not force one CGS surface per CCGS file when a merged Codex-native role or skill is better.
- Do not make Truthmark, OpenSpec, or maintainer workflows part of generated game behavior unless a separate product decision says so.

## Decisions

### Compare one by one before upgrading

Create an audit artifact at `references/ccgs-surface-parity-matrix.json` and a readable summary at `references/ccgs-surface-parity-matrix.md`. The matrix is generated from the CCGS checkout and current CGS registries. Every CCGS agent, skill, and workflow-catalog step gets one row with source path, source type, nearest CGS surface, quality scores, decision, rationale, implementation target, tests, and status.

Alternative rejected: only compare counts or a few representative examples. The user explicitly called out quality and content gaps; aggregate counts would miss thin wrappers and collapsed domain expertise.

### Use a quality rubric, not raw length

Each row receives scores for content depth, procedural specificity, context contract, output contract, role/skill linkage, gate or escalation behavior, Codex fit, and testability. Long CCGS files can still be rejected if they are Claude-only; short CGS surfaces can pass if they cover the required contract.

Alternative rejected: length parity. Long prompts can be noisy, and Codex skill lists can become unusable if every upstream section is copied without adaptation.

### Adapt to Codex-native surfaces

Agents upgrade `src/roles.ts` role packages and `renderProjectCustomAgentToml()` output. Skills upgrade `src/skills.ts` generated definitions and `.agents/skills/**` renderers. Workflows upgrade `src/workflows.ts`, `src/workflow-recipes.ts`, templates, and context manifest selection. CCGS command names become aliases only when they help users migrate and do not conflict with CGS naming.

Alternative rejected: generate `.claude/agents/**` or `.claude/skills/**`. CGS remains a Codex-native product.

### Phase the upgrades by production value

Implement in vertical slices rather than one giant import:

1. Audit tooling and matrix.
2. Agent role-depth pass.
3. Core lifecycle skills and workflows: `start`, `setup-engine`, `brainstorm`, `map-systems`, `design-system`, `create-architecture`, `vertical-slice`, `sprint-plan`, `bug-report`, `release-checklist`, `gate-check`.
4. Discipline/team skills: art, audio, narrative, UI/UX, QA, live ops, release, tests, security, performance.
5. Engine sub-specialists and plugin/domain specialists.
6. Behavioral eval fixtures and manual agent probes.

Alternative rejected: upgrade all 73 skills at once. That would be hard to review and likely import Claude-specific assumptions.

### Validation must catch thin generated wrappers

Validation should check required sections and selected body markers for upgraded surfaces, not just file existence or metadata. For example, vertical-slice must include validation question, scope discipline, recovery checkpoint, playtest debrief, and verdict/report guidance after upgrade.

Alternative rejected: trust renderer snapshots alone. Snapshot freshness proves deterministic generation but not quality.

## Risks / Trade-offs

- Reference checkout availability can vary → store source path and source hash in the matrix and fail clearly when the CCGS reference is missing.
- Over-importing CCGS can bloat Codex context → use matrix decisions and generate only active engine/team subsets by default.
- CCGS collaboration rules may conflict with the user's autonomy preference → adapt approval language to CGS policy and keep mutating runtime explicit.
- Engine sub-specialists may multiply prompt surfaces → materialize only specialists relevant to the selected engine and plugin stack.
- Behavioral evals can burn tokens → keep deterministic structure checks in CI and make real agent probes opt-in.

## Migration Plan

1. Add audit fixtures and matrix generation without changing generated runtime behavior.
2. Commit the baseline matrix so reviewers can inspect every row.
3. Upgrade one domain cluster at a time with focused tests and validation.
4. Refresh the matrix after each cluster and mark rows complete only when implementation, tests, and validation pass.
5. Update README/user guide and Truthmark docs after behavior changes land.
6. Run `npm test`, `npm run validate`, `truthmark check --json`, `truthmark index --json`, `openspec validate ccgs-surface-parity-upgrade --strict --json`, and `git diff --check` before claiming completion.

Rollback: revert the cluster commit and its matrix status changes. Keep the audit tooling so later work can retry a smaller upgrade.

## Open Questions

- Should the CCGS reference path be configurable with `CCGS_REFERENCE_ROOT`, or should tests use checked-in fixtures only?
- Which CCGS collaboration/approval rules should be softened for CGS given the user prefers autonomous execution on their own machine?
- Should merged role decisions retain CCGS aliases such as `qa-lead`, `ux-designer`, and `lead-programmer`, or only record them in migration docs?
- How many generated skills should be active by default before the skill list becomes noisy?
