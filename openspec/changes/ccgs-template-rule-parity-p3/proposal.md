# Proposal: Close final CCGS template and rule parity gaps

## Why

The CCGS parity scoreboard still had 37 non-role, non-workflow rows after workflow parity p2: 26 template rows and 11 rule rows. These are the final generated parity gaps blocking a zero-gap CCGS surface report.

## What changes

- Add Codex-native package templates for the remaining CCGS template artifacts.
- Adapt CCGS `.claude/rules/*.md` intent into Codex standards skills instead of copying Claude rule files.
- Update parity scoring so implemented rule adaptations target standards skills.
- Regenerate CCGS parity and prompt-surface reports.
- Add regression tests proving template and rule gap rows no longer appear in the remaining-gap report.

## Non-goals

- Do not introduce `.codex/rules` or Claude rule-file routing.
- Do not replace existing broad templates; add explicit CCGS compatibility templates where the source artifact name is itself a contract.
- Do not change runtime model policy outside the new standards skill surfaces.
