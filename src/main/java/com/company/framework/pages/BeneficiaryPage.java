package com.company.framework.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import com.company.framework.utils.WaitUtils;
import com.company.framework.utils.ConfigReader;

public class BeneficiaryPage extends BasePage {

    // Locators
    private By beneficiaryNameInput = By.id("beneficiary-name");
    private By dobInput = By.id("date-of-birth");
    private By guardianNameInput = By.id("guardian-name");
    private By submitButton = By.id("submit-beneficiary");
    private By validationErrorMessage = By.className("error-message");
    private By successMessage = By.className("success-message");
    private By editButton = By.id("edit-beneficiary");
    private By updateButton = By.id("update-beneficiary");
    private By cancelButton = By.id("cancel");

    private WebDriver driver;
    private WaitUtils waitUtils;

    public BeneficiaryPage(WebDriver driver) {
        this.driver = driver;
        this.waitUtils = new WaitUtils(driver);
    }

    /**
     * Navigate to beneficiary creation page
     */
    public void navigateToBeneficiaryCreationPage() {
        String baseUrl = ConfigReader.getProperty("base.url");
        driver.navigate().to(baseUrl + "/beneficiary/create");
        waitUtils.waitForElementPresence(beneficiaryNameInput, 10);
    }

    /**
     * Navigate to beneficiary edit page
     */
    public void navigateToBeneficiaryEditPage(String beneficiaryId) {
        String baseUrl = ConfigReader.getProperty("base.url");
        driver.navigate().to(baseUrl + "/beneficiary/" + beneficiaryId + "/edit");
        waitUtils.waitForElementPresence(beneficiaryNameInput, 10);
    }

    /**
     * Enter beneficiary name
     */
    public void enterBeneficiaryName(String name) {
        WebElement nameElement = waitUtils.waitForElementToBeClickable(beneficiaryNameInput, 10);
        nameElement.clear();
        nameElement.sendKeys(name);
    }

    /**
     * Enter date of birth
     */
    public void enterDateOfBirth(String dob) {
        WebElement dobElement = waitUtils.waitForElementToBeClickable(dobInput, 10);
        dobElement.clear();
        dobElement.sendKeys(dob);
    }

    /**
     * Enter guardian name
     */
    public void enterGuardianName(String guardianName) {
        WebElement guardianElement = waitUtils.waitForElementToBeClickable(guardianNameInput, 10);
        guardianElement.clear();
        guardianElement.sendKeys(guardianName);
    }

    /**
     * Enter guardian name with whitespace only
     */
    public void enterWhitespaceOnlyGuardianName(String whitespace) {
        WebElement guardianElement = waitUtils.waitForElementToBeClickable(guardianNameInput, 10);
        guardianElement.clear();
        guardianElement.sendKeys(whitespace);
    }

    /**
     * Clear DOB field
     */
    public void clearDobField() {
        WebElement dobElement = waitUtils.waitForElementToBeClickable(dobInput, 10);
        dobElement.clear();
    }

    /**
     * Clear guardian name field
     */
    public void clearGuardianNameField() {
        WebElement guardianElement = waitUtils.waitForElementToBeClickable(guardianNameInput, 10);
        guardianElement.clear();
    }

    /**
     * Submit the form
     */
    public void submitForm() {
        WebElement submitBtn = waitUtils.waitForElementToBeClickable(submitButton, 10);
        submitBtn.click();
    }

    /**
     * Update the form (for edit page)
     */
    public void updateForm() {
        WebElement updateBtn = waitUtils.waitForElementToBeClickable(updateButton, 10);
        updateBtn.click();
    }

    /**
     * Check if validation error message is displayed
     */
    public boolean isValidationErrorDisplayed() {
        return waitUtils.isElementPresent(validationErrorMessage, 5);
    }

    /**
     * Get validation error message text
     */
    public String getValidationErrorMessage() {
        WebElement errorElement = waitUtils.waitForElementPresence(validationErrorMessage, 5);
        return errorElement.getText();
    }

    /**
     * Check if success message is displayed
     */
    public boolean isSuccessMessageDisplayed() {
        return waitUtils.isElementPresent(successMessage, 5);
    }

    /**
     * Get success message text
     */
    public String getSuccessMessage() {
        WebElement successElement = waitUtils.waitForElementPresence(successMessage, 5);
        return successElement.getText();
    }

    /**
     * Check if form is submittable (no validation errors)
     */
    public boolean isFormSubmittable() {
        WebElement submitBtn = driver.findElement(submitButton);
        return submitBtn.isEnabled();
    }

    /**
     * Check if DOB field is empty
     */
    public boolean isDobFieldEmpty() {
        WebElement dobElement = driver.findElement(dobInput);
        return dobElement.getAttribute("value").isEmpty();
    }

    /**
     * Check if guardian name field is empty
     */
    public boolean isGuardianNameFieldEmpty() {
        WebElement guardianElement = driver.findElement(guardianNameInput);
        return guardianElement.getAttribute("value").isEmpty();
    }

    /**
     * Get DOB field value
     */
    public String getDobFieldValue() {
        WebElement dobElement = driver.findElement(dobInput);
        return dobElement.getAttribute("value");
    }

    /**
     * Get guardian name field value
     */
    public String getGuardianNameFieldValue() {
        WebElement guardianElement = driver.findElement(guardianNameInput);
        return guardianElement.getAttribute("value");
    }
}
