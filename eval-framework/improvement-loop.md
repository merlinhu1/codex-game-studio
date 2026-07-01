# Improvement Loop

When a skill or prompt performance eval fails:

1. Read the run report first, then use machine-readable audit data for scenario verdicts, changed-file summaries, deterministic failures, judge summaries, and token usage.
2. Record a human review as `accepted`, `rejected`, `needs-rerun`, or `not-evaluable`.
3. Classify failures with labels from `failure-taxonomy.md`.
4. Choose the smallest fix target:
   - skill text when task procedure or handoff language misled the agent;
   - workflow prompt text when role routing, context selection, or stop conditions were weak;
   - rubric text when the expectation was underspecified;
   - scenario fixture when the setup did not isolate the intended behavior;
   - deterministic validator when an objective boundary violation was missed;
   - judge prompt/schema when semantic scoring was malformed.
5. Promote real failures into minimal scenarios instead of checking in large run artifacts.
6. Rerun the scenario and compare reports plus raw token counts.

LLM judge scores are advisory until calibrated by human review. Deterministic boundary failures remain failures even if a semantic judge likes the final prose.
