# Scenario: workflow.game-feel-tuning behavior

Evaluate game-feel tuning evidence, parameter discipline, and comparison notes.

## Required context

- `.codex/workflows/game-feel-tuning.md`
- `.agents/skills/cgs-balance-check/SKILL.md`
- `templates/game_feel_tuning_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/game-feel-tuning-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
