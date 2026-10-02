'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const {
  detectPhaseIdentifier,
  readTokenLedger,
  transcriptDelta
} = require('./_util');

const scriptsDir = __dirname;
const repoRoot = path.resolve(scriptsDir, '../../..');
const tokenMeter = path.join(scriptsDir, 'token-meter.js');
const contextSummary = path.join(scriptsDir, 'context-summary.js');

function invoke(script, args, input) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    input: JSON.stringify(input)
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

test('meter records only transcript growth and rebuilds a useful current-schema summary', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'stlc-meter-'));
  const runId = 'DEMO-1-20261001-120000';
  const runDir = path.join(workspace, 'stlc', runId);
  const transcriptPath = path.join(workspace, 'transcript.jsonl');
  fs.mkdirSync(path.join(workspace, 'stlc', 'config'), { recursive: true });
  fs.mkdirSync(runDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(workspace, 'stlc', 'config', 'token-budget.json'), JSON.stringify({ totalRunBudget: 50000 }));
    fs.writeFileSync(transcriptPath, 'older conversation that must only be used as the starting baseline');
    fs.writeFileSync(path.join(runDir, 'state.json'), JSON.stringify({
      run_id: runId,
      story_id: 'DEMO-1',
      workflow_type: 'story',
      current_phase: 'test-plan',
      status: 'IN_PROGRESS',
      phase_history: [{
        phase_name: 'test-plan',
        status: 'IN_PROGRESS',
        retry_count: 0,
        token_usage: { total: 0, estimated: true, source: 'chars/4 workflow estimate' }
      }],
      artifacts: ['stlc/DEMO-1/ph1_jira.json']
    }));
    fs.writeFileSync(path.join(runDir, 'token_ledger.jsonl'), JSON.stringify({
      phase: null,
      estimatedPhaseTokens: 1242325,
      cumulativeTotal: 1242325,
      tokenSource: 'transcript_chars_div_4'
    }) + '\n');
    fs.writeFileSync(path.join(runDir, 'context_summary.json'), JSON.stringify({ cumulativeTokens: 1242325 }));

    const hookInput = {
      cwd: workspace,
      session_id: 'test-session',
      transcript_path: transcriptPath
    };
    invoke(tokenMeter, ['start'], hookInput);

    const addedText = 'new phase response text';
    fs.appendFileSync(transcriptPath, addedText);
    invoke(tokenMeter, ['stop'], hookInput);

    const ledger = fs.readFileSync(path.join(runDir, 'token_ledger.jsonl'), 'utf8')
      .trim().split(/\r?\n/).map((line) => JSON.parse(line));
    const measured = ledger[1];
    const expectedTokens = Math.ceil(addedText.length / 4);
    assert.equal(measured.schemaVersion, 2);
    assert.equal(measured.phase, 'test-plan');
    assert.equal(measured.phaseAttribution, 'active_state');
    assert.equal(measured.transcriptCharsDelta, addedText.length);
    assert.equal(measured.estimatedIntervalTokens, expectedTokens);
    assert.equal(measured.cumulativeTotal, expectedTokens);
    assert.equal(measured.legacyEntriesIgnored, 1);

    const updatedState = JSON.parse(fs.readFileSync(path.join(runDir, 'state.json'), 'utf8'));
    assert.equal(updatedState.phase_history[0].token_usage.total, expectedTokens);
    assert.equal(updatedState.phase_history[0].token_usage.source, 'transcript_growth_chars_div_4');

    invoke(contextSummary, [], { cwd: workspace });
    const summary = JSON.parse(fs.readFileSync(path.join(runDir, 'context_summary.json'), 'utf8'));
    assert.equal(summary.schemaVersion, 2);
    assert.equal(summary.run.runId, runId);
    assert.equal(summary.run.workflowType, 'story');
    assert.equal(summary.run.currentPhase, 'test-plan');
    assert.equal(summary.phases[0].phase, 'test-plan');
    assert.equal(summary.tokenUsage.cumulativeEstimatedTokens, expectedTokens);
    assert.equal(summary.tokenUsage.legacyEntriesIgnored, 1);
    assert.match(summary.nextAction, /test-plan/);
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test('phase resolution uses explicit metadata or active state, not arbitrary transcript text', () => {
  assert.deepEqual(detectPhaseIdentifier({ message: 'the test-plan phase failed' }, {}), {
    phase: null,
    source: 'unavailable'
  });
  assert.deepEqual(detectPhaseIdentifier({ phase_name: 'jira-upload' }, {}), {
    phase: 'upload-jira',
    source: 'explicit'
  });
  assert.deepEqual(detectPhaseIdentifier({}, {
    current_phase: 'automation-execution',
    phase_history: [{ phase_name: 'automation-review', status: 'IN_PROGRESS' }]
  }), {
    phase: 'automation-review',
    source: 'active_state'
  });
});

test('run resolution prefers one active run and refuses ambiguous active runs', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'stlc-run-resolution-'));
  try {
    const stlcDir = path.join(workspace, 'stlc');
    const firstRun = path.join(stlcDir, 'RUN-1');
    const secondRun = path.join(stlcDir, 'RUN-2');
    fs.mkdirSync(firstRun, { recursive: true });
    fs.mkdirSync(secondRun, { recursive: true });
    fs.writeFileSync(path.join(firstRun, 'state.json'), JSON.stringify({ status: 'IN_PROGRESS' }));
    fs.writeFileSync(path.join(secondRun, 'state.json'), JSON.stringify({ status: 'BLOCKED' }));

    const { findRunDir } = require('./_util');
    assert.equal(findRunDir(workspace), firstRun);

    fs.writeFileSync(path.join(secondRun, 'state.json'), JSON.stringify({ status: 'IN_PROGRESS' }));
    assert.equal(findRunDir(workspace), null);
    assert.equal(findRunDir(workspace, { run_id: 'RUN-2' }), secondRun);
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test('transcript truncation does not produce a negative estimate', () => {
  assert.equal(transcriptDelta(100, 25), 25);
});

test('modern ledger sums interval estimates and excludes legacy cumulative snapshots', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'stlc-ledger-'));
  const ledgerPath = path.join(workspace, 'token_ledger.jsonl');
  try {
    fs.writeFileSync(ledgerPath, [
      JSON.stringify({ cumulativeTotal: 1000000, estimatedPhaseTokens: 1000000 }),
      JSON.stringify({ schemaVersion: 2, estimatedIntervalTokens: 7 }),
      JSON.stringify({ schemaVersion: 2, estimatedIntervalTokens: 9 })
    ].join('\n'));
    assert.deepEqual(readTokenLedger(ledgerPath), {
      total: 16,
      estimatedEntries: 2,
      unavailableIntervals: 0,
      legacyEntriesIgnored: 1,
      entries: [
        { cumulativeTotal: 1000000, estimatedPhaseTokens: 1000000 },
        { schemaVersion: 2, estimatedIntervalTokens: 7 },
        { schemaVersion: 2, estimatedIntervalTokens: 9 }
      ]
    });
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

test('legacy-only ledger reports unknown rather than zero trusted usage', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'stlc-legacy-ledger-'));
  const ledgerPath = path.join(workspace, 'token_ledger.jsonl');
  try {
    fs.writeFileSync(ledgerPath, JSON.stringify({ cumulativeTotal: 1242325, phase: null }) + '\n');
    const usage = readTokenLedger(ledgerPath);
    assert.equal(usage.total, null);
    assert.equal(usage.estimatedEntries, 0);
    assert.equal(usage.legacyEntriesIgnored, 1);
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});
