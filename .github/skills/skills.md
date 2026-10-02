# STLC Skill Registry

The workflow coordinator selects a phase from this registry, resolves the project adapter inputs, and invokes `STLC Skill Worker`. The worker loads the referenced `SKILL.md` in an isolated context and returns the standard phase JSON envelope. The registry contains reusable skill metadata only; project paths, commands, frameworks, and integration policies belong to the invoking project agent.

## Registry Contract

Each entry defines:

- `phase`: stable phase identifier
- `skill`: reusable skill name
- `path`: workspace-relative `SKILL.md` path
- `inputs`: logical inputs the adapter must resolve
- `output`: logical output the adapter must resolve
- `worker`: required subagent, always `STLC Skill Worker`
- `retry_owner`: coordinator

## Skills

### Test Classification

- phase: `test-classification`
- skill: `stlc-test-classification`
- path: `.github/skills/stlc-test-classification/SKILL.md`
- inputs: requirement or work-item metadata, user workflow selection, run-state reference when resuming
- output: classification artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator

### Test Case Review

- phase: `test-case-review`
- skill: `stlc-test-case-review`
- path: `.github/skills/stlc-test-case-review/SKILL.md`
- inputs: classification, test plan, generated test cases, review conventions
- output: test-case review artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator

### Jira Upload and Verification

- phase: `upload-jira`
- skill: `stlc-jira-upload`
- path: `.github/skills/stlc-jira-upload/SKILL.md`
- creation script: `scripts/upload_jira.py`
- required invocation: `python scripts/upload_jira.py --input <approved_testcases.json> --story <story-key>`
- creation owner: orchestrator runs the repository script directly; do not delegate issue creation or substitute another Jira API path
- scope: script creates Jira `Test` issues from approved test cases and links them to the parent Story; it does not create Jira Story-type issues
- inputs: script execution summary and created issue keys, parent story ID, Jira auth adapter, live issue check rules
- output: Jira upload verification artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator
- worker scope: verification only; the worker must not create or relink Jira issues
- required validation: read back each created key, confirm issuetype is `Test`, confirm the link to the parent story, and verify expected statuses before returning `PASS`

### Automation Review

- phase: `automation-review`
- skill: `stlc-automation-review`
- path: `.github/skills/stlc-automation-review/SKILL.md`
- inputs: approved test cases, automation manifest, changed source files, project framework adapter, validation command
- output: automation review artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator

### Automation Execution

- phase: `automation-execution`
- skill: `stlc-automation-execution`
- path: `.github/skills/stlc-automation-execution/SKILL.md`
- inputs: automation manifest, test command, result-summary reference, configured `playwright` MCP server, execution target
- output: execution report artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator

### Report Generation

- phase: `report-generation`
- skill: `stlc-report-generation`
- path: `.github/skills/stlc-report-generation/SKILL.md`
- inputs: run-state reference, phase artifacts, execution evidence, retry history, usage data
- output: final report artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator

### Pull Request Creation

- phase: `pr-creation`
- skill: `stlc-pr-creation`
- path: `.github/skills/stlc-pr-creation/SKILL.md`
- inputs: completed report, repository adapter, branch policy, approved change list, work-item adapter
- output: pull-request handoff artifact reference
- worker: `STLC Skill Worker`
- retry_owner: coordinator
