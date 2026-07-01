# Failure Taxonomy

Use stable labels when reviewing skill and prompt performance eval failures.

- `skill-not-triggered`: the expected skill or workflow prompt was not used.
- `wrong-workflow`: the agent selected a different workflow lane.
- `over-triggered-workflow`: the agent ran a write workflow for a read-only review task.
- `missing-required-context`: the agent skipped required skill, workflow, rubric, template, or project-state context.
- `wrong-role-routing`: the prompt routed work to the wrong studio role.
- `forbidden-surface-write`: the agent modified skill, workflow, template, or source surfaces during an eval-only task.
- `missing-required-artifact`: the agent did not produce the expected report, plan, or evidence artifact.
- `verification-skipped-without-rationale`: required checks were neither run nor explained.
- `report-invalid`: the report is absent, malformed, or missing required evidence fields.
- `weak-human-review`: the output lacks a verdict, risks, next owner, or decision point.
- `token-bloat`: the agent loaded or repeated unnecessary context for the scenario.
- `judge-not-evaluable`: semantic judge output was missing, malformed, or insufficient.
