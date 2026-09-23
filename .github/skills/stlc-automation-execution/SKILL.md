---
name: stlc-automation-execution
description: "Execute an approved automation suite and perform configured browser-level verification. Use after automation review or a self-heal rerun, with commands, targets, and artifact references supplied by the workflow coordinator."
---
# Automation Execution

Read the coordinator-supplied conventions and automation manifest. Run the supplied test command and read the configured result summary when available. Write the execution report to the supplied output reference with counts and concise scenario failures.

For UI workflows, use the configured `playwright` MCP server for browser verification. Do not substitute an unconfigured browser tool. Verify the supplied target, navigation, controls, visible validation, completion, and persisted state when the environment is available. Record browser/environment blockers separately from product or automation failures. Do not silently treat zero discovered tests as a pass; report zero-test discovery as unverified and route it for diagnosis.

Return `PASS` only when the intended tests execute and pass. Return `FAIL` for test failures, execution blockers, or zero-test discovery. The coordinator owns self-heal routing and execution retry limits.

Return the standard phase envelope with the execution report reference in `artifacts`, failure details in `errors`, and execution counts in `outputs`.
