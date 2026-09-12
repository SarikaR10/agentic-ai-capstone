# Test Plan — DEMO-1: Add "Remember Me" checkbox to login page

## Scope & Objectives
Verify that a new "Remember Me" checkbox on the login page correctly persists a user's session for 30 days when checked, and that default (unchecked) login behavior is unchanged. Objective: confirm functional correctness, UI presence/behavior, and no regression to existing login flows.

## Test Approach
Manual exploratory pass for initial UI verification, backed by automated functional regression coverage (automation is in scope). Automated tests will extend the existing Cucumber/TestNG login suite (`login.feature`, `LoginPage.java`) rather than introducing a new framework pattern.

## In Scope / Out of Scope
**In scope:**
- Presence and behavior of the "Remember Me" checkbox on the login page.
- Session persistence for 30 days when checked.
- Session expiry behavior (standard session length) when unchecked.
- Regression of existing login functionality (valid/invalid login, checkbox not interfering with existing flow).

**Out of scope:**
- Password reset, registration, or other unrelated auth flows.
- Non-login pages/modules.

## Environment & Test Data
- Existing test environment/config via `config.properties` / `ConfigReader.java`.
- Test data: valid and invalid credentials from `testdata.json`; no new test data fields required beyond existing user credentials.
- Browser/session inspection (cookie/local storage expiry) needed to validate the 30-day persistence claim.

## Entry / Exit Criteria
**Entry:** "Remember Me" checkbox implemented and deployed to test environment; login page loads without errors.
**Exit:** All P1/P2 functional test cases pass; no regression in existing login scenarios; automated suite green.

## Risks & Mitigations
- **Risk:** Session persistence duration (30 days) is hard to verify in real time. **Mitigation:** verify via cookie/token expiry attribute inspection rather than waiting 30 days.
- **Risk:** Change unintentionally affects default (non-checked) session behavior. **Mitigation:** include explicit regression case for unchecked login.
- Overall risk is Low — change is isolated to the login module.

## Schedule
Lightweight effort proportional to P2/Low risk: test case authoring and automation expected within a single pipeline pass, no extended manual test cycle required.
