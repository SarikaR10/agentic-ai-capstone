---
name: stlc-classification
description: 'STLC pipeline Phase 0 — classify a Jira ticket or pasted requirement into type, priority, components, test types, and automation scope. Use when running the STLC pipeline Phase 0 / Classification step.'
---

# STLC Phase 0 — Classification

See [shared conventions](../_shared/stlc-conventions.md) for run-id, the JSON handoff contract, and phase output rules — read it first.

## When to Use
Invoked by `stlc-phase0-classification` agent (or manually) at the start of an STLC pipeline run.

## Input
- A Jira ticket key/URL, or — since Jira MCP is not configured — pasted ticket text supplied by the user.
- If no Jira MCP tool is available and no text was pasted, ask the user to paste the ticket title + description before proceeding. Do not fabricate ticket content.

## Procedure
1. Determine `run-id` from the ticket key (see shared conventions for normalization).
2. Extract: title, ticket type (`Story`|`Bug`|`Enhancement`|`Task`), priority, affected components/modules, applicable test types (`functional`, `regression`, `smoke`, `api`, `ui`, `db`), whether automation is in scope, and an overall risk level (`Low`|`Medium`|`High`) based on blast radius and priority.
3. Return the classification in the `details` property of the JSON handoff. Do not write a phase artifact or create `state.json`; the orchestrator and its hooks own run state.

## Output Schema (`details`)
```json
{
  "runId": "PROJ-123",
  "ticketKey": "PROJ-123",
  "title": "string",
  "type": "Story|Bug|Enhancement|Task",
  "priority": "P1|P2|P3|P4",
  "components": ["login", "checkout"],
  "testTypes": ["functional", "regression"],
  "automationInScope": true,
  "riskLevel": "Low|Medium|High",
  "summary": "1-2 sentence rationale"
}
```

## Output Format
Return exactly one JSON handoff with `phase: 0`, `verdict: "DONE"`, `details` containing the schema above, and `next: "orchestrator"`.
