# Test Cases — DEMO-1: Add "Remember Me" checkbox to login page

| ID | Title | Preconditions | Steps | Expected Result | Priority | Type |
|----|-------|----------------|-------|------------------|----------|------|
| TC-001 | Remember Me checkbox is visible on login page | User is on the login page | 1. Navigate to the login page | Checkbox labeled "Remember Me" is displayed alongside username/password fields | P2 | functional |
| TC-002 | Login with Remember Me checked persists session for 30 days | User has valid credentials | 1. Navigate to login page<br>2. Enter valid username/password<br>3. Check "Remember Me"<br>4. Submit login | Login succeeds; session/auth cookie or token is created with an expiry of ~30 days | P1 | functional |
| TC-003 | Login with Remember Me unchecked uses default session length | User has valid credentials | 1. Navigate to login page<br>2. Enter valid username/password<br>3. Leave "Remember Me" unchecked<br>4. Submit login | Login succeeds; session/auth cookie or token uses the standard (non-30-day) expiry | P1 | regression |
| TC-004 | Session persists after browser restart when Remember Me checked | User logged in previously with "Remember Me" checked | 1. Login with "Remember Me" checked<br>2. Close and reopen the browser<br>3. Navigate to the application | User remains logged in without re-entering credentials | P2 | functional |
| TC-005 | Session does not persist after browser restart when Remember Me unchecked | User logged in previously without checking "Remember Me" | 1. Login with "Remember Me" unchecked<br>2. Close and reopen the browser<br>3. Navigate to the application | User is prompted to log in again | P2 | regression |
| TC-006 | Invalid login attempt with Remember Me checked | User has invalid credentials | 1. Navigate to login page<br>2. Enter invalid username/password<br>3. Check "Remember Me"<br>4. Submit login | Login fails with an error message; no session/cookie is created | P2 | negative |
| TC-007 | Remember Me checkbox state does not persist across separate login attempts | User is on the login page | 1. Navigate to login page<br>2. Check "Remember Me"<br>3. Do not submit; reload the login page | Checkbox resets to unchecked on page reload | P3 | edge |
| TC-008 | Existing valid login flow unaffected by new checkbox | User has valid credentials | 1. Navigate to login page<br>2. Enter valid username/password<br>3. Submit login without interacting with the checkbox | Login succeeds as before; checkbox defaults to unchecked | P1 | regression |

## Changes since last review
N/A — initial version.
