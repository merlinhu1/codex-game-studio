---
status: active
doc_type: openspec-index
last_reviewed: 2026-06-29
openspec_change: repository-root-codex-game-studio
source_of_truth:
  - "../../openspec/changes/repository-root-codex-game-studio/proposal.md"
  - "../../openspec/changes/repository-root-codex-game-studio/design.md"
  - "../../openspec/changes/repository-root-codex-game-studio/tasks.md"
  - "../../openspec/changes/repository-root-codex-game-studio/specs/repository-root-template/spec.md"
  - "../../openspec/changes/repository-root-codex-game-studio/specs/codex-native-game-surfaces/spec.md"
  - "../../openspec/changes/repository-root-codex-game-studio/specs/game-facing-repository-boundary/spec.md"
---

# Codex-Native Repository-Root Game Studio Plan

This plan is now OpenSpec-backed. The canonical proposal, design, requirements, and implementation checklist live under:

```text
openspec/changes/repository-root-codex-game-studio/
```

## Core invariant

Codex Game Studio should follow the CCGS installation strategy: the cloned repository is the game root. A new game starts with:

```bash
git clone <repo> my-game
cd my-game
codex
```

Root `AGENTS.md`, `.codex/agents/*.toml`, and `.agents/skills/*/SKILL.md` must guide game development. Root `src/` and `docs/` are game-facing paths and must not contain Codex Game Studio package-maintainer source, implementation plans, Truthmark maintenance docs, or maintenance agents.

## OpenSpec artifacts

- Proposal: `openspec/changes/repository-root-codex-game-studio/proposal.md`
- Design: `openspec/changes/repository-root-codex-game-studio/design.md`
- Tasks: `openspec/changes/repository-root-codex-game-studio/tasks.md`
- Requirements:
  - `openspec/changes/repository-root-codex-game-studio/specs/repository-root-template/spec.md`
  - `openspec/changes/repository-root-codex-game-studio/specs/codex-native-game-surfaces/spec.md`
  - `openspec/changes/repository-root-codex-game-studio/specs/game-facing-repository-boundary/spec.md`

## Validation

Use these commands after editing the OpenSpec change:

```bash
openspec validate repository-root-codex-game-studio --strict --json
openspec status --change repository-root-codex-game-studio --json
git diff --check
```

Current OpenSpec status when this index was written: all required artifacts are present and `openspec validate repository-root-codex-game-studio --strict --json` passes.
