'use strict';
// PreToolUse: block destructive Git operations; Phase 9 may commit and push with an explicit marker.
const { readStdin, output } = require('./_util');

const input = readStdin();
const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};
const command = toolInput.command || toolInput.commandLine || '';

const isExecuteTool = /run_in_terminal|execute|terminal/i.test(toolName);
const isPhase9 = /(?:\$env:STLC_PHASE\s*=\s*['"]?9|STLC_PHASE\s*=\s*['"]?9)/i.test(command);

const DENY_PATTERNS = [
  /\bgit\s+reset\s+--hard\b/i,
  /\brm\s+-rf\b/i,
  /\bRemove-Item\b.*-Recurse.*-Force/i
];

if (isExecuteTool && command && !isPhase9 && /\bgit\s+(?:commit|push)\b/i.test(command)) {
  output({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'stlc-git-guard: commit/push is reserved for Phase 9 and requires the STLC_PHASE=9 marker.'
    }
  });
  process.exit(0);
}

if (isExecuteTool && command) {
  const hit = DENY_PATTERNS.find((re) => re.test(command));
  if (hit) {
    output({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'stlc-git-guard: destructive Git operations are blocked; commit/push is permitted only for Phase 9 with the STLC_PHASE=9 marker.'
      }
    });
    process.exit(0);
  }
}

// No output = default allow.
process.exit(0);
