# Test Plan — FG-003: Enforce minor beneficiary rule - require DOB or guardianName consistently on create/update

## Scope & Objectives
Define and validate comprehensive test coverage for enforcing the minor beneficiary data validation rule across both API and UI channels. Ensure that beneficiary create and update operations require either a Date of Birth (DOB) or Guardian Name, consistently preventing invalid data states.

**Objectives:**
1. Validate API endpoints enforce DOB/guardianName requirement on create and update
2. Validate UI forms enforce the same rule with appropriate error messaging
3. Ensure regression coverage for existing beneficiary workflows
4. Verify edge cases around nullable fields and field combinations

## Test Approach
- **Automation-Driven:** All functional scenarios will be automated using Cucumber + Selenium + TestNG per framework conventions
- **Regression:** Automated regression suite to ensure existing beneficiary flows remain unaffected
- **Functional Coverage:** Core create/update workflows with valid/invalid data combinations
- **API-First:** API validation tests will run first (unit/integration), followed by UI end-to-end tests

## In Scope / Out of Scope

**In Scope:**
- Beneficiary create API with missing DOB and guardianName
- Beneficiary update API with invalid field combinations  
- UI form validation for DOB/guardianName
- Error messages and user feedback on validation failure
- Regression: existing beneficiary CRUD workflows should remain functional

**Out of Scope:**
- Performance/load testing
- Accessibility testing (covered separately)
- Mobile app testing (if applicable)
- Downstream integrations beyond immediate API response

## Environment & Test Data
- **Test Env:** QA environment with seeded minor beneficiary test data
- **Test Data:** 
  - Valid records: DOB present (no guardian), Guardian Name present (no DOB), both present
  - Invalid records: neither DOB nor guardian name, empty strings, whitespace-only values
  - Edge cases: DOB in future, invalid date formats, special characters in guardian name

## Entry / Exit Criteria

**Entry Criteria:**
- Code changes to beneficiary create/update logic are merged to staging branch
- Test data and QA environment are available
- API documentation is finalized

**Exit Criteria:**
- All test cases execute without skips
- No critical/high-severity failures remain
- Regression test suite passes
- Code coverage >= 85% for modified beneficiary validation logic

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| API field naming inconsistency across create/update | Medium | Review API contract early; document exact field names in test data setup |
| UI framework changes affecting selectors | Medium | Use framework BasePage pattern; maintain centralized locators |
| Timezone/locale issues with DOB | Low | Use ISO-8601 format for test data; test with UTC |
| Concurrent update race conditions | Low | Use fresh test data per scenario; avoid test interdependencies |

## Schedule
- **Phase 2 (Test Cases):** 1-2 days — detailed scenario writing
- **Phase 4 (Automation):** 2-3 days — page objects, step definitions, utilities
- **Phase 7 (Execution):** 1 day — test run and result reporting
- **Total Effort:** ~1 week from start to final report
