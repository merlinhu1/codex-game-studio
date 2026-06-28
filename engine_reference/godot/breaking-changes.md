reviewer: Codex Game Studio seed review
date: 2026-06-17
source-link: https://docs.godotengine.org/en/stable/
engine: godot
version-reviewed: 4.4
tags: godot,breaking,changes
roles: gameplay-programmer,engine-programmer,qa-playtester,release-manager
workflows: prototype,bugfix,architecture-review,qa-plan

# Godot Breaking Changes

## Purpose

Surface version upgrade and compatibility risks before relying on engine behavior.

## Guidance

- Call out migration-sensitive APIs, package versions, serialization formats, and build settings.
- Separate confirmed breaking changes from speculative compatibility risks.
- Include rollback or compatibility notes for risky changes.

## Validation

- Prefer project-local engine commands and Codex Game Studio project validation before readiness claims.
- Record unknown version-specific behavior as a risk instead of presenting it as confirmed.
- Keep this reference selected by relevance; do not load every engine reference for one task.
