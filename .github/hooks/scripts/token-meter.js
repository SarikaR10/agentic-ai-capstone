'use strict';
// SubagentStop: best-effort per-phase token estimate (chars/4 heuristic) appended to the run's
// token_ledger.jsonl. Not billed usage — local session storage has no real per-event token data.
const fs = require('fs');
const path = require('path');
const { readStdin, findLatestRunDir, appendLine, readJsonSafe, writeJson, detectPhaseNumber, detectPhaseIdentifier } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();
const transcriptPath = input.transcript_path;
const phase = detectPhaseIdentifier(input) || detectPhaseNumber(input);

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

let estTokens = 0;
const transcriptAvailable = Boolean(transcriptPath && fs.existsSync(transcriptPath));
if (transcriptAvailable) {
  try {
    const size = fs.statSync(transcriptPath).size;
    estTokens = Math.round(size / 4); // rough chars/4 heuristic
  } catch {
    estTokens = 0;
  }
}

const ledgerPath = path.join(runDir, 'token_ledger.jsonl');
let cumulative = estTokens;
if (fs.existsSync(ledgerPath)) {
  const lines = fs.readFileSync(ledgerPath, 'utf8').trim().split('\n').filter(Boolean);
  const last = lines[lines.length - 1];
  if (last) {
    try {
      cumulative += JSON.parse(last).cumulativeTotal || 0;
    } catch {
      // ignore malformed last line
    }
  }
}

appendLine(ledgerPath, JSON.stringify({
  ts: new Date().toISOString(),
  phase,
  sessionId: input.session_id || null,
  estimatedPhaseTokens: transcriptAvailable ? estTokens : null,
  tokenSource: transcriptAvailable ? 'transcript_chars_div_4' : 'unavailable',
  cumulativeTotal: cumulative
}));

// Hooks can provide elapsed time and an estimated total, but not separate prompt/completion billing.
const statePath = path.join(runDir, 'state.json');
const state = readJsonSafe(statePath, null);
if (state && Array.isArray(state.phase_history)) {
  const phaseOrder = [
    'test-classification', 'read-jira', 'test-plan', 'test-case-generation',
    'test-case-review', 'upload-jira', 'automation-generation',
    'automation-review', 'automation-execution', 'report-generation',
    'pr-creation', 'jira-close'
  ];
  const resolvedPhase = typeof phase === 'number' || /^\d+$/.test(String(phase))
    ? phaseOrder[Number(phase)]
    : phase;
  const phaseEntry = state.phase_history.find((entry) =>
    entry && entry.phase_name === resolvedPhase);
  if (phaseEntry) {
    const end = new Date();
    phaseEntry.end_time = end.toISOString();
    if (phaseEntry.start_time) {
      phaseEntry.duration_ms = Math.max(0, end.getTime() - new Date(phaseEntry.start_time).getTime());
    }
    phaseEntry.token_usage = {
      total: transcriptAvailable ? estTokens : null,
      estimated: transcriptAvailable,
      source: transcriptAvailable ? 'transcript_chars_div_4' : 'unavailable'
    };
    writeJson(statePath, state);
  }
}
process.exit(0);
