reviewer: Open Game Studio seed review
date: 2026-06-17
source-link: https://dev.epicgames.com/documentation/en-us/unreal-engine/
engine: unreal
version-reviewed: 5.5
tags: unreal,VERSION
roles: gameplay-programmer,engine-programmer,tools-programmer,technical-artist
workflows: prototype,bugfix,architecture-review,qa-plan

# Unreal Version Reference

## Purpose

Use this file to confirm the reviewed engine version, official documentation root, and version-sensitive assumptions before making implementation claims.

## Guidance

- Match generated project engine version against this reviewed baseline.
- Prefer official docs for version-specific APIs.
- Record any project-local engine version drift in the handoff.

## Validation

- Prefer project-local engine commands and Open Game Studio project validation before readiness claims.
- Record unknown version-specific behavior as a risk instead of presenting it as confirmed.
- Keep this reference selected by relevance; do not load every engine reference for one task.
