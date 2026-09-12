# STLC Pipeline — Shared Conventions

Single source of truth referenced by all `stlc-*` skills, phase agents, the orchestrator, and hooks. Keep this file as the only place these facts are defined — skills should link here, not repeat it, to save tokens.

## Run identity
- `run-id` = normalized Jira ticket key (e.g. `PROJ-123`, slashes/spaces replaced with `-`).
- All artifacts for a run live under `stlc/<run-id>/`.

## Directory layout
```
stlc/
  config/
    token-budget.json         # user-editable spend caps
  knowledge/
    lessons.md                # cross-run learnings (rejections, fixes) — read before generating, appended after review/heal phases
  <run-id>/
    state.json                 # ledger: phase, status, retry counts, artifact paths, timestamps — used to resume a failed run
    token_ledger.jsonl          # append-only estimated token usage per phase (written by stlc-token-meter hook)
    ph0_classification.json
    ph1_test_plan.md
    ph2_test_cases.md
    ph2_test_cases.json
    ph3_test_case_review.md
    ph4_automation_manifest.md
    ph5_automation_review.md
    ph6_fix_manifest.md
    ph7_execution_report.md
    ph8_self_heal_report.md
    ph9_ptr.md
```

## state.json schema
```json
{
  "runId": "PROJ-123",
  "currentPhase": 2,
  "status": "in_progress",            // in_progress | paused_human_gate | failed | completed
  "phases": {
    "0": { "status": "done", "artifact": "ph0_classification.json", "completedAt": "..." },
    "3": { "status": "rejected", "retryCount": 1, "artifact": "ph3_test_case_review.md" }
  },
  "retryLimits": { "ph3_to_ph2": 3, "ph5_to_ph4": 3, "ph7_ph8_cycle": 3 }
}
```

## Retry / loop rules (enforced by the orchestrator, not by individual skills)
- Ph3 REJECT → back to Ph2, max 3 attempts, then escalate to human.
- Ph5 OPEN_FIXES → back to Ph4, max 3 attempts, then escalate to human.
- Ph6 runs exactly once, always followed by a human-gate pause before Ph7.
- Ph7 ⇄ Ph8 execute/self-heal cycle, max 3 attempts, then escalate to human.

## Return-verdict contract (every phase skill)
Each phase agent must end its turn with a **short** structured verdict block (not the full artifact content — that belongs in the artifact file, kept out of the conversation to save tokens):
```
VERDICT: <PASS|REJECT|OPEN_FIXES|DONE|FAIL>
ARTIFACT: stlc/<run-id>/phN_xxx.*
SUMMARY: <1-3 sentences>
```

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

## Lessons log (`stlc/knowledge/lessons.md`)
Append one short bullet per entry: `- [<run-id>][PhN] <what went wrong> -> <what to do instead>`. Ph3/Ph5/Ph8 append; Ph2/Ph4 read the file before generating to avoid repeating known mistakes.
