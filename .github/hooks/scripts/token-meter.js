'use strict';
// Measure transcript growth for each subagent interval; never re-add the full transcript.
const fs = require('fs');
const path = require('path');
const {
  readStdin,
  findRunDir,
  appendLine,
  readJsonSafe,
  writeJson,
  detectPhaseIdentifier,
  transcriptCharCount,
  transcriptDelta,
  transcriptCursorKey,
  readTokenLedger
} = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();
const event = String(process.argv[2] || input.hook_event_name || input.event || '').toLowerCase();
const mode = event.includes('start') ? 'start' : 'stop';
const transcriptPath = input.transcript_path || input.transcriptPath;
const runDir = findRunDir(cwd, input);
if (!runDir) process.exit(0);

const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, {});
const phaseInfo = detectPhaseIdentifier(input, state);
const phase = phaseInfo.phase;
const sessionId = input.session_id || input.sessionId || null;
const cursorKey = transcriptCursorKey(sessionId, transcriptPath);
const meterStatePath = path.join(runDir, 'token_meter_state.json');
const meterState = readJsonSafe(meterStatePath, { schemaVersion: 1, cursors: {} });

if (mode === 'start') {
  const startChars = transcriptCharCount(transcriptPath);
  if (startChars !== null) {
    meterState.cursors[cursorKey] = {
      sessionId,
      startChars,
      phase,
      phaseSource: phaseInfo.source,
      startedAt: new Date().toISOString()
    };
    writeJson(meterStatePath, meterState);
  }
  process.exit(0);
}

const cursor = meterState.cursors[cursorKey] || null;
const endChars = transcriptCharCount(transcriptPath);
const deltaChars = cursor && endChars !== null
  ? transcriptDelta(cursor.startChars, endChars)
  : null;
const intervalTokens = deltaChars === null ? null : Math.ceil(deltaChars / 4);
const resolvedPhase = (cursor && cursor.phase) || phase;
const attribution = cursor && cursor.phase
  ? cursor.phaseSource
  : phaseInfo.source;
const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
const usage = readTokenLedger(ledgerPath);
const cumulativeTotal = usage.estimatedEntries
  ? usage.total + (intervalTokens || 0)
  : intervalTokens;

appendLine(ledgerPath, JSON.stringify({
  schemaVersion: 2,
  ts: new Date().toISOString(),
  event: 'SubagentStop',
  phase: resolvedPhase,
  phaseAttribution: attribution,
  sessionId,
  transcriptCharsAtStart: cursor ? cursor.startChars : null,
  transcriptCharsAtStop: endChars,
  transcriptCharsDelta: deltaChars,
  estimatedIntervalTokens: intervalTokens,
  tokenSource: intervalTokens === null ? 'unavailable' : 'transcript_growth_chars_div_4',
  baselineStatus: cursor ? 'measured_interval' : 'missing_start_baseline',
  legacyEntriesIgnored: usage.legacyEntriesIgnored,
  cumulativeTotal,
  cumulativeTotalAlias: cumulativeTotal
}));

if (cursor) {
  delete meterState.cursors[cursorKey];
  writeJson(meterStatePath, meterState);
}

// Add the hook estimate to the active phase when the state already has a matching phase entry.
if (resolvedPhase && Array.isArray(state.phase_history) && intervalTokens !== null) {
  const phaseEntry = [...state.phase_history].reverse().find((entry) =>
    entry && entry.phase_name === resolvedPhase && String(entry.status).toLowerCase() === 'in_progress');
  if (phaseEntry && (!phaseEntry.token_usage ||
      phaseEntry.token_usage.source !== 'transcript_growth_chars_div_4')) {
    phaseEntry.token_usage = {
      total: intervalTokens,
      estimated: true,
      source: 'transcript_growth_chars_div_4'
    };
    writeJson(statePath, state);
  }
}
process.exit(0);
