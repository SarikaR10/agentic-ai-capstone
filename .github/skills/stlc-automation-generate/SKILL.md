---
name: stlc-automation-generate
description: 'STLC pipeline Phase 4 — generate Cucumber/Selenium/TestNG automation code for reviewed test cases, following existing framework conventions. Use when running the STLC pipeline Phase 4 / Automation Generate step, including reruns after a Phase 5 open-fixes verdict.'
---

# STLC Phase 4 — Automation Generate

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, automation code conventions, git policy, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase4-automation-generate` agent after Phase 3 PASSes, or re-invoked by the orchestrator after a Phase 5 OPEN_FIXES verdict (max 3 attempts).

## Input
- `stlc/<run-id>/ph2_test_cases.json`
- If rerun: `stlc/<run-id>/ph5_automation_review.md` (open fix items) — address every listed item.
- `stlc/knowledge/lessons.md` — check for previously logged automation mistakes before writing code.

## Procedure
1. Ensure branch `stlc/<run-id>` exists (`git checkout -b stlc/<run-id>` if not already on it) — the `stlc-git-guard` hook enforces staging-only, no commits.
2. For each test case, map to a Cucumber scenario (feature file under `src/test/resources/features/`), step definitions, and any new/updated page objects — following the automation code conventions in shared conventions exactly (extend `BasePage`, use `WaitUtils`, `ConfigReader`, etc.).
3. Stage changes with `git add` (do not commit).
4. Write `stlc/<run-id>/ph4_automation_manifest.md` mapping test case IDs → files created/changed → scenario names.

## Output Template (`ph4_automation_manifest.md`)
```markdown
# Automation Manifest — <ticketKey>

## Branch: stlc/<run-id>

## Files Changed
| Test Case ID | File | Change |

## Notes / Assumptions
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions. Do not paste generated code into the chat response — it lives in the files.
