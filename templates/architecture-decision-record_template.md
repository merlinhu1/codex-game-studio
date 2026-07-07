# Architecture Decision Record

# Purpose

Architecture decision record scaffold for context, options, decision, consequences, compatibility, and verification.

Use this Codex-native template when a game-studio task needs a reviewable `architecture-decision-record` artifact. Keep claims tied to source files, playtest observations, engine output, or explicit user decisions.

# Inputs

- Project goal, current milestone, and active engine from `.codex/studio.json` or AGENTS.md.
- Relevant design, production, source, asset, or test files named by the task.
- Constraints, owners, risks, and required verification evidence.

# Outputs

- Summary: one paragraph naming the artifact, scope, and decision need.
- Source evidence: file paths, commands, observations, or user decisions used.
- Artifact body: structured sections appropriate for `architecture-decision-record` with assumptions labeled.
- Risks and follow-ups: blockers, unknowns, owner, and due milestone.

# Validation

- Confirm every required section has concrete content or an explicit `Not applicable` rationale.
- Check paths and commands are repo-relative and safe for the active engine.
- Include verification evidence such as tests, build output, playtest notes, review verdict, or handoff.
- Record unresolved assumptions separately from confirmed facts.
