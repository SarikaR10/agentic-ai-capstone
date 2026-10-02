'use strict';
// SubagentStop: create a deterministic context summary when estimated usage crosses the configured threshold.
const path = require('path');
const {
  readStdin,
  findRunDir,
  readJsonSafe,
  writeJson,
  output,
  readTokenLedger,
  summarizePhaseHistory
} = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();
const runDir = findRunDir(cwd, input);
if (!runDir) process.exit(0);

const budget = readJsonSafe(path.join(cwd, 'stlc', 'config', 'token-budget.json'), { totalRunBudget: 50000 });
const thresholdRatio = 0.6;
const threshold = Math.ceil(Number(budget.totalRunBudget || 0) * thresholdRatio);
const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, {});
const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
const usage = readTokenLedger(ledgerPath);
const cumulativeTokens = usage.total;
const summaryPath = path.join(runDir, 'context_summary.json');
const prior = readJsonSafe(summaryPath, null);
const rebuild = process.argv.includes('--rebuild');
const needsMigration = !prior || prior.schemaVersion !== 2;
if (!rebuild && !needsMigration && (!threshold || cumulativeTokens < threshold)) process.exit(0);
if (!rebuild && prior && prior.schemaVersion === 2 && prior.tokenUsage &&
    prior.tokenUsage.cumulativeEstimatedTokens === cumulativeTokens &&
    prior.run && prior.run.currentPhase === (state.current_phase || state.currentPhase || null)) process.exit(0);

const phases = summarizePhaseHistory(state);
const activePhase = [...phases].reverse().find((phase) => phase.status.toLowerCase() === 'in_progress') || null;
const artifacts = (Array.isArray(state.artifacts) ? state.artifacts : []).filter((value) => typeof value === 'string');
const latestEntries = usage.entries.slice(-8).map((entry) => ({
  ts: entry.ts || null,
  phase: entry.phase || null,
  phaseAttribution: entry.phaseAttribution || null,
  estimatedIntervalTokens: Number.isFinite(entry.estimatedIntervalTokens) ? entry.estimatedIntervalTokens : null,
  tokenSource: entry.tokenSource || 'legacy_untrusted'
}));

const summary = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  trigger: {
    thresholdRatio,
    thresholdTokens: threshold,
    cumulativeTokens,
    thresholdReached: Boolean(threshold && Number.isFinite(cumulativeTokens) && cumulativeTokens >= threshold),
    forcedRebuild: rebuild
  },
  run: {
    runId: state.run_id || state.runId || path.basename(runDir),
    workflowType: state.workflow_type || state.workflowType || null,
    currentPhase: state.current_phase ?? state.currentPhase ?? null,
    status: state.status || null,
    blocker: state.blocker || null,
    activePhase,
    reviewWaivers: Array.isArray(state.review_waivers) ? state.review_waivers : [],
    jiraTestCases: Array.isArray(state.jira_test_cases) ? state.jira_test_cases : [],
    prLink: state.pr_link || state.prLink || null
  },
  phases,
  artifacts: [...new Set(artifacts)].slice(-40),
  tokenUsage: {
    method: 'Per-subagent transcript growth divided by four; estimate only, not billed usage.',
    cumulativeEstimatedTokens: cumulativeTokens,
    confidence: usage.estimatedEntries === 0
      ? (usage.legacyEntriesIgnored ? 'unavailable_legacy_only' : 'unavailable')
      : (usage.unavailableIntervals ? 'partial' : 'complete'),
    estimatedIntervals: usage.estimatedEntries,
    unavailableIntervals: usage.unavailableIntervals,
    legacyEntriesIgnored: usage.legacyEntriesIgnored,
    phaseEstimates: phases.filter((phase) => phase.tokenEstimate !== null)
      .map((phase) => ({
        phase: phase.phase,
        estimatedTokens: phase.tokenEstimate,
        source: phase.tokenEstimateSource
      })),
    latestEntries
  },
  nextAction: state.status === 'BLOCKED'
    ? `Resolve the recorded blocker before continuing: ${state.blocker || 'see state.json'}`
    : `Read state.json and the input artifact for phase ${state.current_phase || state.currentPhase || 'unknown'} before continuing.`
};

writeJson(summaryPath, summary);
output({
  systemMessage: `stlc: deterministic context summary written to ${summaryPath}; use it as the compact run context before the next phase.`
});
process.exit(0);
