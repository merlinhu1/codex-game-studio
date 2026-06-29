---
status: superseded
doc_type: design-index
last_reviewed: 2026-06-29
superseded_by:
  - 2026-06-29-codex-native-agent-skill-surfaces.md
---

# Scoped Standards Rule Packs Design

This draft is superseded by [Codex-Native Agent and Skill Surfaces Implementation Design](2026-06-29-codex-native-agent-skill-surfaces.md).

Reason: follow-up review of the online Codex documentation showed this draft used the wrong native structure for generated agents and rules.

Corrected decisions now live in the replacement design:

- Codex custom agents are `.codex/agents/*.toml`, not `.codex/agents/*.md`.
- Codex repository skills are `.agents/skills/<name>/SKILL.md`.
- `AGENTS.md` is the automatic project instruction surface.
- Codex `.codex/rules/*.rules` files are sandbox command permission rules, not coding standards.
- Coding standards should be generated as skills and selected prompt guidance, not Codex permission rules.
- Project hooks are official Codex surfaces but require trust review; they are not part of the first implementation slice.
