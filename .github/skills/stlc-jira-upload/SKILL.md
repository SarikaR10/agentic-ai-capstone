---
name: stlc-jira-upload
description: "Verify Jira issue creation and linkage after uploading test cases. Use for post-upload read-after-write checks before the workflow can declare the Jira phase successful."
---
# Jira Upload Verification

The orchestrator owns Jira issue creation and must run the repository script with the coordinator-supplied approved test-case artifact and parent story key:

`python scripts/upload_jira.py --input <approved_testcases.json> --story <story-key>`

This script creates Jira `Test` issues and links them to the parent Story; it does not create Story-type issues. Do not create, retry, or relink issues through this skill or an alternate Jira API path. Use the script execution result and its created issue keys as the inputs to verification. If the script did not run successfully or its output does not identify the created issue keys, return `FAIL` and report the blocker; do not infer success from an artifact.

Perform a live verification pass against Jira before reporting success.

The verification step is mandatory and non-negotiable:
- Read back every issue key reported by `scripts/upload_jira.py` after the script completes.
- Confirm each created issue exists and has the expected issue type, especially `Test` when the workflow creates test cases.
- Confirm each issue is linked to the parent story or the configured work item.
- Confirm the expected status transition was applied or the issue is in the correct state for the workflow.
- If script output reports any create, link, or transition failure, or if any read-after-write check fails, return `FAIL` even when some creates succeeded.

Do not treat generated IDs, local JSON output, or API success responses as proof of completion. Artifact generation alone is not evidence. Only a successful live Jira read-back confirms the external state.

Return the standard phase envelope with the Jira verification artifact reference in `artifacts`, verified keys, issue types, parent links, and statuses in `outputs`, and any missing/incorrect verification details in `errors`.
