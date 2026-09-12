'use strict';
// SubagentStart: deterministic pre-flight budget check against stlc/config/token-budget.json.
// Asks (does not hard-block) so the user can choose to continue, downgrade model tier, or abort.
const path = require('path');
const { readStdin, findLatestRunDir, readJsonSafe, output } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0); // no run in progress yet (e.g. Phase 0 hasn't created state.json) — nothing to guard

const budgetPath = path.join(cwd, 'stlc', 'config', 'token-budget.json');
const budget = readJsonSafe(budgetPath, null);
if (!budget) process.exit(0);

const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
const fs = require('fs');
let cumulative = 0;
if (fs.existsSync(ledgerPath)) {
  const lines = fs.readFileSync(ledgerPath, 'utf8').trim().split('\n').filter(Boolean);
  const last = lines[lines.length - 1];
  if (last) {
    try {
      cumulative = JSON.parse(last).cumulativeTotal || 0;
    } catch {
      cumulative = 0;
    }
  }
}

if (cumulative >= budget.totalRunBudget) {
  output({
    hookSpecificOutput: {
      hookEventName: 'SubagentStart',
      permissionDecision: 'ask',
      permissionDecisionReason: `stlc-budget-guard: estimated cumulative usage for this run is ~${cumulative} tokens, at/over the configured cap of ${budget.totalRunBudget} (stlc/config/token-budget.json). Continue, raise the cap, or stop?`
    }
  });
}
process.exit(0);
