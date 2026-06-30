# Examples

This directory contains scenario-oriented examples for using Codex Game Studio. Each example focuses on the workflow shape: what you are trying to do, which commands you run, and what you learn.

## Start here

If you are new to the system, read the root [README](../../README.md), run the quick start, then come back here for common scenarios.

## Available examples

### Create and validate a Godot prototype

**Type:** project initialization  
**Complexity:** low

Create a local project, inspect its state, and run validation.

```sh
./codex-game-studio init --name "Rogue Core" --engine godot --mode prototype --non-interactive \
  --competitor "Mini Metro" --competitor "Dorfromantik"
./codex-game-studio status
./codex-game-studio validate
```

**Learn:** project state, status output, and project validation.

---

### Run a producer market pass

**Type:** role execution  
**Complexity:** low-medium

Inspect the prompt first, then run the producer role through Codex.

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt

./codex-game-studio run producer \
  "Create the initial market overview."
```

**Learn:** role selection, prompt inspection, direct Codex execution, and review-before-trust workflow.

---

### Prepare focused workflow prompts

**Type:** workflow prompt rendering  
**Complexity:** low

Render workflow prompts without launching Codex.

```sh
./codex-game-studio market --dry-run
./codex-game-studio analytics --dry-run
./codex-game-studio handoff --dry-run
./codex-game-studio design-spec --dry-run
./codex-game-studio feel-review --dry-run
./codex-game-studio ui-review --dry-run
```

**Learn:** workflow shortcuts are preparation surfaces; they do not launch Codex or create run records.

---

### Create a vertical-slice task plan

**Type:** file-backed task workflow  
**Complexity:** medium

Turn a supported workflow recipe into explicit project tasks.

```sh
./codex-game-studio workflow create-tasks vertical-slice
./codex-game-studio validate
```

**Learn:** task recipes, `.codex/tasks.json`, and validation after task-state changes.

---

### Discover packaged templates

**Type:** template discovery  
**Complexity:** low

List templates and inspect one before using it in a role prompt or design session.

```sh
./codex-game-studio templates list
./codex-game-studio templates show market_analysis
```

**Learn:** packaged template IDs and how templates support studio workflows.

## More detail

- [User Guide](../user-guide.md) for command-by-command usage.
