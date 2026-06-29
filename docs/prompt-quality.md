# Prompt Quality Standard

## Purpose

This document is the source of truth for gradually improving Codex Game Studio agents, skills, and workflows.

Prompt quality means the tracked template surfaces help Codex choose the right owner, load the right context, take bounded action, verify the result, and hand off cleanly.

Prompt quality does not mean making every prompt longer. Improvements should remove generic boilerplate, add task-specific judgment, and prove better behavior with evaluations.

## Scope

This standard applies to tracked prompt surfaces:

- `.codex/agents/*.toml`
- `.codex/workflows/*.md`
- `.agents/skills/*/SKILL.md`
- supporting references, templates, examples, and evaluation fixtures linked from those surfaces

Project initialization must not synthesize or overwrite these prompt bodies. Improvements land as reviewable repository changes.

## Reference basis

This standard is derived from current major-provider guidance:

- Anthropic, [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): concise skills, discovery descriptions, progressive disclosure, degrees of freedom, workflows, and evaluation-first iteration.
- Anthropic, [Building effective agents](https://www.anthropic.com/research/building-effective-agents): distinction between predictable workflows and flexible agents, and the recommendation to use the simplest effective agentic system.
- OpenAI, [GPT-4.1 Prompting Guide](https://cookbook.openai.com/examples/gpt4-1_prompting_guide): persistence, tool-use reminders, planning, prompt organization, examples, and conflict reduction.
- OpenAI, [Agents SDK documentation](https://openai.github.io/openai-agents-python/): production agent primitives such as tools, handoffs, guardrails, sessions, tracing, and structured tool behavior.
- Google, [Gemini prompting strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies): clear instructions, few-shot examples, agentic workflow dimensions, persistence, recovery, and risk assessment.
- Microsoft, [Azure OpenAI prompt engineering concepts](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/prompt-engineering): instruction clarity, examples, output priming, and structured prompt components.

## Quality principles

### 1. Evaluation before expansion

Write or update evaluations before adding broad prompt text.

A prompt improvement should begin with an observed failure or risk:

- wrong agent or skill selected;
- context loaded too broadly or too narrowly;
- task crosses role ownership without handoff;
- output omits required evidence;
- blocker, warning, and assumption are mixed together;
- model guesses instead of using files or tools;
- workflow advances without entry criteria, exit criteria, or verification.

Then add the smallest prompt change that fixes the failure.

### 2. Progressive disclosure

Main prompt files should be concise entry points.

Use supporting files when details are useful but not always needed:

```text
.agents/skills/cgs-prototype/
  SKILL.md
  references/examples.md
  references/checklist.md
  templates/handoff.md
```

`SKILL.md` should select and steer the task. Examples, long checklists, style guides, and domain details should live in linked files.

### 3. Strong discovery metadata

Descriptions are selection metadata, not labels.

Weak:

```toml
description = "Game development Game Designer agent for game-designer tasks in this template repository."
```

Better:

```toml
description = "Owns implementable gameplay mechanics, tuning variables, edge cases, player-facing acceptance criteria, and feature-scope decisions for bounded game-design tasks."
```

Every description should answer:

- What task does this surface own?
- When should Codex select it?
- What does it not own?
- Which keywords should retrieval and selection see?

### 4. Match freedom to risk

Use the least restrictive prompt that still protects quality.

| Freedom | Use for | Prompt shape |
| --- | --- | --- |
| High | Brainstorming, market exploration, early creative ideation | Goals, heuristics, examples, broad output options |
| Medium | Prototype plans, design specs, sprint planning, bounded implementation | Ordered phases, decision gates, output contract |
| Low | Release gates, migrations, security, localization handoff, irreversible edits | Exact checklist, entry criteria, stop conditions, required evidence |

High-risk workflows need explicit steps and stop conditions. Open-ended roles need judgment boundaries and good examples.

### 5. Separate agents, skills, and workflows

Each surface type has a different job.

| Surface | Owns | Should emphasize |
| --- | --- | --- |
| Agent | Role ownership and judgment | Domain responsibility, allowed tools, handoff rules, stop conditions |
| Skill | How to perform a task well | Trigger, procedure, examples, verification, failure modes |
| Workflow | Repeatable process sequence | Entry criteria, ordered steps, gates, required artifacts, exit criteria |

Do not make workflows read like role prompts. Do not make skills repeat generic agent policy.

### 6. Examples over repeated rules

Use short examples where behavior is ambiguous.

Good examples include:

- release blocker vs warning;
- bug reproduction and regression evidence;
- prototype hypothesis and success signal;
- design acceptance criteria;
- localization context notes;
- QA test matrix;
- handoff with changed files and verification.

Examples should demonstrate the output shape and edge-case judgment. They should not be long tutorials.

### 7. Tool use and grounding are explicit

Prompt surfaces should tell Codex when to inspect files, run commands, or stop.

A good surface distinguishes:

- required context;
- optional context;
- prohibited broad scans;
- allowed write targets;
- verification commands or manual inspection alternatives;
- conditions that require asking, stopping, or handing off.

Avoid instructions that encourage guessing. If file contents, project state, or verification evidence matter, the surface should require tool-backed grounding.

### 8. Guardrails and handoffs are first-class

Every nontrivial workflow should define:

- input guardrails: required project state, target files, approvals, write scope;
- tool guardrails: allowed file areas, commands, asset classes, and forbidden operations;
- output guardrails: required sections and evidence;
- handoff rules: target role, handoff payload, and when no handoff is needed;
- traceability: files inspected, commands run, decisions made, blockers left.

This mirrors production-agent guidance around tools, guardrails, handoffs, and tracing.

### 9. Prefer consistency without copy-paste sameness

A common skeleton is useful. Repeated generic content is not.

If many surfaces share the same paragraph, move the shared rule to `AGENTS.md`, a common reference, or validation logic. Use the surface body for domain-specific judgment.

Bad repeated text:

```md
Inspect relevant files. Make the smallest change. Verify. Report evidence.
```

Better skill-specific text:

```md
Before editing a bugfix, reproduce or identify the failing behavior. If reproduction is impossible, state the missing input and stop before speculative edits. After editing, run the narrowest regression test or explain the manual inspection substitute.
```

## Required structure by surface

### Agent TOML

Agent files should include:

- strong `description` as discovery metadata;
- exact `model` and `model_reasoning_effort`;
- primary skills;
- allowed tool categories;
- invocation guidance;
- stop conditions;
- role-specific responsibilities;
- inputs to inspect;
- expected outputs;
- quality gates;
- handoff contract.

Agent prompts should not include long workflow procedures. Link or rely on workflows and skills for process details.

### Skill `SKILL.md`

Skills should include:

- concise frontmatter description with trigger and ownership;
- argument hint;
- model policy;
- primary agent;
- tool policy;
- source reference when adapted from upstream;
- purpose;
- when to use and when not to use;
- compact procedure;
- decision gates;
- output contract;
- verification contract;
- failure modes;
- links to examples or templates when needed.

Keep the main file short enough that loading it is cheap. Move large examples and checklists into references.

### Workflow Markdown

Workflows should include:

- model policy;
- primary agent;
- linked skills;
- phase and risk;
- argument hint;
- entry criteria;
- required inputs;
- ordered steps;
- decision gates;
- required artifacts;
- verification;
- stop conditions;
- exit criteria;
- handoff contract.

Workflows are process contracts. They should be more procedural and less persona-like than agents.

## Evaluation requirements

Prompt-quality work should include at least one of these evidence types:

- unit test for metadata, validation, or routing;
- deterministic behavioral evaluation scenario;
- prompt audit output showing improved specificity or reduced duplication;
- manual eval transcript recorded under a reference file;
- before/after failure example with expected behavior.

Representative eval scenarios should cover:

- correct surface selection;
- missing required context;
- role handoff boundary;
- output contract adherence;
- verification evidence;
- blocker vs risk separation;
- no generated prompt-body side effects;
- model routing by task complexity.

## Improvement checklist

Use this checklist for gradual upgrades.

```text
Prompt quality pass:
- [ ] Identify the observed failure, weak behavior, or duplicated boilerplate.
- [ ] Add or update an evaluation that would catch it.
- [ ] Strengthen discovery metadata before expanding body text.
- [ ] Remove repeated generic prose or move it to shared guidance.
- [ ] Add task-specific examples where behavior is ambiguous.
- [ ] Add entry criteria, exit criteria, stop conditions, and handoff payloads where needed.
- [ ] Verify exact model routing and reasoning effort.
- [ ] Run validation and prompt-surface tests.
- [ ] Update docs or Truthmark routing if behavior-bearing surfaces changed.
```

## Anti-patterns validation should catch

Validation should flag or warn on:

- descriptions that only restate the file or role name;
- descriptions without selection triggers;
- missing `model` or non-exact model names;
- missing argument hints for user-invocable skills or workflows;
- high-risk workflows without entry criteria, stop conditions, and verification;
- skill bodies over a size threshold without references;
- near-duplicate sections across many skills;
- examples absent from ambiguous high-impact surfaces;
- workflow files that read like agent personas;
- agent files that contain long process checklists better owned by workflows;
- output contracts without evidence requirements;
- handoff language without a next-owner rule.

## Prioritized roadmap

### P0: Discovery metadata rewrite (implemented)

Discovery metadata now has deterministic validation and audit coverage. Maintain descriptions and argument hints before expanding prompt bodies.

Targets:

- `.codex/agents/*.toml`
- `.agents/skills/*/SKILL.md`
- `.codex/workflows/*.md`

### P1: Behavioral eval suite

Add evals for:

- prototype with ambiguous scope;
- bugfix with missing reproduction;
- release checklist with blocker classification;
- vertical slice with task decomposition;
- design-system update with acceptance criteria;
- localization with context and string-freeze constraints.

### P1: Progressive disclosure split

For the most important skills, move examples, templates, and long checklists into supporting files.

Start with:

- `cgs-prototype`
- `cgs-bugfix`
- `cgs-release-checklist`
- `cgs-vertical-slice`
- `cgs-design-system`
- `cgs-localize`

### P2: Workflow contract normalization

Normalize workflow bodies around entry criteria, ordered steps, decision gates, required artifacts, verification, exit criteria, and handoff.

### P2: Deduplication audit

Compute prompt similarity and flag repeated generic sections. Keep shared policy in one place; reserve prompt bodies for task-specific judgment.

### P3: Model-specific quality checks

Test that simple surfaces work with `gpt-5.4-mini`, moderate surfaces with `gpt-5.4`, and complex surfaces with `gpt-5.5`.

Lower-capability or cheaper routes need more explicit compact instruction. Higher-capability routes should avoid over-explaining.

## Definition of done

A prompt-quality change is done when:

- the changed surface has a clear owner and selection trigger;
- the main prompt body is concise and not mostly boilerplate;
- task-specific examples or references exist where ambiguity is common;
- entry, exit, stop, verification, and handoff rules are explicit where risk warrants them;
- at least one test, audit, or evaluation proves the improvement;
- repository validation passes;
- this document remains consistent with the implemented standard.
