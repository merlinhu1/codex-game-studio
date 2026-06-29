# Design: Codex Prompt Surface Uplift

## Evidence Baseline

Current local surfaces in `/opt/data/repos/open-gamestudio`:

- `.codex/agents/*.toml`: 38 files.
- `.codex/workflows/*.md`: 31 files.
- `.agents/skills/*/SKILL.md`: 79 files.

Reference CCGS surfaces in `/opt/data/repos/Claude-Code-Game-Studios`:

- `.claude/agents/*.md`: 49 files.
- `.claude/skills/*/SKILL.md`: 73 files.
- Large reference examples include `ux-design` at 989 lines, `design-system` at 871 lines, `setup-engine` at 716 lines, `prototype` at 579 lines, and `game-designer` at 241 lines.

Local gaps include `cgs-prototype` at 60 lines, `game-designer.toml` at 58 lines, and `vertical-slice.md` at 38 lines.

## OpenAI Codex Runtime Constraints

The implementation must follow current OpenAI Codex documentation:

- `AGENTS.md` is discovered from repository root to current working directory. Nested instructions override earlier root guidance, and `project_doc_max_bytes` defaults to 32 KiB, so detailed procedures belong in skills/workflows rather than an oversized root file.
- Skills use progressive disclosure: Codex initially sees name, description, and path, then loads `SKILL.md` only after selecting the skill.
- Skills may include optional `agents/openai.yaml` metadata for UI/invocation policy and dependencies.
- Codex configuration supports exact `model`, `model_reasoning_effort`, and `model_verbosity` values.
- Codex CLI supports launching or switching with exact model names such as `codex --model gpt-5.5`.
- Project-local `.codex/config.toml` cannot override provider/profile/telemetry settings, so this change must not rely on project-local provider config.

## Model Routing

Use exact model names, not abstract tiers:

| Task class | Model | Reasoning effort |
| --- | --- | --- |
| Complex design, architecture, production gates, ship/no-ship review | `gpt-5.5` | `high` or `xhigh` when explicitly justified |
| Moderate implementation, QA planning, technical docs, bounded workflow execution | `gpt-5.4` | `medium` |
| Simple status, help, classification, changelog formatting, checklist extraction | `gpt-5.4-mini` | `low` or `minimal` |

Any lower-tier surface may escalate to `gpt-5.5` when it detects cross-discipline tradeoffs, conflicting source-of-truth files, release impact, irreversible writes, or high uncertainty.

## Metadata Architecture

Add `src/prompt-surface-metadata.ts` as the typed home for:

- `CodexModelName = "gpt-5.5" | "gpt-5.4" | "gpt-5.4-mini"`.
- `ReasoningEffort = "minimal" | "low" | "medium" | "high" | "xhigh"`.
- `ModelPolicy` with exact model, reasoning effort, verbosity, escalation rules, and no-silent-fallback behavior.
- `ToolPolicy` using Codex-native categories rather than Claude tool names.
- `SourceTraceability` with source path, source hash, adaptation decision, and rationale.
- `SurfaceLinks` with primary agent, related skills, workflows, templates, and output artifacts.

Validation should consume this schema for tracked TOML, Markdown frontmatter, and runtime-rendered prompts.

## Surface Contracts

### Agents

Every `.codex/agents/*.toml` must declare model policy, invocation guidance, linked skills, tool policy, memory/scope policy, source traceability, and a deep `developer_instructions` body. The body should include role responsibilities, use cases, do-not-use cases, input contract, procedure, quality gates, output schema, stop conditions, and handoff format.

### Skills

Every `.agents/skills/*/SKILL.md` must carry frontmatter for exact model policy, invocation metadata, agent routing, tool policy, isolation, source traceability, and user-invocable status. The body should include purpose, prerequisites, argument parsing, phase-by-phase procedure, decision gates, write targets, examples, output contract, quality gates, failure modes, verification, and handoff.

Large CCGS-derived skills must not remain short wrappers unless the adaptation rationale explains why the upstream procedure is out of scope.

### Workflows

Every `.codex/workflows/*.md` must include frontmatter with workflow ID, exact model policy, primary agent, linked skills, phase, risk, argument hint, and source references. The body should define prerequisites, selected context, phase gates, artifacts, acceptance criteria, and final report format.

### Runtime Prompts

Runtime prompts must include resolved model, reasoning effort, selected agent/skill/workflow IDs, context budget, selected files, tool/sandbox policy, stop conditions, output schema, verification contract, and handoff owner. The runner must pass the resolved model to Codex execution.

## CCGS Adaptation Strategy

Use CCGS as source material, not as a format to preserve. Adapt:

- Long-form procedure.
- Domain theory and examples.
- Phase gates and stop conditions.
- Output schemas and handoff requirements.
- Tool and isolation intent.
- Agent-to-skill relationships.

Reject or translate:

- Claude model names.
- Claude tool names.
- Hidden hooks or lifecycle automation.
- Collaboration mechanics that conflict with the Codex runtime or this repo’s autonomy defaults.

## Rollout Strategy

1. Add inventory and quality scoring first.
2. Add metadata schema and model-routing validation.
3. Uplift five pilot surfaces: `cgs-prototype`, `cgs-design-system`, `cgs-vertical-slice`, `game-designer`, and `vertical-slice` workflow.
4. Wire runtime model enforcement.
5. Bulk uplift skills.
6. Bulk uplift agents and workflows.
7. Add behavior evals, docs, and Truthmark updates.

## Risks

- Some model names may not be available in every local Codex environment. The runner must fail clearly and support explicit user override, but must not silently substitute another model.
- Long skills can crowd context if loaded indiscriminately. The design relies on Codex skill progressive disclosure and concise descriptions.
- Bulk rewrites can regress behavior. Pilot surfaces and validation must land before bulk adaptation.
- Source traceability can become stale. Hash validation must define exactly what is hashed and when adaptation notes are required.
