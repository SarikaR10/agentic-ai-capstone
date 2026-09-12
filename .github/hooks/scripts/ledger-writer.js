'use strict';
// SubagentStop: deterministically record phase completion in stlc/<run-id>/state.json so the
// audit trail/resume ledger can't be skipped even if the orchestrator forgets to update it.
const path = require('path');
const { readStdin, findLatestRunDir, readJsonSafe, writeJson, detectPhaseNumber } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const phase = detectPhaseNumber(input);
if (phase === null) process.exit(0); // not one of our phase agents — nothing to record

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, { runId: path.basename(runDir), currentPhase: 0, status: 'in_progress', phases: {} });

state.phases[phase] = Object.assign({}, state.phases[phase], {
  status: state.phases[phase] && state.phases[phase].status === 'rejected' ? state.phases[phase].status : 'done',
  completedAt: new Date().toISOString()
});
state.currentPhase = Number(phase);
if (phase === '9') state.status = 'completed';

writeJson(statePath, state);
process.exit(0);

process.exit(0);
