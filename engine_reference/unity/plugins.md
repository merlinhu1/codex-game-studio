reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.unity3d.com/Manual/Packages.html

# Unity Package And Plugin Reference

version-applicability: Unity package manifest, editor tooling, and plugin integrations.

## Prefer

- Keep package changes explicit in `Packages/manifest.json`.
- Separate editor-only code from runtime assemblies.

## Avoid

- Avoid machine-local package paths unless the task explicitly requires them.
- Avoid broad editor automation that mutates unrelated assets.

## Pitfalls

- Package resolution can differ across Unity versions.
- Editor scripts can run during import and produce unexpected asset changes.

## Verification Notes

- Report package manifest diffs and any editor menu or importer smoke check.

## Role Notes

- Tools programmers and engine programmers receive this when package or editor work is relevant.

## Official Links

- https://docs.unity3d.com/Manual/Packages.html
