---
name: stlc-test-cases
description: 'STLC pipeline Phase 2 — write detailed test cases from the test plan, in markdown and JSON. Use when running the STLC pipeline Phase 2 / Test Cases step, including reruns after a Phase 3 rejection.'
---

# STLC Phase 2 — Test Cases

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase2-test-cases` agent after Phase 1, or re-invoked by the orchestrator after a Phase 3 REJECT (max 3 attempts).

## Input
- Phase 1 JSON handoff supplied by the orchestrator.
- Phase 0 classification JSON in the prior handoff context.
- If this is a rerun: Phase 3 review JSON supplied by the orchestrator — address every listed issue.
- Any lessons context supplied by the orchestrator — check for previously logged mistakes before writing new cases.

## Procedure
1. Read the test plan + classification (+ review feedback and lessons log if rerunning).
2. Derive test cases covering positive, negative, edge, and (if in scope) regression paths for each feature in scope.
3. Put the structured array and any human-readable plan needed by later phases in the JSON handoff `details` object. Do not write phase artifacts.
4. If rerunning after rejection, include a short `changesSinceLastReview` value in `details`.

## Output Schema
Markdown table columns: `ID | Title | Preconditions | Steps | Expected Result | Priority | Type`.

JSON (`details.testCases`):
```json
[{ "id": "TC-001", "title": "string", "preconditions": "string", "steps": ["..."], "expectedResult": "string", "priority": "P1|P2|P3", "type": "functional|negative|edge|regression" }]
```

## Output Format
Return exactly one JSON handoff with `phase: 2`, `verdict: "DONE"`, `details.testCases` containing the structured array, and `next: "orchestrator"`.
