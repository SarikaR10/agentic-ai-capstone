---
name: stlc-test-plan
description: 'STLC pipeline Phase 1 — produce a test plan document from the Phase 0 classification. Use when running the STLC pipeline Phase 1 / Test Plan step.'
---

# STLC Phase 1 — Test Plan

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase1-test-plan` agent after Phase 0 completes.

## Input
- Phase 0 JSON handoff supplied by the orchestrator.

## Procedure
1. Read the classification JSON handoff supplied in the prompt.
2. Draft a concise test plan covering: scope & objectives, test approach (manual/automated split, driven by `automationInScope`), features in/out of scope, environment & test data needs, entry/exit criteria, risks & mitigations, and a rough schedule/effort note.
3. Keep it proportional to `riskLevel`/`priority` — a `Low`/`P4` ticket gets a short plan, not a 5-page document.
4. Put the complete test plan in the JSON handoff `details` object. Do not write a phase artifact.

## Output Format
Return exactly one JSON handoff with `phase: 1`, `verdict: "DONE"`, `details` containing the complete plan, and `next: "orchestrator"`.
