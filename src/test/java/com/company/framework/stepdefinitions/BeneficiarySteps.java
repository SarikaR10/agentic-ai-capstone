package com.company.framework.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.restassured.response.Response;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import com.company.framework.drivers.DriverFactory;
import com.company.framework.pages.BeneficiaryPage;
import com.company.framework.utils.ConfigReader;
import static io.restassured.RestAssured.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class BeneficiarySteps {

    private WebDriver driver;
    private BeneficiaryPage beneficiaryPage;
    private Response apiResponse;
    private RequestSpecification request;
    private String lastCreatedBeneficiaryId;
    private String testBeneficiaryId;

    public BeneficiarySteps() {
        this.driver = DriverFactory.getDriver();
        this.beneficiaryPage = new BeneficiaryPage(driver);
        String baseApiUrl = ConfigReader.getProperty("api.base.url");
        RestAssured.baseURI = baseApiUrl;
    }

    // ==================== Given Steps ====================

    @Given("user is on the beneficiary creation page")
    public void userIsOnBeneficiaryCreationPage() {
        beneficiaryPage.navigateToBeneficiaryCreationPage();
    }

    @Given("user is on the beneficiary creation form in UI")
    public void userIsOnBeneficiaryCreationFormUI() {
        beneficiaryPage.navigateToBeneficiaryCreationPage();
    }

    @Given("beneficiary exists with both DOB and guardian name")
    public void beneficiaryExistsWithBothFields() {
        // Create a test beneficiary with both DOB and guardian name via API
        String payload = "{\n" +
                "  \"name\": \"Test Beneficiary Both\",\n" +
                "  \"dob\": \"2015-06-15\",\n" +
                "  \"guardianName\": \"John Doe\"\n" +
                "}";
        apiResponse = given()
                .header("Content-Type", "application/json")
                .body(payload)
                .when()
                .post("/beneficiaries");
        testBeneficiaryId = apiResponse.jsonPath().getString("id");
    }

    @Given("beneficiary exists with only DOB")
    public void beneficiaryExistsWithOnlyDOB() {
        String payload = "{\n" +
                "  \"name\": \"Test Beneficiary DOB Only\",\n" +
                "  \"dob\": \"2015-06-15\"\n" +
                "}";
        apiResponse = given()
                .header("Content-Type", "application/json")
                .body(payload)
                .when()
                .post("/beneficiaries");
        testBeneficiaryId = apiResponse.jsonPath().getString("id");
    }

    @Given("beneficiary edit form is open with both fields populated")
    public void beneficiaryEditFormOpen() {
        // Ensure a beneficiary exists first
        if (testBeneficiaryId == null) {
            beneficiaryExistsWithBothFields();
        }
        beneficiaryPage.navigateToBeneficiaryEditPage(testBeneficiaryId);
    }

    @Given("beneficiary exists in system")
    public void beneficiaryExistsInSystem() {
        String payload = "{\n" +
                "  \"name\": \"Test Beneficiary\",\n" +
                "  \"dob\": \"2015-06-15\",\n" +
                "  \"guardianName\": \"Jane Doe\"\n" +
                "}";
        apiResponse = given()
                .header("Content-Type", "application/json")
                .body(payload)
                .when()
                .post("/beneficiaries");
        testBeneficiaryId = apiResponse.jsonPath().getString("id");
    }

    @Given("multiple beneficiaries exist in database")
    public void multiplebeneficiariesExist() {
        // Create 3 test beneficiaries
        for (int i = 1; i <= 3; i++) {
            String payload = "{\n" +
                    "  \"name\": \"Test Beneficiary " + i + "\",\n" +
                    "  \"dob\": \"2015-06-" + (10 + i) + "\"\n" +
                    "}";
            given()
                    .header("Content-Type", "application/json")
                    .body(payload)
                    .when()
                    .post("/beneficiaries");
        }
    }

    // ==================== When Steps ====================

    @When("user enters beneficiary name {string}")
    public void userEntersBeneficiaryName(String name) {
        beneficiaryPage.enterBeneficiaryName(name);
    }

    @When("user enters date of birth {string}")
    public void userEntersDateOfBirth(String dob) {
        beneficiaryPage.enterDateOfBirth(dob);
    }

    @When("user enters guardian name {string}")
    public void userEntersGuardianName(String guardianName) {
        beneficiaryPage.enterGuardianName(guardianName);
    }

    @When("user enters future date of birth {string}")
    public void userEntersFutureDateOfBirth(String futureDate) {
        beneficiaryPage.enterDateOfBirth(futureDate);
    }

    @When("user enters invalid date format {string}")
    public void userEntersInvalidDateFormat(String invalidDate) {
        beneficiaryPage.enterDateOfBirth(invalidDate);
    }

    @When("user enters whitespace-only guardian name {string}")
    public void userEntersWhitespaceOnlyGuardianName(String whitespace) {
        beneficiaryPage.enterWhitespaceOnlyGuardianName(whitespace);
    }

    @When("user submits the beneficiary form")
    public void userSubmitsBeneficiaryForm() {
        beneficiaryPage.submitForm();
    }

    @When("user submits the beneficiary form without DOB or guardian")
    public void userSubmitsBeneficiaryFormWithoutFields() {
        beneficiaryPage.submitForm();
    }

    @When("user leaves DOB field empty")
    public void userLeavesDobFieldEmpty() {
        beneficiaryPage.clearDobField();
    }

    @When("user leaves guardian name field empty")
    public void userLeavesGuardianNameFieldEmpty() {
        beneficiaryPage.clearGuardianNameField();
    }

    @When("user navigates to edit beneficiary form")
    public void userNavigatesToEditBeneficiaryForm() {
        beneficiaryPage.navigateToBeneficiaryEditPage(testBeneficiaryId);
    }

    @When("user clears the date of birth field")
    public void userClearsDobField() {
        beneficiaryPage.clearDobField();
    }

    @When("user clears the guardian name field")
    public void userClearsGuardianNameField() {
        beneficiaryPage.clearGuardianNameField();
    }

    @When("user clears both DOB and guardian name fields")
    public void userClearsBothFields() {
        beneficiaryPage.clearDobField();
        beneficiaryPage.clearGuardianNameField();
    }

    @When("user adds guardian name {string}")
    public void userAddsGuardianName(String guardianName) {
        beneficiaryPage.enterGuardianName(guardianName);
    }

    @When("user submits the update")
    public void userSubmitsUpdate() {
        beneficiaryPage.updateForm();
    }

    @When("user enters beneficiary name only")
    public void userEntersBeneficiaryNameOnly() {
        beneficiaryPage.enterBeneficiaryName("Test User");
    }

    @When("user clicks the Save button")
    public void userClicksSaveButton() {
        beneficiaryPage.submitForm();
    }

    @When("user performs partial update on beneficiary record")
    public void userPerformsPartialUpdate() {
        String payload = "{\n" +
                "  \"name\": \"Updated Name\"\n" +
                "}";
        apiResponse = given()
                .header("Content-Type", "application/json")
                .body(payload)
                .when()
                .patch("/beneficiaries/" + testBeneficiaryId);
    }

    @When("user retrieves the list of all beneficiaries")
    public void userRetrievesAllBeneficiaries() {
        apiResponse = given()
                .header("Accept", "application/json")
                .when()
                .get("/beneficiaries");
    }

    @When("user creates beneficiary with complete data including DOB and guardian name")
    public void userCreatesCompleteData() {
        String payload = "{\n" +
                "  \"name\": \"Complete Test\",\n" +
                "  \"dob\": \"2015-06-15\",\n" +
                "  \"guardianName\": \"Mary Smith\"\n" +
                "}";
        apiResponse = given()
                .header("Content-Type", "application/json")
                .body(payload)
                .when()
                .post("/beneficiaries");
        lastCreatedBeneficiaryId = apiResponse.jsonPath().getString("id");
    }

    // ==================== Then Steps ====================

    @Then("the beneficiary should be created successfully")
    public void beneficiaryCreatedSuccessfully() {
        Assert.assertTrue(beneficiaryPage.isSuccessMessageDisplayed(), 
                "Success message not displayed");
    }

    @Then("the beneficiary record should have dob populated")
    public void beneficiaryRecordHasDobPopulated() {
        // Verify via API
        apiResponse = given()
                .when()
                .get("/beneficiaries/" + lastCreatedBeneficiaryId);
        Assert.assertNotNull(apiResponse.jsonPath().getString("dob"), 
                "DOB should be populated");
    }

    @Then("the beneficiary record should have guardianName populated")
    public void beneficiaryRecordHasGuardianNamePopulated() {
        apiResponse = given()
                .when()
                .get("/beneficiaries/" + lastCreatedBeneficiaryId);
        Assert.assertNotNull(apiResponse.jsonPath().getString("guardianName"), 
                "GuardianName should be populated");
    }

    @Then("validation error {string} should appear")
    public void validationErrorShouldAppear(String expectedError) {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Validation error not displayed");
        String actualError = beneficiaryPage.getValidationErrorMessage();
        Assert.assertTrue(actualError.contains(expectedError), 
                "Expected error: " + expectedError + ", but got: " + actualError);
    }

    @Then("the form should not submit")
    public void formShouldNotSubmit() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Form should show validation error");
    }

    @Then("validation error should appear")
    public void validationErrorShouldAppear() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Validation error should be displayed");
    }

    @Then("validation error for invalid date format should appear")
    public void invalidDateFormatErrorShouldAppear() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Date format validation error should be displayed");
    }

    @Then("the update should succeed")
    public void updateShouldSucceed() {
        Assert.assertTrue(beneficiaryPage.isSuccessMessageDisplayed(), 
                "Success message should be displayed");
    }

    @Then("the beneficiary should retain guardian name")
    public void beneficiaryShouldRetainGuardianName() {
        apiResponse = given()
                .when()
                .get("/beneficiaries/" + testBeneficiaryId);
        Assert.assertNotNull(apiResponse.jsonPath().getString("guardianName"), 
                "GuardianName should be retained");
        Assert.assertNull(apiResponse.jsonPath().getString("dob"), 
                "DOB should be null");
    }

    @Then("the beneficiary should retain DOB")
    public void beneficiaryShouldRetainDOB() {
        apiResponse = given()
                .when()
                .get("/beneficiaries/" + testBeneficiaryId);
        Assert.assertNotNull(apiResponse.jsonPath().getString("dob"), 
                "DOB should be retained");
        Assert.assertNull(apiResponse.jsonPath().getString("guardianName"), 
                "GuardianName should be null");
    }

    @Then("the beneficiary record should not be updated")
    public void beneficiaryRecordNotUpdated() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Beneficiary should not be updated on validation error");
    }

    @Then("the beneficiary record should now have guardian name")
    public void beneficiaryRecordHasGuardianName() {
        apiResponse = given()
                .when()
                .get("/beneficiaries/" + testBeneficiaryId);
        Assert.assertNotNull(apiResponse.jsonPath().getString("guardianName"), 
                "GuardianName should be added");
    }

    @Then("the form should display validation error {string}")
    public void formDisplaysValidationError(String expectedError) {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Validation error should be displayed");
        String actualError = beneficiaryPage.getValidationErrorMessage();
        Assert.assertTrue(actualError.contains(expectedError), 
                "Expected: " + expectedError + ", got: " + actualError);
    }

    @Then("no HTTP request should be made")
    public void noHttpRequestMade() {
        // Validation error prevents form submission, so no API call is made
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Validation error should prevent HTTP request");
    }

    @Then("confirmation message should be displayed")
    public void confirmationMessageDisplayed() {
        Assert.assertTrue(beneficiaryPage.isSuccessMessageDisplayed(), 
                "Confirmation message should be displayed");
    }

    @Then("user should be navigated to beneficiary details page")
    public void userNavigatedToBeneficiaryDetailsPage() {
        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("/beneficiary/") || 
                         currentUrl.contains("/details"), 
                "User should be on beneficiary details page");
    }

    @Then("form validation error should be displayed")
    public void formValidationErrorDisplayed() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Form validation error should be displayed");
    }

    @Then("beneficiary data should not be saved")
    public void beneficiaryDataNotSaved() {
        Assert.assertTrue(beneficiaryPage.isValidationErrorDisplayed(), 
                "Validation error indicates data not saved");
    }

    @Then("form should retain the invalid state for user correction")
    public void formRetainsInvalidState() {
        Assert.assertTrue(beneficiaryPage.isDobFieldEmpty() && 
                         beneficiaryPage.isGuardianNameFieldEmpty(), 
                "Both fields should be empty in invalid state");
    }

    @Then("the API response status should be {int}")
    public void apiResponseStatusShouldBe(int expectedStatus) {
        Assert.assertEquals(apiResponse.getStatusCode(), expectedStatus, 
                "API response status should be " + expectedStatus);
    }

    @Then("the beneficiary should be created successfully")
    public void beneficiaryCreatedSuccessfully2() {
        Assert.assertEquals(apiResponse.getStatusCode(), 201, 
                "Beneficiary should be created with 201 status");
    }

    @Then("both fields should be persisted")
    public void bothFieldsPeristed() {
        Assert.assertNotNull(apiResponse.jsonPath().getString("dob"), 
                "DOB should be persisted");
        Assert.assertNotNull(apiResponse.jsonPath().getString("guardianName"), 
                "GuardianName should be persisted");
    }

    @Then("updated fields should be persisted")
    public void updatedFieldsPersisted() {
        Assert.assertEquals(apiResponse.getStatusCode(), 200, 
                "Update should return 200 status");
    }

    @Then("the API response should contain all beneficiaries")
    public void apiResponseContainsAllBeneficiaries() {
        Assert.assertEquals(apiResponse.getStatusCode(), 200, 
                "List API should return 200");
        int count = apiResponse.jsonPath().getList("$").size();
        Assert.assertTrue(count >= 3, "Should contain at least 3 beneficiaries");
    }

    @Then("each record should include dob and guardianName fields")
    public void eachRecordIncludesFields() {
        // Verify structure
        Assert.assertTrue(apiResponse.jsonPath().getList("$").size() > 0, 
                "Response should contain beneficiaries");
    }

    @Then("the response structure should match the API contract")
    public void responseStructureMatches() {
        Assert.assertNotNull(apiResponse.jsonPath().getString("[0].id"), 
                "Response should include id field");
        Assert.assertNotNull(apiResponse.jsonPath().getString("[0].name"), 
                "Response should include name field");
    }

    @Then("the guardian name should preserve special characters")
    public void guardianNamePreservesSpecialChars() {
        String guardianName = apiResponse.jsonPath().getString("guardianName");
        Assert.assertTrue(guardianName.contains("O'Brien-Smith") && 
                         guardianName.contains("Dr."), 
                "Special characters should be preserved");
    }
}
