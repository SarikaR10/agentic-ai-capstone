---
name: Playwright UI Test Standards
description: "Use when generating or reviewing Playwright UI, browser, end-to-end, page, or user-flow tests."
---
# Playwright UI Test Standards

- Generate UI tests with Playwright Test. Do not introduce Selenium, Cypress, or custom browser drivers.
- Test user-visible behavior and business outcomes, not implementation details.
- Prefer accessible locators such as `getByRole`, `getByLabel`, and `getByText`; use stable test IDs only when needed. Avoid CSS/XPath tied to layout or generated classes.
- Use Playwright web-first assertions and built-in auto-waiting. Do not add arbitrary sleeps or fixed delays.
- Keep tests independent: create required data in setup, isolate state, and avoid test-order dependencies.
- Reuse page objects or focused fixtures when they reduce duplication; keep selectors and workflows close to the feature they serve.
- Assert the important result, including visible validation, navigation, saved state, or relevant network outcome.
- Keep each test focused and readable. Use descriptive test and step names.
- Use the configured base URL, projects, authentication, retries, and trace settings; do not hardcode environment-specific URLs or credentials.
- Preserve diagnostic evidence on failure through the repository's configured screenshots, traces, videos, or reports.
