'use strict';
// Shared helpers for stlc hook scripts. Kept dependency-free (Node builtins only).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function readStdin() {
  try {
    const data = fs.readFileSync(0, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function stlcRoot(cwd) {
  return path.join(cwd || process.cwd(), 'stlc');
}

// Finds the most recently modified stlc/<run-id>/state.json, since hooks aren't told the run-id directly.
function findLatestRunDir(cwd) {
  const root = stlcRoot(cwd);
  if (!fs.existsSync(root)) return null;
  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'config' && e.name !== 'knowledge');
  let latest = null;
  let latestMtime = 0;
  for (const e of entries) {
    const statePath = path.join(root, e.name, 'state.json');
    if (fs.existsSync(statePath)) {
      const mtime = fs.statSync(statePath).mtimeMs;
      if (mtime > latestMtime) {
        latestMtime = mtime;
        latest = path.join(root, e.name);
      }
    }
  }
  return latest;
}

function findRunDir(cwd, input = {}) {
  const root = stlcRoot(cwd);
  const runId = input.run_id || input.runId;
  if (typeof runId === 'string' && runId && path.basename(runId) === runId) {
    const candidate = path.join(root, runId);
    if (fs.existsSync(path.join(candidate, 'state.json'))) return candidate;
  }

  if (fs.existsSync(root)) {
    const activeRuns = fs.readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'config' && entry.name !== 'knowledge')
      .map((entry) => ({
        dir: path.join(root, entry.name),
        state: readJsonSafe(path.join(root, entry.name, 'state.json'), null)
      }))
      .filter(({ state }) => state && String(state.status).toLowerCase() === 'in_progress');
    if (activeRuns.length === 1) return activeRuns[0].dir;
    if (activeRuns.length > 1) return null;
  }
  return findLatestRunDir(cwd);
}

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

function appendLine(filePath, line) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, line + '\n');
}

function output(obj) {
  process.stdout.write(JSON.stringify(obj));
}

const PHASES = [
    'test-classification', 'read-jira', 'test-plan', 'test-case-generation',
    'test-case-review', 'upload-jira', 'automation-generation',
    'automation-review', 'automation-execution', 'self-heal',
    'report-generation', 'pr-creation', 'jira-close'
  ];

function normalizePhase(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
  const aliases = {
    'jira-read': 'read-jira',
    'jira-upload': 'upload-jira',
    'jira-close': 'jira-close',
    'jira-report-comment-and-close': 'jira-close',
    'pr-creation': 'pr-creation',
    'test-case-review': 'test-case-review'
  };
  const phase = aliases[normalized] || normalized;
  return PHASES.includes(phase) ? phase : null;
}

function activePhaseFromState(state) {
  const history = Array.isArray(state && state.phase_history) ? state.phase_history : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    if (entry && String(entry.status).toLowerCase() === 'in_progress') {
      return normalizePhase(entry.phase_name);
    }
  }
  return normalizePhase(state && (state.current_phase || state.currentPhase));
}

function detectPhaseIdentifier(input, state = null) {
  const candidates = [
    input && input.phase,
    input && input.phase_name,
    input && input.phaseName,
    input && input.current_phase,
    input && input.currentPhase
  ];
  for (const candidate of candidates) {
    const phase = normalizePhase(candidate);
    if (phase) return { phase, source: 'explicit' };
  }
  const phase = activePhaseFromState(state || {});
  return phase ? { phase, source: 'active_state' } : { phase: null, source: 'unavailable' };
}

function transcriptCharCount(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;
  try {
    return fs.readFileSync(transcriptPath, 'utf8').length;
  } catch {
    return null;
  }
}

function transcriptDelta(startChars, endChars) {
  if (!Number.isFinite(startChars) || !Number.isFinite(endChars)) return null;
  if (endChars < startChars) return endChars;
  return endChars - startChars;
}

function transcriptCursorKey(sessionId, transcriptPath) {
  return crypto.createHash('sha256')
    .update(`${sessionId || 'no-session'}\n${path.resolve(transcriptPath || '')}`)
    .digest('hex');
}

function readTokenLedger(ledgerPath) {
  let entries = [];
  try {
    entries = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);
  } catch {
    return {
      total: null,
      estimatedEntries: 0,
      unavailableIntervals: 0,
      legacyEntriesIgnored: 0,
      entries: []
    };
  }

  let total = 0;
  let estimatedEntries = 0;
  let unavailableIntervals = 0;
  let legacyEntriesIgnored = 0;
  for (const entry of entries) {
    if (entry.schemaVersion === 2) {
      if (Number.isFinite(entry.estimatedIntervalTokens)) {
        total += Math.max(0, entry.estimatedIntervalTokens);
        estimatedEntries += 1;
      } else {
        unavailableIntervals += 1;
      }
    } else {
      legacyEntriesIgnored += 1;
    }
  }
  return {
    total: estimatedEntries ? total : null,
    estimatedEntries,
    unavailableIntervals,
    legacyEntriesIgnored,
    entries
  };
}

function summarizePhaseHistory(state) {
  const history = Array.isArray(state && state.phase_history) ? state.phase_history : [];
  return history.map((entry) => ({
    phase: entry.phase_name || null,
    status: entry.status || 'UNKNOWN',
    retryCount: Number(entry.retry_count || 0),
    outputRef: entry.output_json || null,
    startTime: entry.start_time || null,
    endTime: entry.end_time || null,
    tokenEstimate: entry.token_usage && Number.isFinite(entry.token_usage.total)
      ? entry.token_usage.total
      : null,
    tokenEstimateSource: entry.token_usage && entry.token_usage.source || null
  }));
}

module.exports = {
  readStdin,
  stlcRoot,
  findLatestRunDir,
  findRunDir,
  readJsonSafe,
  writeJson,
  appendLine,
  output,
  detectPhaseIdentifier,
  normalizePhase,
  transcriptCharCount,
  transcriptDelta,
  transcriptCursorKey,
  readTokenLedger,
  summarizePhaseHistory
};
