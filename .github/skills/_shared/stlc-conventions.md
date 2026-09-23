# STLC Project Conventions

This file contains project-specific conventions consumed by the project agents and passed as adapter context to reusable STLC skills. Reusable skills must not assume these values exist in another project.

## Adapter Responsibilities

The project coordinator supplies each skill worker with:

- run identifier and phase identifier
- input and output artifact references
- repository root and allowed file scope
- test framework and project abstractions
- validation and execution commands
- browser or API integration details
- retry limit and current retry count
- issue-tracker and pull-request policy

The skill worker must use supplied references and must not invent paths, commands, integrations, or framework conventions.

## Workflow Contract

- The coordinator owns phase ordering, retries, state persistence, and next-phase decisions.
- Each worker executes one phase and returns the standard JSON envelope.
- Phase artifacts are references, not implicit paths.
- A phase may report `PASS`, `FAIL`, or `SKIPPED`; detailed local verdicts belong in `outputs.verdict`.
- Review findings must be actionable and must not weaken product assertions to hide defects.
- Execution must distinguish passed tests, failed tests, blocked tests, and zero-test discovery.
- Pull-request and issue-tracker actions require explicit authorization from the project adapter.
