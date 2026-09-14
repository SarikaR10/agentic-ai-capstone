---
name: stlc-test-case-review
description: 'STLC pipeline Phase 3 — review test cases for coverage and quality, produce a PASS/REJECT verdict. Use when running the STLC pipeline Phase 3 / Test Case Review step.'
---

# STLC Phase 3 — Test Case Review

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase3-test-case-review` agent after Phase 2 (and after every Phase 2 rerun, up to 3 total attempts).

## Input
- Phase 2 test-case JSON handoff supplied by the orchestrator.
- The Phase 1 plan and Phase 0 classification from prior JSON handoffs.

## Procedure
1. Check coverage against the test plan's in-scope features and the classification's test types — flag missing negative/edge/regression cases.
2. Check quality: clear steps, unambiguous expected results, correct priority, no duplicate IDs.
3. Decide **PASS** (cases are good enough to automate) or **REJECT** (material gaps) — do not nitpick minor wording into a REJECT.
4. Put the coverage result, actionable issues, and notes in the JSON handoff `details` object. Do not write a review artifact or append a lesson file.

## Output Format
Return exactly one JSON handoff with `phase: 3`, `verdict: "PASS"` or `"REJECT"`, `details` containing the review findings, and `next: "orchestrator"`.
