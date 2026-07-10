# Playtest Routing & Evidence Quality Evaluation

## Scenario
Evaluate QA/playtest routing and evidence quality for the current repository behavior using the provided workflow/skill contracts and templates. No implementation changes were made.

## Verdict
**Status: PASS with one medium-priority routing gap.**

- Core routing contract is coherent: `.codex/workflows/playtest.md` assigns the task to `qa-playtester` with category `qa-testing` and links to the review-oriented agents/skills.
- Evidence expectations are explicit at workflow and skill level, but template enforcement is implicit and not strongly bound by the workflow.

## Evidence

### 1) Triggering
- Workflow declares `primary-agent: qa-playtester` and identifies the process purpose in its contract.
- Workflow does not define an explicit external trigger phrase, command, or role alias for invocation.
- Skill `cgs-playtest-report` similarly points to QA and explicitly states it is user-invocable.
- **Assessment:** Triggering is clear in intent but not strongly bound to a single command/entry phrase.

### 2) Context Selection
- Workflow contract requires loading `AGENTS.md`, `.codex/studio.json`, this workflow, the primary agent, linked skills, and task-relevant files.
- Skill asks for project stage + task-specific targets and `production/session-state/active.md`.
- This satisfies context-boundary intent by avoiding global broadening.
- **Assessment:** PASS.

### 3) Role Routing / Role appropriateness
- Workflow role is `qa-playtester` and skill defines `primary-agent: qa-playtester` with review outputs.
- No crossover to unrelated roles is authorized in contracts.
- **Assessment:** PASS.

### 4) Template Selection
- Template files define output intents for playtest findings and evidence (`templates/playtest_report_template.md`, `templates/test_evidence_template.md`).
- Playtest workflow and skill do not explicitly reference these template artifacts by path/name.
- **Assessment:** Partial. Template alignment exists in intent, but explicit binding is weak.

### 5) Output Quality
- Workflow output contract asks for decision/change summary, step-by-step work, blockers/warnings/next owner.
- Skill output contract explicitly requires Summary, Loop Completion, Friction, Observation, Design Implication, Risks, Changed/proposed files, Verification evidence, and Next owner.
- Both are reviewable and map to human-readable outputs.
- **Assessment:** PASS.

### 6) Verification Discipline
- Workflow requires “Do not advance to handoff until evidence is recorded or blocker explicit.”
- Skill requires verification evidence and separation of unverified assumptions.
- Both align with evidence-first reporting.
- Additional check: `npm run validate` executed successfully.
- **Assessment:** PASS.

### 7) Human-review Usefulness
- Required sections and labels create a predictable handoff format.
- Severity and blocker distinction is requested in workflow; reproducibility and interpretation separation exists in templates.
- **Assessment:** PASS.

### 8) Stop-condition Quality
- Workflow explicitly lists stop conditions for missing required state/approval/cross-role boundaries.
- Skill reinforces “pause unless verifiable or clearly labeled plan.”
- **Assessment:** PASS.

### 9) Token Discipline
- Contracts are concise and focused; there are no obvious verbosity traps or overly speculative steps.
- **Assessment:** PASS.

## Risks and Gaps
1. Medium: Template-binding gap—workflow/skill do not explicitly require one of the two canonical report templates, which can produce format drift over time.
2. Medium: Triggering could benefit from explicit invocation mapping (command/alias) to reduce routing ambiguity in mixed-role sessions.

## Changed Files / Proposed Files
- Added: `production/session-state/playtest-eval-report.md` (this report).
- Proposed: none.

## Verification Notes
- Executed: `npm run validate`
- Result: **PASS** (all validation checks completed)

## Next Owner
- Primary next owner: `qa-playtester` for continuing QA/playtest routing enforcement and evidence collection.
- Recommended reviewer for template binding improvement: workflow maintainer (`studio-orchestrator` or designated workflow owner).
