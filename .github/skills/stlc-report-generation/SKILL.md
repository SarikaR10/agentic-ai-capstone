---
name: stlc-report-generation
description: "Create a final software test report from workflow artifacts, including coverage, retries, execution evidence, and residual risk. Use after execution completes, with input and output references supplied by the workflow coordinator."
---
# Report Generation

Read the supplied run-state reference, available phase artifacts, execution evidence, retry history, and usage data when present. Write the final report to the supplied output reference, covering classification, plan, test coverage, review history, automation, execution evidence, self-heal cycles, unresolved risks, and a work-item-ready summary. Label token counts as estimates, never billed usage.

Do not create a pull request or call an issue tracker from this skill. Return `DONE` only after the report exists and clearly distinguishes executed evidence from build-only or zero-test results.

Return the standard phase envelope with `status` set to `PASS` only after the report exists and include the report reference in `artifacts`.
