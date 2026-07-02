## Context

`src/ccgs-parity.ts` already inventories CCGS agents, skills, workflow steps, templates, and rules, then writes JSON and Markdown parity reports. The previous cleanup added `references/ccgs-remaining-gap-tasks.md` by hand from that data.

The next gap-closing step should make that report deterministic before touching the larger role/workflow/template backlog. This keeps the backlog reviewable and lets future implementation passes prove they reduced the remaining gap count.

## Goals / Non-Goals

**Goals:**

- Derive remaining-gap summary counts from `ParityMatrix.rows`.
- Render a stable Markdown task report from rows whose status is not `implemented` or `out-of-scope`.
- Write the report from the same `writeParityReports` path that writes the parity matrix.
- Test the report with a small fixture matrix before implementation.

**Non-Goals:**

- Do not mark any additional CCGS role, workflow, template, rule, or skill row implemented.
- Do not add new CLI commands.
- Do not archive this OpenSpec change in the same commit; the active change is the implementation ledger.

## Decisions

1. Add pure helper functions in `src/ccgs-parity.ts` rather than a separate report module.
   - Rationale: the report depends only on `ParityMatrix` and should be generated alongside existing parity artifacts.
   - Alternative rejected: keep a manually maintained Markdown file. It drifts and cannot prove count reductions.

2. Treat remaining gaps as rows where `status` is `todo` or `deferred`.
   - Rationale: `implemented` rows are complete and `out-of-scope` rows should not appear as work.
   - Alternative rejected: use `decision !== adapt`. Adopt/adapt/merge/defer describe mapping strategy, not completion state.

3. Render a concise grouped Markdown report instead of duplicating every row field.
   - Rationale: the matrix remains the detailed source of truth; this report is the next-work queue.
   - Alternative rejected: embed the full matrix again, which makes review noisy without adding decisions.

## Risks / Trade-offs

- Risk: regenerated reports change hashes for workflow targets even when source did not change. Mitigation: only keep report changes that are caused by deterministic renderer changes and inspect diffs before staging.
- Risk: the generated report may be less narrative than the manual report. Mitigation: keep category-specific headings and short action guidance while deriving row lists from the matrix.
