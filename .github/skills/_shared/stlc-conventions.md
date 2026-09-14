# STLC Pipeline — Shared Conventions

Single source of truth referenced by all `stlc-*` skills, phase agents, the orchestrator, and hooks. Keep this file as the only place these facts are defined — skills should link here, not repeat it, to save tokens.

## Run identity
- `run-id` = normalized Jira ticket key (e.g. `PROJ-123`, slashes/spaces replaced with `-`).
- The orchestrator owns the run context and passes the previous phase's JSON handoff to the next phase.
- Phase agents must not create phase report artifacts. They may edit required product/test source files and stage those changes when their phase requires it.

## Runtime directory layout
```
stlc/
  config/
    token-budget.json         # user-editable spend caps
  knowledge/
    lessons.md                # optional cross-run learnings, supplied by the orchestrator when relevant
  <run-id>/
    state.json                 # ledger: phase, status, retry counts, timestamps — used to resume a failed run
    token_ledger.jsonl          # append-only estimated token usage per phase (written by stlc-token-meter hook)
```

## state.json schema
```json
{
  "runId": "PROJ-123",
  "currentPhase": 2,
  "status": "in_progress",            // in_progress | paused_human_gate | failed | completed
  "phases": {
    "0": { "status": "done", "completedAt": "..." },
    "3": { "status": "rejected", "retryCount": 1 }
  },
  "retryLimits": { "ph3_to_ph2": 3, "ph5_to_ph4": 3, "ph7_ph8_cycle": 3 }
}
```

## Retry / loop rules (enforced by the orchestrator, not by individual skills)
- Ph3 REJECT → back to Ph2, max 3 attempts, then escalate to human.
- Ph5 OPEN_FIXES → back to Ph4, max 3 attempts, then escalate to human.
- Ph6 runs exactly once, always followed by a human-gate pause before Ph7.
- Ph7 ⇄ Ph8 execute/self-heal cycle, max 3 attempts, then escalate to human.

## JSON handoff contract (every phase agent)
Each phase agent must return exactly one compact JSON object to the orchestrator and must not hand off directly to another phase agent. The object contains the phase result and all information the orchestrator needs to route the next call:
```
{
  "phase": 0,
  "verdict": "DONE",
  "summary": "1-3 sentences",
  "details": {},
  "next": "orchestrator"
}
```
- `verdict` must be one of `PASS`, `REJECT`, `OPEN_FIXES`, `DONE`, or `FAIL`.
- `details` must contain the structured phase output needed by a later phase; do not replace it with a file path.
- The orchestrator must pass the JSON handoff, or the relevant `details`, explicitly in the next subagent prompt.

## Automation code conventions (Ph4 / Ph6 / Ph8)
Follow existing framework structure — do not invent a different layout:
- Page objects extend [BasePage.java](../../../src/main/java/com/company/framework/pages/BasePage.java) (see [LoginPage.java](../../../src/main/java/com/company/framework/pages/LoginPage.java) for the pattern).
- Step definitions under `src/test/java/com/company/framework/stepdefinitions/`, matching feature files under `src/test/resources/features/`.
- Test setup/teardown in [Hooks.java](../../../src/test/java/com/company/framework/hooks/Hooks.java).
- Runner config in [TestRunner.java](../../../src/test/java/com/company/framework/runners/TestRunner.java) (Cucumber + TestNG per [build.gradle](../../../build.gradle)).
- Config values via [ConfigReader.java](../../../src/main/java/com/company/framework/utils/ConfigReader.java); explicit waits via [WaitUtils.java](../../../src/main/java/com/company/framework/utils/WaitUtils.java); driver creation via [DriverFactory.java](../../../src/main/java/com/company/framework/drivers/DriverFactory.java); reporting via [ExtentManager.java](../../../src/main/java/com/company/framework/reports/ExtentManager.java) / [TestListener.java](../../../src/main/java/com/company/framework/listeners/TestListener.java).

## Git policy (enforced by the `stlc-git-guard` hook, not optional)
- Work happens on branch `stlc/<run-id>` (create with `git checkout -b` if it doesn't exist).
- `git add` to stage changes is allowed. `git commit`, `git push`, `git reset --hard` are blocked — a human commits.

## Token/model tiers
| Tier | Phases | reasoning-effort |
|------|--------|-------------------|
| Light | Ph0, Ph7 | low |
| Standard | Ph1, Ph2, Ph3, Ph9 | medium |
| Deep | Ph4, Ph5, Ph6, Ph8 | high |

Exact model names are pinned in each phase agent's frontmatter — adjust there, not per-skill.

## Lessons context
Lessons, when available, are supplied by the orchestrator as JSON context. Phase agents must not append to `stlc/knowledge/lessons.md` or create another phase artifact; the orchestrator owns any cross-run persistence policy.
