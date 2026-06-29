# Prompt Uplift Evaluation Protocol

This protocol is for optional manual Codex evaluation runs after deterministic validation passes.

## Scope

Evaluate prompt-surface behavior for:

- `cgs-design-system`
- `cgs-prototype`
- `cgs-vertical-slice`
- `cgs-bugfix`
- `cgs-release-checklist`
- `.codex/workflows/vertical-slice.md`
- `.codex/workflows/bugfix.md`
- `.codex/workflows/prototype.md`
- `.codex/workflows/release-checklist.md`

## Model routing

- Complex design, architecture, production, and release-gate work uses `gpt-5.5` with high reasoning effort.
- Moderate implementation, QA, docs, bugfix, and bounded workflow work uses `gpt-5.4` with medium reasoning effort.
- Simple help, status, classification, checklist, and small lookup work uses `gpt-5.4-mini` with low reasoning effort.

## Manual scenarios

For each target surface:

1. Run the relevant command in dry-run mode first.
2. Confirm the selected model, reasoning effort, source surface, output contract, and stop conditions are visible.
3. Run the prompt only when the dry-run context is bounded and the write policy is acceptable.
4. Check the output for required sections, verification evidence, changed files or proposed files, blockers, and next owner.
5. Record failures as prompt-surface bugs, not as hidden runtime fallbacks.

## Pass criteria

A prompt passes when it:

- uses the exact routed Codex model;
- refuses missing project state or unsafe write scope;
- produces the declared output contract;
- names verification evidence or a concrete verification blocker;
- does not use Claude model names or Claude tool names as active runtime policy;
- does not generate or overwrite template prompt bodies during `init`.
