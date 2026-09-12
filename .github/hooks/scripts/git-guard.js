'use strict';
// PreToolUse: deterministically block commit/push/reset --hard/rm -rf; allow branch-create/add/status/diff/gradle.
const { readStdin, output } = require('./_util');

const input = readStdin();
const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};
const command = toolInput.command || toolInput.commandLine || '';

const isExecuteTool = /run_in_terminal|execute|terminal/i.test(toolName);

const DENY_PATTERNS = [
  /\bgit\s+commit\b/i,
  /\bgit\s+push\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\brm\s+-rf\b/i,
  /\bRemove-Item\b.*-Recurse.*-Force/i
];

if (isExecuteTool && command) {
  const hit = DENY_PATTERNS.find((re) => re.test(command));
  if (hit) {
    output({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'stlc-git-guard: this pipeline stages changes only (git add) — commits/pushes/hard-resets/rm -rf are blocked. A human must commit.'
      }
    });
    process.exit(0);
  }
}

// No output = default allow.
process.exit(0);
