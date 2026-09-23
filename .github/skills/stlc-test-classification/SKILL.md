---
name: stlc-test-classification
description: "Classify a software requirement, story, defect, resume request, or selected phase for an STLC workflow. Use at the start of a run when the coordinator must select applicable phases without relying on project-specific paths or tools."
---
# STLC Test Classification

Classify the supplied requirement, work item, pasted specification, or run request before phase execution begins. Use the available metadata and explicit user selection; do not invent acceptance criteria or infer unsupported product behavior.

The coordinator must supply the project adapter context, including the issue-tracker terminology, phase identifiers, artifact references, and any workflow-specific exclusions. Do not assume a repository layout, issue-tracker product, branch name, or artifact directory.

Determine:

- `workflow_type`: `story`, `defect`, `resume`, or `specific_phase`
- the ordered phases to run
- the starting phase for a specific-phase or resumed run
- missing inputs or blockers that prevent reliable classification

Use these phase policies:

- `story`: run the complete configured pipeline from classification through the configured work-item closure step.
- `defect`: run the phases configured for defect validation. Skip planning and review phases only when the available defect context explicitly makes them unnecessary.
- `resume`: read the supplied run-state reference, identify the last incomplete phase, and continue from that phase without repeating completed work.
- `specific_phase`: begin at the user-selected phase and continue through the remaining applicable phases.

Write the classification artifact to the coordinator-supplied output reference. Include the classification, rationale, selected phases, required inputs, assumptions, and blockers. Preserve existing run identifiers and do not overwrite completed phase artifacts.

Return strict JSON using this shape:

```json
{
  "phase": "test-classification",
  "status": "PASS|FAIL|SKIPPED",
  "retry_count": 0,
  "outputs": {
    "workflow_type": "story|defect|resume|specific_phase",
    "start_phase": "string",
    "selected_phases": ["string"],
    "artifact_ref": "<classification-artifact-ref>"
  },
  "errors": [],
  "artifacts": ["<classification-artifact-ref>"],
  "next_recommendation": "string"
}
```

Return `FAIL` when the story or run context is insufficient to select a safe workflow. Return `SKIPPED` only when the orchestrator explicitly excludes classification for a valid resume or specific-phase request and the existing state already contains a trusted classification.
