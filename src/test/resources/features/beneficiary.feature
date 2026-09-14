Feature: Enforce minor beneficiary rule - require DOB or guardianName consistently

  @TC-001 @positive
  Scenario: Create beneficiary with valid DOB only
    Given user is on the beneficiary creation page
    When user enters beneficiary name "John"
    And user enters date of birth "2015-06-15"
    And user submits the beneficiary form
    Then the beneficiary should be created successfully
    And the beneficiary record should have dob populated
    And the API response status should be 201

  @TC-002 @positive
  Scenario: Create beneficiary with valid guardian name only
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Jane"
    And user enters guardian name "Mary Smith"
    And user submits the beneficiary form
    Then the beneficiary should be created successfully
    And the beneficiary record should have guardianName populated
    And the API response status should be 201

  @TC-003 @positive
  Scenario: Create beneficiary with both DOB and guardian name
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Bob"
    And user enters date of birth "2014-03-20"
    And user enters guardian name "John Doe"
    And user submits the beneficiary form
    Then the beneficiary should be created successfully
    And the API response status should be 201

  @TC-004 @negative
  Scenario: Create beneficiary with missing DOB and guardianName
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Alice"
    And user submits the beneficiary form without DOB or guardian
    Then validation error "Either DOB or guardianName is required" should appear
    And the form should not submit
    And the API response status should be 400

  @TC-005 @negative
  Scenario: Create beneficiary with empty DOB and empty guardianName
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Tom"
    And user leaves DOB field empty
    And user leaves guardian name field empty
    And user submits the beneficiary form
    Then validation error should appear
    And the API response status should be 400

  @TC-006 @edge
  Scenario: Create beneficiary with whitespace-only guardian name
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Tim"
    And user enters whitespace-only guardian name "   "
    And user submits the beneficiary form
    Then validation error should appear
    And the API response status should be 400

  @TC-007 @edge
  Scenario: Create beneficiary with DOB in future
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Future"
    And user enters future date of birth "2030-01-01"
    And user submits the beneficiary form
    Then validation error "DOB cannot be in the future" should appear
    And the API response status should be 400

  @TC-008 @negative
  Scenario: Create beneficiary with invalid DOB format
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Invalid"
    And user enters invalid date format "15/06/2015"
    And user submits the beneficiary form
    Then validation error for invalid date format should appear
    And the API response status should be 400

  @TC-009 @positive
  Scenario: Update beneficiary - remove DOB, keep guardianName
    Given beneficiary exists with both DOB and guardian name
    When user navigates to edit beneficiary form
    And user clears the date of birth field
    And user submits the update
    Then the update should succeed
    And the beneficiary should retain guardian name
    And the API response status should be 200

  @TC-010 @positive
  Scenario: Update beneficiary - remove guardianName, keep DOB
    Given beneficiary exists with both DOB and guardian name
    When user navigates to edit beneficiary form
    And user clears the guardian name field
    And user submits the update
    Then the update should succeed
    And the beneficiary should retain DOB
    And the API response status should be 200

  @TC-011 @negative
  Scenario: Update beneficiary - remove both DOB and guardianName
    Given beneficiary exists with both DOB and guardian name
    When user navigates to edit beneficiary form
    And user clears both DOB and guardian name fields
    And user submits the update
    Then validation error "Either DOB or guardianName is required" should appear
    And the beneficiary record should not be updated
    And the API response status should be 400

  @TC-012 @positive
  Scenario: Update beneficiary - add guardian name to DOB-only record
    Given beneficiary exists with only DOB
    When user navigates to edit beneficiary form
    And user adds guardian name "John"
    And user submits the update
    Then the update should succeed
    And the beneficiary record should now have guardian name
    And the API response status should be 200

  @TC-013 @ui @negative
  Scenario: UI form validation - submit without DOB or guardian name
    Given user is on the beneficiary creation form in UI
    When user enters beneficiary name only
    And user clicks the Save button
    Then the form should display validation error "Either DOB or Guardian Name is required"
    And the form should not submit
    And no HTTP request should be made

  @TC-014 @ui @positive
  Scenario: UI form - submit with valid DOB
    Given user is on the beneficiary creation form in UI
    When user enters beneficiary name "John"
    And user enters date of birth "2015-06-15"
    And user leaves guardian name field blank
    And user clicks the Save button
    Then beneficiary creation should succeed
    And confirmation message should be displayed
    And user should be navigated to beneficiary details page

  @TC-015 @ui @positive
  Scenario: UI form - submit with valid guardian name
    Given user is on the beneficiary creation form in UI
    When user enters beneficiary name "Jane"
    And user enters guardian name "Mary Smith"
    And user leaves DOB field blank
    And user clicks the Save button
    Then beneficiary creation should succeed
    And confirmation message should be displayed
    And user should be navigated to beneficiary details page

  @TC-016 @ui @negative
  Scenario: UI update form - attempt to clear both fields
    Given beneficiary edit form is open with both fields populated
    When user clears the DOB field
    And user clears the guardian name field
    And user clicks the Save button
    Then form validation error should be displayed
    And beneficiary data should not be saved
    And form should retain the invalid state for user correction

  @TC-017 @regression
  Scenario: Regression - existing create flow with both fields
    Given user is on the beneficiary creation page
    When user creates beneficiary with complete data including DOB and guardian name
    Then the beneficiary should be created successfully
    And the API response status should be 201
    And both fields should be persisted

  @TC-018 @regression
  Scenario: Regression - existing update flow works
    Given beneficiary exists in system
    When user performs partial update on beneficiary record
    Then the update should complete successfully
    And the API response status should be 200
    And updated fields should be persisted

  @TC-019 @regression
  Scenario: Regression - list beneficiaries shows all records
    Given multiple beneficiaries exist in database
    When user retrieves the list of all beneficiaries
    Then the API response should contain all beneficiaries
    And the API response status should be 200
    And each record should include dob and guardianName fields
    And the response structure should match the API contract

  @TC-020 @edge
  Scenario: Create beneficiary with special characters in guardian name
    Given user is on the beneficiary creation page
    When user enters beneficiary name "Test"
    And user enters guardian name "Mary O'Brien-Smith (Dr.)"
    And user submits the beneficiary form
    Then the beneficiary should be created successfully
    And the guardian name should preserve special characters
    And the API response status should be 201
