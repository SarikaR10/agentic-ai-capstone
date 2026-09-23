---
name: stlc-test-case-review
description: "Review generated software test cases for coverage, traceability, quality, and required test types. Use after a test-case generator completes, with artifact references supplied by the workflow coordinator."
---
# Test Case Review

Read the coordinator-supplied conventions and references for classification, the test plan, and the test-case artifacts. Verify every in-scope requirement is covered, positive/negative/edge behavior is represented, required test types are explicit, IDs are unique, and expected results are observable and unambiguous.

Write the review to the coordinator-supplied output reference. Return `PASS` when the cases are ready for the next configured phase; return `REJECT` only for material gaps and list actionable fixes for the test-case generator. The coordinator owns retry limits and any lessons repository.

Return the standard phase envelope with `status` set to `PASS` or `FAIL`; put `REJECT` in `outputs.verdict`, include the output artifact reference in `artifacts`, and list actionable findings in `errors` when applicable.
