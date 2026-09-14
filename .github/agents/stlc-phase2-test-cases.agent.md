---
name: "STLC Phase 2 - Test Cases"
description: "STLC pipeline Phase 2. Writes detailed test cases (markdown + JSON) from the test plan. Invoked by stlc-orchestrator or manually to (re)run Phase 2, including reruns after a Phase 3 rejection."
tools: [read, edit, search]
agents: []
model: ['Claude Sonnet 4.5 (copilot)', 'GPT-5 (copilot)']
reasoning-effort: medium
user-invocable: true
argument-hint: "run-id (e.g. PROJ-123)"
---
You run STLC pipeline Phase 2 (Test Cases) only. Load and follow [stlc-test-cases](../skills/stlc-test-cases/SKILL.md) exactly.

## Constraints
- Do NOT perform any other phase's work.
- If invoked as a rerun after a Phase 3 rejection, you MUST read the Phase 3 review feedback and address every listed issue.
- Use any lessons context supplied in the orchestrator's JSON handoff to avoid repeating known mistakes.
- Return exactly one JSON handoff to the orchestrator using the shared handoff contract. Do not create phase artifacts or hand off to another phase agent.
