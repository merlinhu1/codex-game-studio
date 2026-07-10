# Smoke-Critical Prompt Evaluation — Infrastructure-Blocked Attempt

- **Run ID:** `20260710T191701Z-smoke-critical`
- **Model:** `gpt-5.3-codex-spark`
- **Status:** **Infrastructure blocked; excluded from prompt-quality conclusions.**

All four Codex attempts entered the `workspace-write` sandbox but could not execute shell or file-write operations. Each final response records the same root cause:

> `bwrap: No permissions to create a new namespace, likely because the kernel does not allow non-privileged user namespaces.`

The expected evaluation reports were not created, required context could not be read, and agent-side `npm run validate` could not run. Controller-side post-run validation succeeded, but it does not satisfy the scenario's agent-behavior gate.

Raw turn-completed token fields are preserved in `audit.json` for accounting transparency. They must not be used to compare prompt quality because the runtime condition was invalid.

A separately labeled native fallback run (`20260710T192217Z-smoke-critical`) supersedes this attempt for accepted smoke-stage evidence. It used disposable detached worktrees and isolated Codex homes, but not the failed Bubblewrap sandbox.
