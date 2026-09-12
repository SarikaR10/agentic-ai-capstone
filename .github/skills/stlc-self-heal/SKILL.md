---
name: stlc-self-heal
description: 'STLC pipeline Phase 8 — diagnose and fix failing automated tests (locators, waits, flaky data), then hand back to execute. Use when running the STLC pipeline Phase 8 / Self-Heal step.'
---

# STLC Phase 8 — Self-Heal

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, automation code conventions, git policy, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase8-self-heal` agent after a Phase 7 FAIL (max 3 Phase 7↔8 cycles total).

## Input
- `stlc/<run-id>/ph7_execution_report.md` (failure list).
- The failing step definitions / page objects on branch `stlc/<run-id>`.

## Procedure
1. For each failure, classify the likely root cause: stale locator, timing/wait issue, bad test data, environment issue, or a genuine product defect (not an automation bug — do not "fix" a real bug by weakening the assertion).
2. Apply the smallest targeted fix for automation-side issues (update locator, use `WaitUtils` explicit wait instead of a fixed sleep, correct test data). Stage with `git add` (no commit).
3. If a failure looks like a genuine product defect rather than a flaky/broken test, do not modify the test to hide it — flag it clearly in the report instead.
4. Append a one-line entry to `stlc/knowledge/lessons.md` per shared conventions for each fix made, so future runs avoid the same mistake.
5. Write `stlc/<run-id>/ph8_self_heal_report.md`.

## Output Template (`ph8_self_heal_report.md`)
```markdown
# Self-Heal Report — <ticketKey> (attempt N)

## Fixes Applied
| Scenario | Root Cause | Fix | Confidence |

## Flagged as Possible Product Defects (not modified)
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions — the orchestrator re-invokes Phase 7 after this.
