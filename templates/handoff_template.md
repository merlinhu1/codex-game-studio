# Purpose

Transfer context between agents without broad project scanning.

# Inputs

- Completed work, changed artifacts, decisions, blockers, and next requested role.

# Outputs

- `documentation/handoffs/<handoff-slug>.md`
- Summary, artifact links, validation state, and next command.

# Validation

Run `./codex-game-studio validate --project <project>` before handing off.
