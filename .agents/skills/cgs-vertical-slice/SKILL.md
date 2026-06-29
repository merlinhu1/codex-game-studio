---
name: cgs-vertical-slice
description: Use for Codex Game Studio vertical slice work: Validate whether a full game loop can be built at representative quality before production commitment.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the vertical-slice objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/vertical-slice/SKILL.md
source-hash: a555d5a79fceee22229b5587778ccae3f2c17514c92ffa62b708db613c574f9a
user-invocable: true
---

# Codex Game Studio Vertical Slice

Use this skill for vertical slice work in Template Game.

## Objective

Validate whether a full game loop can be built at representative quality before production commitment.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/vertical-slice.md
- docs/architecture/README.md

## Procedure

1. Resolve review mode and load concept, systems, architecture, UX, production timeline, and active risks.
2. Frame the Validation Question: can a player experience the core fantasy in a representative complete loop, and can the team build that loop at production quality on schedule?
3. Apply Scope Discipline: target 3-5 minutes of continuous polished gameplay; cut content before cutting quality; include all systems required for one start-to-challenge-to-resolution loop.
4. Plan implementation with explicit systems, quality bar, success criteria, owner roles, and a hard time limit.
5. Set a Recovery Checkpoint in production/session-state/active.md so multi-session slice work can resume without guessing.
6. Run a Playtest Debrief that captures loop completion, first meaningful action timing, core fantasy, blockers, confusion, and build feasibility.
7. Write the verdict as PROCEED / PIVOT / KILL with evidence, risks, and next action.

## Write Targets

- tests/
- production/session-state/
- prototypes/
- prototypes/<concept>-vertical-slice/
- production/session-state/active.md

## Output Contract

- Summary
- Validation Question
- Scope Discipline
- Recovery Checkpoint
- Playtest Debrief
- PROCEED / PIVOT / KILL
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Validation Question
- Scope Discipline
- Recovery Checkpoint
- Playtest Debrief
- PROCEED / PIVOT / KILL
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.

## Purpose

Use this skill when the repository needs vertical-slice work with Codex-native model routing, bounded context, and reviewable evidence.

## Prerequisites

- AGENTS.md and .codex/studio.json are available or the absence is reported as a blocker.
- The task names the target feature, asset, workflow, or verification boundary.
- Write scope and sandbox policy are known before editing files.

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Phased Procedure

1. Classify the task and confirm this skill is the right owner.
2. Inspect only the selected workflow, agent metadata, project state, and task-relevant files.
3. Create or update the smallest useful artifact while preserving template-repository surfaces.
4. Run the cheapest meaningful verification first, then stronger checks when risk warrants it.
5. Prepare a handoff with changed files, evidence, risks, and next owner.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Failure Modes

- Missing project state, engine context, or target files.
- Unbounded scope that would require speculative multi-role work.
- Verification cannot run and no manual inspection alternative is available.

## Verification

- Run the requested command, relevant tests, validation, or playtest inspection.
- If execution is impossible, state the blocker and provide a concrete verification plan.
- Keep evidence tied to paths and commands, not broad claims.

## Adaptation Rationale

This skill is adapted from .claude/skills/vertical-slice/SKILL.md when available and translated into Codex-native model, tool-policy, sandbox, and handoff language. Claude-specific model/tool metadata is not used as runtime policy.
