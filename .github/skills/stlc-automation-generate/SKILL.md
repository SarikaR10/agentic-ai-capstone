---
name: stlc-automation-generate
description: 'STLC pipeline Phase 4 — generate Cucumber/Selenium/TestNG automation code for reviewed test cases, following existing framework conventions. Use when running the STLC pipeline Phase 4 / Automation Generate step, including reruns after a Phase 5 open-fixes verdict.'
---

# STLC Phase 4 — Automation Generate

See [shared conventions](../_shared/stlc-conventions.md) for run-id, automation code conventions, git policy, and the JSON handoff contract — read it first.

## When to Use
Invoked by `stlc-phase4-automation-generate` agent after Phase 3 PASSes, or re-invoked by the orchestrator after a Phase 5 OPEN_FIXES verdict (max 3 attempts).

## Input
- Phase 2 test-case JSON handoff supplied by the orchestrator.
- If rerun: Phase 5 review JSON supplied by the orchestrator — address every listed item.
- Any lessons context supplied by the orchestrator — check for previously logged automation mistakes before writing code.

## Procedure
1. Ensure branch `stlc/<run-id>` exists (`git checkout -b stlc/<run-id>` if not already on it) — the `stlc-git-guard` hook enforces staging-only, no commits.
2. For each test case, map to a Cucumber scenario (feature file under `src/test/resources/features/`), step definitions, and any new/updated page objects — following the automation code conventions in shared conventions exactly (extend `BasePage`, use `WaitUtils`, `ConfigReader`, etc.).
3. Stage changes with `git add` (do not commit).
4. Put the changed-file mapping, scenario names, and assumptions in the JSON handoff `details` object. Do not write an automation manifest artifact; the generated source files are the deliverable.

## Output Format
Return exactly one JSON handoff with `phase: 4`, `verdict: "DONE"`, `details` containing the automation manifest data, and `next: "orchestrator"`. Do not paste generated source code into the handoff.
