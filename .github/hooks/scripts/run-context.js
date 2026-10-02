'use strict';
// SessionStart: surface the in-flight run's state so the agent doesn't have to be told to go read it.
// Best-effort only — transcript/session injection APIs are not guaranteed; we use systemMessage which is always supported.
const path = require('path');
const { readStdin, findRunDir, readJsonSafe, output, summarizePhaseHistory } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const runDir = findRunDir(cwd, input);
if (!runDir) process.exit(0);

const state = readJsonSafe(path.join(runDir, 'state.json'), null);
if (!state) process.exit(0);

output({
  systemMessage: `stlc: run detected — runId=${state.run_id || state.runId || path.basename(runDir)}, currentPhase=${state.current_phase || state.currentPhase || 'unknown'}, status=${state.status || 'unknown'}. ${state.blocker ? `Blocker: ${state.blocker}. ` : ''}Recent phases: ${summarizePhaseHistory(state).slice(-4).map((phase) => `${phase.phase}:${phase.status}`).join(', ') || 'none recorded'}. Read ${path.join(runDir, 'state.json')} and the current phase input artifact before proceeding.`
});
process.exit(0);
