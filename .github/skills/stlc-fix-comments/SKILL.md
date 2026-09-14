---
name: stlc-fix-comments
description: 'STLC pipeline Phase 6 — apply external human review comments to the automation code, once. Use when running the STLC pipeline Phase 6 / Review Comments Fix step.'
---

# STLC Phase 6 — Review Comments Fix

See [shared conventions](../_shared/stlc-conventions.md) for run-id, automation code conventions, git policy, and the JSON handoff contract — read it first.

## When to Use
Invoked exactly **once** by `stlc-phase6-fix-comments` agent, after a human has reviewed the `stlc/<run-id>` branch (e.g. via PR) and provided comments. This is distinct from the automated Phase 4↔5 loop — these are human-authored comments, not the Phase 5 report.

## Input
- Human review comments, supplied by the orchestrator (it must ask the user to paste/attach them before invoking this phase — do not proceed without them).
- The Phase 4 automation JSON handoff for context on what was generated.

## Procedure
1. Parse the comments into a discrete list of requested changes.
2. Apply each change to the relevant files, following automation code conventions. Stage with `git add` (no commit — enforced by the git-guard hook).
3. If a comment is unclear or contradicts a test case, note it under "Unresolved" rather than guessing.
4. Put addressed comments, changed files, and unresolved items in the JSON handoff `details` object. Do not write a fix manifest artifact.

## Output Format
Return exactly one JSON handoff with `phase: 6`, `verdict: "DONE"`, `details` containing the fix manifest data, and `next: "orchestrator"`. This phase always ends with the orchestrator pausing for a human gate before Phase 7 — do not trigger execution yourself.
