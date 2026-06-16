reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.godotengine.org/en/stable/tutorials/plugins/editor/index.html

# Godot Plugin Reference

version-applicability: Godot 4.x editor plugins and export tooling.

## Prefer

- Keep editor plugins isolated under addon-style folders.
- Document any editor restart or enablement step.

## Avoid

- Avoid plugin side effects outside the active project.
- Avoid relying on local editor-only absolute paths.

## Pitfalls

- Plugin activation state can differ between machines.
- Export presets may hide missing resources until build time.

## Verification Notes

- Open the editor or run a documented export check after plugin changes.
- Record plugin enablement and export preset changes.

## Role Notes

- Tools programmers and engine programmers receive this when relevant.

## Official Links

- https://docs.godotengine.org/en/stable/tutorials/plugins/editor/index.html
