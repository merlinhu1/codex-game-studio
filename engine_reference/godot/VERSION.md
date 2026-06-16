reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.godotengine.org/

# Godot Version Reference

version-applicability: Godot 4.x projects unless project files state otherwise.

## Prefer

- Use scene composition, typed GDScript where present, and signal-based communication for gameplay events.
- Keep engine-specific checks tied to the active project version.

## Avoid

- Do not assume Godot 3.x APIs when the project targets Godot 4.x.
- Do not rewrite imported assets or generated import metadata without an explicit task reason.

## Pitfalls

- Node paths, autoload names, and signal signatures are easy to drift during refactors.
- Physics behavior can depend on project settings as much as script code.

## Verification Notes

- Run the configured Godot command or a documented editor smoke check.
- Report scene paths, script paths, and any ProjectSettings changes.

## Role Notes

- Gameplay programmers should cite the scene/script touched.
- Tools and engine programmers should name editor plugin or export changes.

## Official Links

- https://docs.godotengine.org/
