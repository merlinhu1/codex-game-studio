reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://dev.epicgames.com/documentation/en-us/unreal-engine/plugins-in-unreal-engine

# Unreal Plugin Reference

version-applicability: Unreal Engine 5.x plugins, modules, and editor tooling.

## Prefer

- Keep plugin descriptors, module rules, and dependencies explicit.
- Separate editor modules from runtime modules.

## Avoid

- Avoid plugin changes that require global engine installation edits.
- Avoid generated binary or intermediate outputs.

## Pitfalls

- Module loading phases and dependency lists can break packaged builds.
- Editor-only APIs can leak into runtime modules.

## Verification Notes

- Report build target, editor startup, and plugin enablement checks.

## Role Notes

- Tools programmers and engine programmers receive this when plugin or module work is relevant.

## Official Links

- https://dev.epicgames.com/documentation/en-us/unreal-engine/plugins-in-unreal-engine
