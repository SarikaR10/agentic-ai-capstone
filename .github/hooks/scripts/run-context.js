'use strict';
// SessionStart: surface the in-flight run's state so the agent doesn't have to be told to go read it.
// Best-effort only — transcript/session injection APIs are not guaranteed; we use systemMessage which is always supported.
const path = require('path');
const { readStdin, findLatestRunDir, readJsonSafe, output } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

const state = readJsonSafe(path.join(runDir, 'state.json'), null);
if (!state) process.exit(0);

output({
  systemMessage: `stlc: in-flight run detected — runId=${state.runId || path.basename(runDir)}, currentPhase=${state.currentPhase}, status=${state.status}. Read ${path.join(runDir, 'state.json')} before starting work.`
});
process.exit(0);
