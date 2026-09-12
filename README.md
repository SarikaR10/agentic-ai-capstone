Full framework skeleton with src/main and src/test.

## STLC Pipeline

An agentic Software Test Life Cycle pipeline lives in `.github/agents/stlc-*` (orchestrator + one agent per phase) and `.github/skills/stlc-*` (the procedure each phase follows). Start or resume a run in chat:

```
@STLC Orchestrator PROJ-123
```

- Artifacts for a run land under `stlc/<run-id>/` (test plan, test cases, reviews, automation manifest, execution/self-heal/final reports). See [stlc-conventions.md](.github/skills/_shared/stlc-conventions.md) for the full schema, retry rules, and model tiers.
- `.github/hooks/stlc-*.json` enforce policy deterministically: git changes are staged-only (no auto-commit/push), the run ledger (`state.json`) is updated after every phase, gradle test output is parsed automatically, and estimated per-phase token spend is tracked against `stlc/config/token-budget.json`.
- **Prerequisite:** Phase 0 (Classification) expects a Jira ticket key/URL, but no Jira MCP server is configured yet — until one is added, paste the ticket text when asked. Phase 9's Jira comment is written to the report for manual pasting rather than posted automatically.
- Token usage figures recorded by the pipeline are estimates (no cloud session sync configured), not billed usage.