# Full Remaining Prompt Evaluation — 2026-07-10

- **Run ID:** `20260710T194320Z-full-regression-remaining`
- **Stage:** `full-regression-remaining`
- **Source commit:** `1c3761fdc4a20d7e0e71efb254314b6d5a2545a2`
- **Model:** `gpt-5.3-codex-spark` (the catalog's configured default)
- **Scope:** every catalog scenario not already covered by the accepted smoke run.

## Result

**27/27 remaining scenarios passed their deterministic contracts.** Together with the accepted smoke run (`20260710T192217Z-smoke-critical`), the catalog now has **31/31 scenarios with deterministic execution evidence**.

For every scenario in this run:

- Codex exited successfully.
- Required reads were found in the event trace; scenario prompts were supplied on stdin.
- Exactly the expected evaluation report appeared in the fixture-status delta.
- No forbidden `src/`, `.agents/skills/`, `.codex/workflows/`, `.codex/agents/`, or `templates/` change appeared.
- The agent trace included `npm run validate`, and the controller's independent validation exited `0`.
- Required report sections—verdict, evidence, risks, verification notes, and next owner—were present.

## Semantic-review boundary

This is a **deterministic full-regression pass**, not independent quality certification. Each executing agent supplied an evaluation report and verdict, but the 27 reports did **not** receive a separate human or LLM judge pass. Their reported cautions are preserved in `audit.json` and should drive targeted follow-up rather than be treated as independently confirmed defects.

## Most Important Agent-Reported Follow-ups

### Prompt/workflow candidates

1. **Market-analysis workflow:** reported conditional failure because it does not explicitly bind the market-analysis and pitch templates or enforce a bounded competitor/positioning output schema.
2. **UI/UX-review workflow:** reported role-routing inconsistency (`ui-ux-designer` in the workflow versus `game-designer` in the linked skill), plus weak template binding.
3. **Playtest workflow:** reported missing explicit binding to the playtest-report and test-evidence templates; trigger mapping is also advisory.
4. **`cgs-skill-improve`:** reported that smallest-useful-fix selection is documented externally but not an explicit in-skill gate.

### Fixture/input-limited scenarios

These reports correctly refused to overclaim because the initialized fixture intentionally had no real feature/session evidence:

- **`cgs-story-done`:** no acceptance criteria, changed-file evidence, or handoff data.
- **`cgs-qa-plan`:** no concrete feature scope, target files, or acceptance criteria.
- **`cgs-test-evidence-review`:** no test-evidence package to review.
- **Gameplay Programmer role:** no bounded implementation plan, changed gameplay files, or gameplay verification evidence.

Those are scenario-fixture limitations, not demonstrated prompt regressions.

## Raw Token Fields

| Field | Total |
|---|---:|
| Input tokens | 4,258,018 |
| Cached input tokens | 3,512,064 |
| Output tokens | 132,865 |
| Reasoning output tokens | 90,244 |
| Reported-field sum | 7,993,191 |

These are raw values from Codex `turn.completed` events. The reported-field sum is a mechanical total, **not** a provider-billing or pricing claim.

## Isolation Note

Each scenario used a fresh initialized Godot fixture in a disposable detached Git worktree and a separate `CODEX_HOME`. The host cannot create Bubblewrap namespaces for Codex `workspace-write`, so this run used native `danger-full-access` inside those disposable fixtures, with global Codex config and rules ignored. The fixture worktrees and temporary auth homes were removed after evidence capture.

## Artifacts

- `audit.json` — machine-readable verdicts, deterministic gate evidence, raw tokens, trace paths, and agent-reported semantic verdicts.
- `status/records.jsonl` — one execution record per scenario.
- `traces/`, `final/`, `reports/`, `diffs/`, `verification/` — compact execution evidence.

## Recommended Next Step

Do one targeted **independent semantic-review pass** over the four prompt/workflow candidates above, then decide whether to patch and rerun only those scenarios. Do not “fix” the fixture-limited reports until supplying real game/project evidence fixtures.
