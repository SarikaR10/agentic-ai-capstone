---
name: Playwright API Test Standards
description: "Use when generating or reviewing Playwright API, REST, HTTP, request, contract, or service tests."
---
# Playwright API Test Standards

- Generate API tests with Playwright Test and `APIRequestContext` or the configured Playwright request fixture. Do not introduce a second API test framework.
- Test the API contract and business behavior directly; do not drive API tests through the browser UI.
- Assert status codes, response shape, required fields, and meaningful business values. Validate error status, error structure, and rejection behavior for negative cases.
- Use request fixtures and helper functions for shared setup, authentication, headers, payloads, and cleanup; keep test data explicit and isolated.
- Avoid hardcoded credentials, tokens, hostnames, or environment-specific IDs. Use configured environment variables or test fixtures.
- Keep tests independent and safe to rerun. Do not depend on execution order or data created by another test.
- Prefer deterministic payloads and boundary-focused cases. Do not weaken assertions to accommodate unstable data.
- Use Playwright assertions and clear request/response diagnostics. Record response details needed to diagnose failures without exposing secrets.
- Keep each test focused, with descriptive names that state the operation and expected outcome.
