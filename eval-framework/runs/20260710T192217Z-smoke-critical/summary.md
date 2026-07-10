# Smoke-Critical Prompt Evaluation — 2026-07-10

- **Run ID:** `20260710T192217Z-smoke-critical`
- **Stage:** `smoke-critical`
- **Source commit:** `1c3761fdc4a20d7e0e71efb254314b6d5a2545a2`
- **Model:** `gpt-5.3-codex-spark` (the catalog's configured default)
- **Runner:** Codex CLI, one fresh initialized Godot fixture per scenario.

## Result

**4/4 deterministic scenario contracts passed.** Each agent run exited successfully, created only its allowed evaluation report, and was followed by an independent `npm run validate` pass.

| Scenario | Deterministic result | Manual semantic review | Main caution |
|---|---|---|---|
| `workflow.vertical-slice.behavior` | Pass | Pass with cautions | No canonical trigger phrase; token-discipline guardrails are advisory only. |
| `workflow.bugfix.behavior` | Pass | Pass with cautions | No seeded defect, so this measures process/reporting—not a real reproduction-and-fix outcome. |
| `skill.cgs-skill-test.behavioral-spec` | Pass | Pass with cautions | The rubric does not explicitly reject existence-only checks. |
| `skill.cgs-gate-check.mode-boundary` | Pass | Pass with cautions | The initialized fixture lacks populated active session state. |

## Deterministic Evidence

For every scenario:

- Required target context and rubric reads are recorded in `traces/*.jsonl`; the scenario prompt itself was supplied to Codex on stdin.
- The trace records only the expected `production/session-state/*.md` report write. The detached fixture's tracked diff was empty.
- The expected report was captured under `reports/`.
- The agent executed `npm run validate`, and the controller independently reran it successfully (`status/*verifier-exit-code.txt` is `0`).

## Raw Token Usage

| Scenario | Input | Cached input | Output | Reasoning output | Reported-field sum |
|---|---:|---:|---:|---:|---:|
| vertical slice | 81,415 | 60,672 | 3,976 | 2,451 | 148,514 |
| bugfix | 122,111 | 77,056 | 5,026 | 3,708 | 207,901 |
| skill test | 78,355 | 58,880 | 3,242 | 2,377 | 142,854 |
| gate check | 144,728 | 102,528 | 4,748 | 3,153 | 255,157 |
| **Total** | **426,609** | **299,136** | **16,992** | **11,689** | **754,426** |

Token fields are raw values emitted by Codex `turn.completed`. The final column is a mechanical sum of those fields, **not** a pricing or provider-billing claim.

## Isolation and Runner Note

Every scenario used a disposable detached Git worktree, an isolated `CODEX_HOME`, and a fresh initialized fixture. The preferred `workspace-write` Codex sandbox failed on this host because Bubblewrap could not create a user namespace. The accepted rerun therefore used Codex's native `danger-full-access` policy **only inside those disposable worktrees**, with global user config and rules ignored. Fixture worktrees and temporary auth homes were removed after evidence capture.

The immediately preceding run, `20260710T191701Z-smoke-critical`, is retained as **infrastructure-blocked evidence**: all four attempts hit the Bubblewrap namespace failure before file reads/writes. It is not used for the accepted scenario results.

## Follow-up Recommendations

1. Add an executable prompt-evaluation runner that detects allowed **untracked** report files; `git diff --name-only` alone misses them.
2. Add a concrete seeded defect fixture for the bugfix scenario before using it as evidence of repair quality.
3. Make the `cgs-skill-test` anti-existence criterion explicit in the scenario/rubric.
4. Decide whether token discipline needs enforceable limits instead of an advisory semantic note.
5. Prefer a containerized evaluator on hosts that cannot create Bubblewrap namespaces.
