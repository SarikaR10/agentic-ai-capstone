---
name: stlc-ptr
description: 'STLC pipeline Phase 9 — produce the final Project Test Report summarizing the whole run, plus a draft Jira summary comment. Use when running the STLC pipeline Phase 9 / Project Test Report step (terminal phase).'
---

# STLC Phase 9 — Project Test Report

See [shared conventions](../_shared/stlc-conventions.md) for run-id, directory layout, and the return-verdict contract — read it first.

## When to Use
Invoked by `stlc-phase9-ptr` agent once Phase 7 reaches PASS (or the retry limit is exhausted and the human has decided to close the run anyway). This is the terminal phase — no loop-back.

## Input
- All prior artifacts under `stlc/<run-id>/` (`state.json` for phase history, `ph0`…`ph8`).
- `stlc/<run-id>/token_ledger.jsonl` if present.

## Procedure
1. Summarize the run end-to-end: classification, test plan highlights, test case count, review cycles taken, automation summary, execution result, self-heal cycles (if any).
2. If `token_ledger.jsonl` exists, include a per-phase estimated token usage table (clearly labeled as an estimate, not billed usage — see shared conventions).
3. Draft a short Jira summary comment. Since Jira MCP is not configured, do **not** attempt to post it — write it as a clearly-labeled section for the user to paste manually.
4. Write `stlc/<run-id>/ph9_ptr.md` and mark `state.json` `status: completed`.

## Output Template (`ph9_ptr.md`)
```markdown
# Project Test Report — <ticketKey>

## Executive Summary
## Test Coverage
## Automation Summary
## Execution Result
## Retry/Loop History
## Estimated Token Usage by Phase (if available)

## Jira Comment (paste manually — Jira MCP not configured)
```

## Output Format
End with the return-verdict block (`VERDICT: DONE`) per shared conventions.
