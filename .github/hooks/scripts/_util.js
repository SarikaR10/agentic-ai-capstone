'use strict';
// Shared helpers for stlc hook scripts. Kept dependency-free (Node builtins only).
const fs = require('fs');
const path = require('path');

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

// Scans every string value in the hook input for "Phase N" rather than relying on one exact field
// name (the runtime's actual subagent-identity field isn't documented/stable across versions).
function detectPhaseNumber(input) {
  const seen = new Set();
  const stack = [input];
  while (stack.length) {
    const val = stack.pop();
    if (typeof val === 'string') {
      const m = val.match(/phase\s*[- ]?(\d)/i);
      if (m) return m[1];
    } else if (val && typeof val === 'object' && !seen.has(val)) {
      seen.add(val);
      for (const v of Object.values(val)) stack.push(v);
    }
  }
  return null;
}

module.exports = { readStdin, stlcRoot, findLatestRunDir, readJsonSafe, writeJson, appendLine, output, detectPhaseNumber };
