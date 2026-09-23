Full framework skeleton with src/main and src/test.

## STLC Pipeline

An agentic Software Test Life Cycle pipeline lives in `.github/agents/` (four purpose-based agents) and `.github/skills/` (focused review, execution, reporting, and PR procedures). Start or resume a run in chat:

```
@STLC Test Case Classifier and Planner PROJ-123
```

- Artifacts for a run land under `stlc/<run-id>/` (test plan, test cases, reviews, automation manifest, execution/self-heal/final reports). See [stlc-conventions.md](.github/skills/_shared/stlc-conventions.md) for the full schema, retry rules, and model tiers.
- `.github/hooks/stlc-*.json` enforce policy deterministically: git changes are staged-only until PR creation, the run ledger (`state.json`) is updated from phase verdicts, gradle test output is parsed automatically, and estimated per-phase token spend is tracked against `stlc/config/token-budget.json`.
- Browser execution uses the Playwright MCP tools through the `stlc-automation-execution` skill.
- **Prerequisite:** Phase 0 (Classification) expects a Jira ticket key/URL, but no Jira MCP server is configured yet — until one is added, paste the ticket text when asked. Phase 9's Jira comment is written to the report for manual pasting rather than posted automatically.
- Token usage figures recorded by the pipeline are estimates (no cloud session sync configured), not billed usage.