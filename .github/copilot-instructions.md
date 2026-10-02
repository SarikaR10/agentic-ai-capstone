# Project Instructions

## Repository Context

- This repository is a Java Gradle test automation framework using Cucumber, TestNG, Selenium, and WebDriverManager.
- Existing Java automation should follow the current framework structure and conventions unless the current story explicitly requests Playwright automation.
- New or regenerated automation for the STLC workflow must use Playwright Test for UI and API coverage and follow the scoped instructions in `.github/instructions/ui/` and `.github/instructions/api/`.
- Browser-level Playwright verification must use the configured `playwright` MCP server in `.vscode/mcp.json`.
- STLC workflow definitions live under `.github/agents/` and `.github/skills/`. Reusable skills must remain project-neutral; project paths, commands, framework details, and integrations belong in agents or adapter context.

## Change Guidelines

- Read nearby implementations and tests before editing.
- Make the smallest focused change that satisfies the request. Preserve public APIs, existing naming, and file layout unless a change is required.
- Reuse existing page objects, utilities, fixtures, configuration, and test data before adding new abstractions.
- Do not hardcode credentials, tokens, environment URLs, generated IDs, or machine-specific paths.
- Keep tests deterministic, isolated, and safe to rerun. Do not add arbitrary sleeps or weaken assertions to hide failures.
- Keep test data and selectors maintainable. Prefer stable selectors and observable business outcomes.
- Do not modify generated build output under `build/` as source code.
- Do not commit, push, reset, or create branches unless explicitly requested.
- Do not revert unrelated user changes.

## Validation

- Use `gradle compileJava` for main-source compilation when relevant.
- Use `gradle compileTestJava` for test-source compilation when relevant.
- Use `gradle test` for the full configured TestNG suite when relevant.
- Report validation limitations, environment blockers, and zero-test discovery clearly.
- Keep implementation changes separate from reports, logs, screenshots, traces, and other generated artifacts unless the workflow requires those artifacts to be committed.

## STLC Workflow

- The orchestrator is the only component that selects the next phase, owns retries, and persists phase state.
- For skill phases, resolve `.github/skills/skills.md` and invoke `STLC Skill Worker` with the skill path, adapter context, artifact references, and retry information.
- Every phase worker must return the standard strict JSON envelope. Do not replace it with prose.
- Preserve run artifacts under the project-configured run directory and retain existing artifact names for backward compatibility.
- Reviews must return actionable findings. Execution results must distinguish passed, failed, blocked, and zero-test outcomes.
- Do not claim a pull request, issue-tracker update, or ticket closure unless the required URL or artifact exists.
- Before closing a Jira story, retrieve all linked test cases, close any that are `In Progress`, re-verify their statuses, and close the story only when every linked test case is `Closed`.

## Communication

- Explain assumptions briefly and use repository-relative file references.
- Keep responses concise while naming the change, validation performed, and any remaining risk.
