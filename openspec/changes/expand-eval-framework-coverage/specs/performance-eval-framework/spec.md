## MODIFIED Requirements

### Requirement: Framework contract validation
The eval framework SHALL validate catalog targets, rubrics, scenarios, manual-only behavior, semantic dimensions, and the absence of existence-only success criteria.

#### Scenario: Framework validation reports coverage and behavior contracts
- **WHEN** repository validation runs
- **THEN** validation includes checks for manual-only behavior, target mappings, behavioral expectations, semantic dimensions, no existence-only checks, and first-pass coverage thresholds
- **THEN** validation fails if workflow, skill, or role coverage drops below the first-pass threshold

### Requirement: Scenario grading contract
The scenario grader SHALL evaluate required reads, forbidden writes, required changed artifacts, verification evidence, report presence, and optional token usage.

#### Scenario: Forbidden write fails before semantic judging
- **WHEN** an observation changes a path matching a scenario `mustNotChange` pattern
- **THEN** the deterministic grading result is fail
- **THEN** the failure includes a forbidden-write label

#### Scenario: Token usage is preserved
- **WHEN** an observation includes raw token counts
- **THEN** the result includes those counts for comparison
- **THEN** the result does not enforce a token budget
