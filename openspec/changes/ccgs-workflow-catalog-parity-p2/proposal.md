# Proposal: Close remaining CCGS workflow-step parity gaps

## Why

The generated CCGS parity report still lists 18 workflow-step rows as todo after the first workflow parity batch. These rows are workflow/catalog surface gaps, not template or rule gaps, so the next bounded closure should finish the workflow-step class before moving to template and rule work.

## What changes

- Add first-class Codex workflow registry entries for the remaining 18 CCGS workflow-step ids.
- Align the phase catalog with those ids, artifact checks, repeatability, and required-step semantics.
- Add tracked `.codex/workflows/*.md` prompt surfaces for the 18 workflows.
- Update parity tests so all workflow-step rows are implemented and the remaining gap report shows no workflow-step rows.
- Regenerate parity and prompt-surface reports after implementation.

## Out of scope

- Template body parity for the remaining 26 template rows.
- Rule adaptation for the remaining 11 rule rows.
- Copying CCGS Claude rule or hook behavior.
