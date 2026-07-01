# Skill And Prompt Performance Eval Framework

This is Open Game Studio's maintainer-only framework for evaluating how skills, workflow prompts, and agent-facing surfaces perform in realistic runs.

It follows the CCGS pattern of catalog → rubric → behavioral scenario, and the Truthmark pattern of manual workflow-quality runs with deterministic boundaries, semantic judging, human review, and token tracking.

Normal game-project users do not need this folder. It is not a hidden runtime, daemon, hosted service, or downstream requirement. If a downstream game repository only wants to build a game and not maintain Open Game Studio's prompt surfaces, users may delete `eval-framework/` and the related maintainer-only OpenSpec change files from their copy.

## What this evaluates

- Whether a skill or workflow is triggered for the right task.
- Whether the agent selects bounded context instead of loading the whole repository.
- Whether output quality matches the rubric and scenario contract.
- Whether write boundaries are respected.
- Whether verification is run or explicitly blocked.
- Whether the final report gives a human reviewer a useful verdict, risks, changed files, and next owner.
- Raw token usage and selected evaluation model for comparing prompt and workflow-surface changes over time.

## What this does not evaluate

- A pass is never awarded merely because a skill file is present.
- A pass is never awarded merely because a prompt contains a literal phrase.
- The framework is not a package-install gate for normal users.
- The framework does not enforce token-budget thresholds by default.

## Files

```text
eval-framework/
├── catalog.json              # targets, rubrics, scenarios, runner hosts
├── rubrics/                  # deterministic gates + semantic dimensions
├── scenarios/                # realistic task prompts and expected boundaries
├── failure-taxonomy.md       # stable failure labels
├── improvement-loop.md       # how to turn failures into small fixes
└── runs/                     # repository-saved evaluation summaries and compact audit files
```

## First-pass coverage

This pass covers 31 behavior scenarios:

| Area | Count | Examples |
|---|---:|---|
| Workflow prompts | 12 | `vertical-slice`, `bugfix`, `playtest`, `ship-check`, `sprint-plan` |
| Skills | 12 | `cgs-gate-check`, `cgs-skill-test`, `cgs-skill-improve`, `cgs-code-review` |
| Role prompts | 7 | `producer`, `qa-playtester`, `gameplay-programmer`, `release-manager` |

This is not CCGS full parity. It is the first practical coverage threshold for the highest-risk workflow, skill-maintenance, QA/review/gate, and role-cluster surfaces.

## Evaluation model and token estimation

- Default manual evaluation model: `gpt-5.3-codex-spark`.
- Allowed models are listed in `catalog.json` under `modelPolicy.allowedEvaluationModels`.
- A manual runner may override the model per scenario or batch with the Codex `--model` value, but the selected model must be recorded in the run report and audit JSON.
- Token estimation is part of normal evaluation planning: estimate token usage before each staged run from the selected model, scenario count, expected context, and expected output/reasoning size.
- Every run should record raw token usage when the host exposes it: input, cached input, output, reasoning output, and total tokens.
- The framework does not estimate or record money cost.

## Gradual evaluation plan

You do not need to evaluate every skill and prompt at once. Use the staged plan in `catalog.json`:

1. `smoke-critical` — run only the smallest critical workflow/skill/role set first.
2. `workflow-high-risk` — expand to high-priority workflow prompts.
3. `skill-maintenance` — evaluate skill-maintenance, gate, QA, review, and evidence skills.
4. `role-boundary` — evaluate role ownership and handoff boundaries.
5. `full-regression` — run all scenarios only before broad prompt-surface releases or after large refactors.

## Manual run shape

A future runner should follow this contract:

1. Materialize the scenario fixture or use the current repository when the scenario says so.
2. Run one agent attempt with the scenario prompt.
3. Collect trace evidence, changed files, final report, verification output, and raw token usage.
4. Apply deterministic gates first.
5. Run semantic judges only after deterministic boundary checks are available.
6. Write a repository-saved run directory under `eval-framework/runs/<timestamp>-<stage-or-scenario>/`.
7. Save `summary.md` for human review and `audit.json` for machine-readable scenario results, selected model, raw token usage, trace references, failure labels, changed files, verification evidence, and recommended follow-up fixes.

Evaluation results are repository artifacts when intentionally preserved. Do not rely on chat transcript as the record; commit the selected `eval-framework/runs/...` summary and audit files when an evaluation result should survive.
