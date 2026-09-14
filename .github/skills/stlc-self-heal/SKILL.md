---
name: stlc-self-heal
description: 'STLC pipeline Phase 8 — diagnose and fix failing automated tests (locators, waits, flaky data), then hand back to execute. Use when running the STLC pipeline Phase 8 / Self-Heal step.'
---

# STLC Phase 8 — Self-Heal

See [shared conventions](../_shared/stlc-conventions.md) for run-id, automation code conventions, git policy, and the JSON handoff contract — read it first.

## When to Use
Invoked by `stlc-phase8-self-heal` agent after a Phase 7 FAIL (max 3 Phase 7↔8 cycles total).

## Input
- The Phase 7 execution JSON handoff (failure list).
- The failing step definitions / page objects on branch `stlc/<run-id>`.

## Procedure
1. For each failure, classify the likely root cause: stale locator, timing/wait issue, bad test data, environment issue, or a genuine product defect (not an automation bug — do not "fix" a real bug by weakening the assertion).
2. Apply the smallest targeted fix for automation-side issues (update locator, use `WaitUtils` explicit wait instead of a fixed sleep, correct test data). Stage with `git add` (no commit).
3. If a failure looks like a genuine product defect rather than a flaky/broken test, do not modify the test to hide it — flag it clearly in the report instead.
4. Put fixes, root causes, confidence, and possible product defects in the JSON handoff `details` object. Do not append a lesson file or write a self-heal report artifact.

## Output Format
Return exactly one JSON handoff with `phase: 8`, `verdict: "DONE"`, `details` containing the self-heal results, and `next: "orchestrator"`; the orchestrator re-invokes Phase 7 after this.
