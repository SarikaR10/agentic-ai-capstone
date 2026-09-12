'use strict';
// SubagentStop: best-effort per-phase token estimate (chars/4 heuristic) appended to the run's
// token_ledger.jsonl. Not billed usage — local session storage has no real per-event token data.
const fs = require('fs');
const path = require('path');
const { readStdin, findLatestRunDir, appendLine, detectPhaseNumber } = require('./_util');

const input = readStdin();
const cwd = input.cwd || process.cwd();
const transcriptPath = input.transcript_path;
const phase = detectPhaseNumber(input);

const runDir = findLatestRunDir(cwd);
if (!runDir) process.exit(0);

let estTokens = 0;
if (transcriptPath && fs.existsSync(transcriptPath)) {
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
  phase: phase !== null ? Number(phase) : null,
  sessionId: input.session_id || null,
  estTokens,
  cumulativeTotal: cumulative
}));
process.exit(0);
