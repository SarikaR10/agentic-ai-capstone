---
name: stlc-fix-comments
description: 'STLC pipeline Phase 6 — apply external human review comments to the automation code, once. Use when running the STLC pipeline Phase 6 / Review Comments Fix step.'
---

# STLC Phase 6 — Review Comments Fix

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, automation code conventions, git policy, and the return-verdict contract — read it first.

## When to Use
Invoked exactly **once** by `stlc-phase6-fix-comments` agent, after a human has reviewed the `stlc/<run-id>` branch (e.g. via PR) and provided comments. This is distinct from the automated Phase 4↔5 loop — these are human-authored comments, not the Phase 5 report.

## Input
- Human review comments, supplied by the orchestrator (it must ask the user to paste/attach them before invoking this phase — do not proceed without them).
- `stlc/<run-id>/ph4_automation_manifest.md` for context on what was generated.

## Procedure
1. Parse the comments into a discrete list of requested changes.
2. Apply each change to the relevant files, following automation code conventions. Stage with `git add` (no commit — enforced by the git-guard hook).
3. If a comment is unclear or contradicts a test case, note it under "Unresolved" rather than guessing.
4. Write `stlc/<run-id>/ph6_fix_manifest.md`.

## Output Template (`ph6_fix_manifest.md`)
```markdown
# Review Comments Fix — <ticketKey>

## Comments Addressed
| Comment | File(s) Changed | Resolution |

## Unresolved (needs human clarification)
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions. This phase always ends with the orchestrator pausing for a human gate before Phase 7 — do not attempt to trigger execution yourself.
