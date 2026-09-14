---
name: stlc-execute
description: 'STLC pipeline Phase 7 — run the automated test suite and report results. Use when running the STLC pipeline Phase 7 / Execute step, including re-runs after a Phase 8 self-heal.'
---

# STLC Phase 7 — Execute

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase7-execute` agent after Phase 6's human gate is cleared, or re-invoked after Phase 8 self-heal (max 3 Phase 7↔8 cycles).

## Input
- The automation code on branch `stlc/<run-id>`.

## Procedure
1. Run `gradle test` (TestNG + Cucumber per [build.gradle](../../../build.gradle)).
2. The `stlc-test-results-parser` hook parses `build/test-results/test/*.xml` into a compact JSON summary automatically after the run — read that summary rather than raw XML/console output.
3. Put pass/fail counts and short failure details in the JSON handoff `details` object; do not write an execution report artifact.
4. If all pass, use `verdict: "PASS"`; if any fail, use `verdict: "FAIL"` so the orchestrator routes to Phase 8.

## Output Format
Return exactly one JSON handoff with `phase: 7`, `verdict: "PASS"` or `"FAIL"`, `details` containing the test-results summary, and `next: "orchestrator"`.
