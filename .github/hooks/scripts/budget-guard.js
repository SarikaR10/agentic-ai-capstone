'use strict';
// SubagentStart: deterministic pre-flight budget check against stlc/config/token-budget.json.
// Asks (does not hard-block) so the user can choose to continue, downgrade model tier, or abort.
const path = require('path');
const { readStdin, findRunDir, readJsonSafe, output, readTokenLedger } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const runDir = findRunDir(cwd, input);
if (!runDir) process.exit(0); // no run in progress yet (e.g. Phase 0 hasn't created state.json) — nothing to guard

const budgetPath = path.join(cwd, 'stlc', 'config', 'token-budget.json');
const budget = readJsonSafe(budgetPath, null);
if (!budget) process.exit(0);

const fs = require('fs');
const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
const usage = readTokenLedger(ledgerPath);
const cumulative = usage.total;

if (Number.isFinite(cumulative) && cumulative >= budget.totalRunBudget) {
  output({
    hookSpecificOutput: {
      hookEventName: 'SubagentStart',
      permissionDecision: 'ask',
      permissionDecisionReason: `stlc-budget-guard: estimated cumulative usage for this run is ~${cumulative} tokens${usage.unavailableIntervals ? ' (partial; some intervals unavailable)' : ''}, at/over the configured cap of ${budget.totalRunBudget} (stlc/config/token-budget.json). This uses transcript growth estimates; ${usage.legacyEntriesIgnored} legacy cumulative snapshot entries were excluded. Continue, raise the cap, or stop?`
    }
  });
}
process.exit(0);
