---
name: stlc-test-cases
description: 'STLC pipeline Phase 2 — write detailed test cases from the test plan, in markdown and JSON. Use when running the STLC pipeline Phase 2 / Test Cases step, including reruns after a Phase 3 rejection.'
---

# STLC Phase 2 — Test Cases

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase2-test-cases` agent after Phase 1, or re-invoked by the orchestrator after a Phase 3 REJECT (max 3 attempts).

## Input
- `stlc/<run-id>/ph1_test_plan.md`
- `stlc/<run-id>/ph0_classification.json`
- If this is a rerun: `stlc/<run-id>/ph3_test_case_review.md` (prior reject feedback) — address every listed issue.
- `stlc/knowledge/lessons.md` — check for previously logged mistakes on similar tickets/components before writing new cases.

## Procedure
1. Read the test plan + classification (+ review feedback and lessons log if rerunning).
2. Derive test cases covering positive, negative, edge, and (if in scope) regression paths for each feature in scope.
3. Write both:
   - `stlc/<run-id>/ph2_test_cases.md` — human-readable table.
   - `stlc/<run-id>/ph2_test_cases.json` — structured array, one object per test case, IDs matching the markdown table.
4. If rerunning after rejection, add a short "Changes since last review" note at the top of the markdown file.

## Output Schema
Markdown table columns: `ID | Title | Preconditions | Steps | Expected Result | Priority | Type`.

JSON (`ph2_test_cases.json`):
```json
[{ "id": "TC-001", "title": "string", "preconditions": "string", "steps": ["..."], "expectedResult": "string", "priority": "P1|P2|P3", "type": "functional|negative|edge|regression" }]
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions.
