---
name: stlc-automation-review
description: 'STLC pipeline Phase 5 — review generated automation code for correctness and convention adherence, produce a PASS/OPEN_FIXES verdict. Use when running the STLC pipeline Phase 5 / Automation Review step.'
---

# STLC Phase 5 — Automation Review

See [shared conventions](../_shared/stlc-conventions.md) for run-id, automation code conventions, and the JSON handoff contract — read it first.

## When to Use
Invoked by `stlc-phase5-automation-review` agent after every Phase 4 run (initial and reruns, up to 3 total Phase 4↔5 cycles).

## Input
- Phase 4 automation JSON handoff and the changed files it lists (diff against `stlc/<run-id>` branch).
- Phase 2 test-case JSON handoff.

## Procedure
1. Verify every test case maps to an actual scenario/step definition (no silent drops).
2. Verify convention adherence: page objects extend `BasePage`, waits use `WaitUtils` (no hardcoded `Thread.sleep`), config via `ConfigReader`, no duplicated locators across page objects.
3. Optionally compile-check via `gradle compileTestJava` (read-only sanity check, not a full test run).
4. Decide **PASS** (ready for review/execute) or **OPEN_FIXES** (list concrete, scoped items for Phase 4 to fix) — this loop is fully automated, so be decisive and specific.
5. Put findings and actionable open-fix items in the JSON handoff `details` object. Do not write a review artifact.

## Output Format
Return exactly one JSON handoff with `phase: 5`, `verdict: "PASS"` or `"OPEN_FIXES"`, `details` containing findings, and `next: "orchestrator"`.
