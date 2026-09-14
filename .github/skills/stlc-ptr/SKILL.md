---
name: stlc-ptr
description: 'STLC pipeline Phase 9 — produce the final Project Test Report summarizing the whole run, plus a draft Jira summary comment. Use when running the STLC pipeline Phase 9 / Project Test Report step (terminal phase).'
---

# STLC Phase 9 — Project Test Report

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase9-ptr` agent once Phase 7 reaches PASS (or the retry limit is exhausted and the human has decided to close the run anyway). This is the terminal phase — no loop-back.

## Input
- All prior JSON handoffs supplied by the orchestrator, plus the current `state.json` for resumable phase history.
- `stlc/<run-id>/token_ledger.jsonl` if present.

## Procedure
1. Summarize the run end-to-end: classification, test plan highlights, test case count, review cycles taken, automation summary, execution result, self-heal cycles (if any).
2. If `token_ledger.jsonl` exists, include a per-phase estimated token usage table (clearly labeled as an estimate, not billed usage — see shared conventions).
3. Draft a short Jira summary comment. Since Jira MCP is not configured, do **not** attempt to post it — include it as a clearly-labeled `jiraComment` value in the JSON handoff for the user to paste manually.
4. Put the complete project test report in the JSON handoff `details` object; do not write a report artifact. The orchestrator and its hooks own completion state.

## Output Format
Return exactly one JSON handoff with `phase: 9`, `verdict: "DONE"`, `details` containing the complete report and `jiraComment`, and `next: "orchestrator"`.
