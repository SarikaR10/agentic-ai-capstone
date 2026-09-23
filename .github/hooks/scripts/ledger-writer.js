'use strict';
// SubagentStop: deterministically record phase completion in stlc/<run-id>/state.json so the
// audit trail/resume ledger can't be skipped if a workflow agent forgets to update it.
const path = require('path');
const { readStdin, findLatestRunDir, readJsonSafe, writeJson, detectPhaseNumber, detectVerdict } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const phase = detectPhaseNumber(input);
if (phase === null) process.exit(0); // not one of the four workflow agents — nothing to record
const verdict = detectVerdict(input);

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, { runId: path.basename(runDir), currentPhase: 0, status: 'in_progress', phases: {} });

const phaseState = state.phases[phase] || {};
state.phases[phase] = Object.assign({}, phaseState, {
  status: verdict === 'REJECT' ? 'rejected' : 'done',
  completedAt: new Date().toISOString()
});
if (phase === '3' && verdict === 'REJECT') {
  state.phases[phase].retryCount = (phaseState.retryCount || 0) + 1;
  state.retryCounts = Object.assign({}, state.retryCounts, {
    ph3_to_ph2: (state.retryCounts && state.retryCounts.ph3_to_ph2 || 0) + 1
  });
}
state.currentPhase = phase === '3' && verdict === 'REJECT' ? 2 : Number(phase);
if (phase === '6') state.status = 'paused_human_gate';
if (phase === '9') state.status = 'completed';

writeJson(statePath, state);
process.exit(0);

process.exit(0);
