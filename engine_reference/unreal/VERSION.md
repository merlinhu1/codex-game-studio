reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://dev.epicgames.com/documentation/en-us/unreal-engine

# Unreal Version Reference

version-applicability: Unreal Engine 5.x projects unless project files state otherwise.

## Prefer

- Keep C++, Blueprint, module, and plugin changes explicit in handoff notes.
- Treat `.uproject`, `.uplugin`, and build file edits as engine-level changes.

## Avoid

- Do not edit DerivedDataCache, Intermediate, or Saved outputs.
- Do not assume Blueprint behavior from C++ diffs alone.

## Pitfalls

- Reflection macros, module dependencies, and asset references can fail late.
- Blueprint assets may need editor validation even after C++ compiles.

## Verification Notes

- Run the configured Unreal build/test command or document an editor smoke check.
- Report maps, Blueprints, modules, plugins, and config files touched.

## Role Notes

- Programmers should identify whether changes affect runtime, editor, or build tooling.

## Official Links

- https://dev.epicgames.com/documentation/en-us/unreal-engine
