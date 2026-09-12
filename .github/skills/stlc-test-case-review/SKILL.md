---
name: stlc-test-case-review
description: 'STLC pipeline Phase 3 — review test cases for coverage and quality, produce a PASS/REJECT verdict. Use when running the STLC pipeline Phase 3 / Test Case Review step.'
---

# STLC Phase 3 — Test Case Review

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase3-test-case-review` agent after Phase 2 (and after every Phase 2 rerun, up to 3 total attempts).

## Input
- `stlc/<run-id>/ph2_test_cases.md` + `.json`
- `stlc/<run-id>/ph1_test_plan.md`, `ph0_classification.json`

## Procedure
1. Check coverage against the test plan's in-scope features and the classification's test types — flag missing negative/edge/regression cases.
2. Check quality: clear steps, unambiguous expected results, correct priority, no duplicate IDs.
3. Decide **PASS** (cases are good enough to automate) or **REJECT** (material gaps) — do not nitpick minor wording into a REJECT.
4. Write `stlc/<run-id>/ph3_test_case_review.md` listing specific, actionable issues (if REJECT) or a brief coverage confirmation (if PASS).
5. If REJECT, append a one-line entry to `stlc/knowledge/lessons.md` per shared conventions describing the recurring gap.

## Output Template (`ph3_test_case_review.md`)
```markdown
# Test Case Review — <ticketKey>

## Verdict: PASS | REJECT

## Coverage Check
## Issues (if REJECT — numbered, actionable)
## Notes
```

## Output Format
End with the return-verdict block: `VERDICT: PASS` or `VERDICT: REJECT` (plus a one-line reason) per shared conventions.
