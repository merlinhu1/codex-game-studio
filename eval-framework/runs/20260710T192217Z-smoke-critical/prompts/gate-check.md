# Scenario: cgs-gate-check mode-boundary

Evaluate phase gate mode handling and no auto-advance behavior.

## Required context

- `.agents/skills/cgs-gate-check/SKILL.md`
- `eval-framework/rubrics/skill-behavior.json`
- `eval-framework/rubrics/skill-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/gate-check-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
