---
name: stlc-automation-review
description: "Review generated test automation for traceability, correctness, compilation, and project conventions. Use after an automation generator completes, with the framework adapter and artifact references supplied by the workflow coordinator."
---
# Automation Review

Read the coordinator-supplied conventions, approved test cases, automation manifest, and every changed source file. Use the supplied project adapter to verify the framework's page/component abstractions, synchronization utilities, configuration mechanism, setup, discovery, and assertion conventions. Confirm that every approved case maps to runnable automation and that no hardcoded sleeps, duplicated locators, or equivalent project-specific anti-patterns were introduced.

Run the coordinator-supplied compile, type-check, or static validation command as a read-only sanity check when practical. Write the review to the supplied output reference. Return `PASS` when execution can begin or `OPEN_FIXES` with numbered, actionable findings for the automation generator. The coordinator owns retry limits and any lessons repository.

Return the standard phase envelope with `status` set to `PASS` or `FAIL`; put `OPEN_FIXES` in `outputs.verdict`, include the output artifact reference in `artifacts`, and list actionable findings in `errors` when applicable.
