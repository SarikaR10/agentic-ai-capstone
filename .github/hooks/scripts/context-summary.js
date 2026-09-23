'use strict';
// SubagentStop: create a deterministic context summary when estimated usage crosses the configured threshold.
const fs = require('fs');
const path = require('path');
const { readStdin, findLatestRunDir, readJsonSafe, writeJson, output } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();
const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

const budget = readJsonSafe(path.join(cwd, 'stlc', 'config', 'token-budget.json'), { totalRunBudget: 50000 });
const thresholdRatio = 0.6;
const threshold = Math.ceil(Number(budget.totalRunBudget || 0) * thresholdRatio);
const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
const lines = fs.existsSync(ledgerPath)
  ? fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean)
  : [];
const entries = lines.map((line) => {
  try { return JSON.parse(line); } catch { return null; }
}).filter(Boolean);
const cumulativeTokens = entries.length ? Number(entries[entries.length - 1].cumulativeTotal || 0) : 0;
if (!threshold || cumulativeTokens < threshold) process.exit(0);

const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, {});
const summaryPath = path.join(runDir, 'context_summary.json');
const prior = readJsonSafe(summaryPath, null);
if (prior && prior.cumulativeTokens === cumulativeTokens) process.exit(0);

const artifacts = [];
for (const value of Object.values(state.phases || {})) {
  if (value && typeof value.artifact === 'string') artifacts.push(value.artifact);
}
for (const value of state.artifacts || []) {
  if (typeof value === 'string') artifacts.push(value);
}

const summary = {
  generatedAt: new Date().toISOString(),
  trigger: {
    thresholdRatio,
    thresholdTokens: threshold,
    cumulativeTokens
  },
  run: {
    runId: state.runId || path.basename(runDir),
    workflowType: state.workflowType || null,
    currentPhase: state.currentPhase ?? null,
    status: state.status || null,
    retryCounts: state.retryCounts || {},
    retryLimits: state.retryLimits || {}
  },
  completedPhases: Object.entries(state.phases || {})
    .filter(([, phase]) => phase && ['done', 'completed', 'passed'].includes(String(phase.status).toLowerCase()))
    .map(([phase]) => phase),
  artifacts: [...new Set(artifacts)],
  latestTokenEntries: entries.slice(-5),
  nextAction: 'Read this summary and the current phase input artifacts before continuing.'
};

writeJson(summaryPath, summary);
output({
  systemMessage: `stlc: deterministic context summary written to ${summaryPath}; use it as the compact run context before the next phase.`
});
process.exit(0);
