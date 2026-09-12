'use strict';
// PostToolUse: after a `gradle test` run, deterministically parse TestNG/JUnit XML into a compact
// JSON summary so Phase 7/8 don't have to read raw XML/console output (token savings + reliability).
const fs = require('fs');
const path = require('path');
const { readStdin, writeJson } = require('./_util');

const input = readStdin();
const toolInput = input.tool_input || {};
const command = toolInput.command || toolInput.commandLine || '';

if (!/gradle(\.bat)?\s+test\b/i.test(command)) process.exit(0);

const resultsDir = path.join(input.cwd || process.cwd(), 'build', 'test-results', 'test');
if (!fs.existsSync(resultsDir)) process.exit(0);

const files = fs.readdirSync(resultsDir).filter((f) => f.endsWith('.xml'));
let tests = 0, failures = 0, errors = 0, skipped = 0;
const failedCases = [];

for (const f of files) {
  const xml = fs.readFileSync(path.join(resultsDir, f), 'utf8');
  const suiteMatch = xml.match(/<testsuite[^>]*\stests="(\d+)"[^>]*\sfailures="(\d+)"[^>]*\serrors="(\d+)"[^>]*\sskipped="(\d+)"/);
  if (suiteMatch) {
    tests += Number(suiteMatch[1]);
    failures += Number(suiteMatch[2]);
    errors += Number(suiteMatch[3]);
    skipped += Number(suiteMatch[4]);
  }
  const caseRe = /<testcase[^>]*\sname="([^"]+)"[^>]*>([\s\S]*?)<\/testcase>/g;
  let m;
  while ((m = caseRe.exec(xml))) {
    const [, name, body] = m;
    const failMatch = body.match(/<(?:failure|error)[^>]*message="([^"]*)"/);
    if (failMatch) failedCases.push({ name, error: failMatch[1] });
  }
}

writeJson(path.join(resultsDir, 'summary.json'), { tests, failures, errors, skipped, failedCases });
process.stdout.write(JSON.stringify({ systemMessage: `stlc: gradle test summary — ${tests} tests, ${failures + errors} failed, ${skipped} skipped.` }));
process.exit(0);
