---
name: stlc-test-plan
description: 'STLC pipeline Phase 1 — produce a test plan document from the Phase 0 classification. Use when running the STLC pipeline Phase 1 / Test Plan step.'
---

# STLC Phase 1 — Test Plan

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase1-test-plan` agent after Phase 0 completes.

## Input
- `stlc/<run-id>/ph0_classification.json`

## Procedure
1. Read the classification artifact.
2. Draft a concise test plan covering: scope & objectives, test approach (manual/automated split, driven by `automationInScope`), features in/out of scope, environment & test data needs, entry/exit criteria, risks & mitigations, and a rough schedule/effort note.
3. Keep it proportional to `riskLevel`/`priority` — a `Low`/`P4` ticket gets a short plan, not a 5-page document.
4. Write `stlc/<run-id>/ph1_test_plan.md`.

## Output Template (`ph1_test_plan.md`)
```markdown
# Test Plan — <ticketKey>: <title>

## Scope & Objectives
## Test Approach
## In Scope / Out of Scope
## Environment & Test Data
## Entry / Exit Criteria
## Risks & Mitigations
## Schedule
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions.
