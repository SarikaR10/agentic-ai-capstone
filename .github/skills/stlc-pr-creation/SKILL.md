---
name: stlc-pr-creation
description: "Create a pull request for completed test-workflow changes and publish the final report handoff. Use after report generation, with repository, branch, policy, and work-item adapter details supplied by the workflow coordinator."
---
# PR Creation

Read the coordinator-supplied conventions, completed report, repository root, branch policy, and change list. Stage only approved artifacts and implementation changes, then commit and push only when the supplied repository policy permits it. Create a pull request to the configured target branch with the work-item key, report summary, test result, and artifact references.

Write the handoff result to the coordinator-supplied output reference, including the work-item key, PR URL, exact comment or handoff text, configured completion transition, and report reference. Do not call an issue-tracker integration unless the coordinator explicitly supplies and authorizes one. Mark the run completed only after the PR URL and handoff artifact exist; otherwise return `FAIL` and preserve the report for recovery.

Return the standard phase envelope with `status` set to `PASS` or `FAIL` and include the handoff artifact reference in `artifacts`.
