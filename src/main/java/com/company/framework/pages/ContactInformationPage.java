package com.company.framework.pages;

import com.company.framework.utils.ConfigReader;
import com.company.framework.utils.WaitUtils;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ContactInformationPage extends BasePage {
    private final By profileLink = By.cssSelector("[data-testid='profile-link']");
    private final By contactEditLink = By.cssSelector("[data-testid='profile-contact-edit']");
    private final By contactForm = By.cssSelector("[data-testid='contact-information-form']");
    private final By saveButton = By.cssSelector("button[data-testid='contact-save']");
    private final By validationErrors = By.cssSelector("[data-testid^='contact-error-']");
    private final By saveResult = By.cssSelector("[data-testid='contact-save-result']");
    private final Map<String, By> fields = new LinkedHashMap<>();
    private boolean saveCompleted;
    private boolean saveSucceeded;

    public ContactInformationPage(WebDriver driver) {
        super(driver);
        fields.put("firstName", By.cssSelector("input[data-testid='contact-first-name']"));
        fields.put("lastName", By.cssSelector("input[data-testid='contact-last-name']"));
        fields.put("address", By.cssSelector("input[data-testid='contact-address']"));
        fields.put("city", By.cssSelector("input[data-testid='contact-city']"));
        fields.put("state", By.cssSelector("input[data-testid='contact-state']"));
        fields.put("zipCode", By.cssSelector("input[data-testid='contact-zip-code']"));
        fields.put("phone", By.cssSelector("input[data-testid='contact-phone']"));
        fields.put("email", By.cssSelector("input[data-testid='contact-email']"));
    }

    public void open() {
        String configuredUrl = ConfigReader.get("url");
        if (configuredUrl == null || configuredUrl.isBlank()) {
            throw new IllegalStateException("Set -Durl to the authenticated target environment");
        }
        driver.get(configuredUrl + "/profile");
        WaitUtils.visible(driver, profileLink);
        driver.findElement(profileLink).click();
        WaitUtils.clickable(driver, contactEditLink);
        driver.findElement(contactEditLink).click();
        WaitUtils.visible(driver, contactForm);
        WaitUtils.visible(driver, fields.get("firstName"));
    }

    public void refresh() {
        driver.navigate().refresh();
        WaitUtils.visible(driver, contactForm);
        WaitUtils.visible(driver, fields.get("firstName"));
    }

    public void replaceFields(Map<String, String> values) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            field(entry.getKey()).clear();
            field(entry.getKey()).sendKeys(entry.getValue());
        }
    }

    public void clearField(String fieldName) {
        field(fieldName).clear();
    }

    public void save() {
        saveCompleted = false;
        saveSucceeded = false;
        WaitUtils.clickable(driver, saveButton);
        driver.findElement(saveButton).click();
        new WebDriverWait(driver, Duration.ofSeconds(10)).until(saveOutcomeVisible());
        saveCompleted = true;
        saveSucceeded = !hasValidationErrors() && successfulSaveObserved();
    }

    public Map<String, String> values() {
        Map<String, String> values = new LinkedHashMap<>();
        for (String fieldName : fields.keySet()) {
            values.put(fieldName, field(fieldName).getAttribute("value"));
        }
        return values;
    }

    public boolean valuesMatch(Map<String, String> expectedValues) {
        Map<String, String> actualValues = values();
        return expectedValues.entrySet().stream()
                .allMatch(entry -> entry.getValue().equals(actualValues.get(entry.getKey())));
    }

    public boolean formIsEditableWithSavedValues() {
        return fields.values().stream().allMatch(locator -> {
            WebElement element = fieldByLocator(locator);
            return element.isDisplayed() && element.isEnabled();
        }) && !field("firstName").getAttribute("value").isBlank();
    }

    public boolean isSaved() {
        return saveCompleted && saveSucceeded;
    }

    public boolean hasValidationErrors() {
        return driver.findElements(validationErrors).stream().anyMatch(WebElement::isDisplayed);
    }

    public boolean saveWasBlocked() {
        return saveCompleted && !saveSucceeded && !successfulSaveObserved();
    }

    public boolean firstNameValidationIsAssociated() {
        return fieldValidationIsAssociated("firstName");
    }

    public boolean fieldValidationIsAssociated(String fieldName) {
        WebElement field = field(fieldName);
        String errorTestId = "contact-error-" + fieldName.replaceAll("([a-z])([A-Z])", "$1-$2").toLowerCase();
        WebElement error = driver.findElements(By.cssSelector("[data-testid='" + errorTestId + "']")).stream()
                .filter(WebElement::isDisplayed)
                .findFirst()
                .orElse(null);
        String describedBy = field.getAttribute("aria-describedby");
        return error != null && !error.getText().isBlank()
                && (fieldName.equals(error.getAttribute("data-field"))
                    || (describedBy != null && describedBy.contains(error.getAttribute("id"))));
    }

    public boolean firstNameHasInvalidPresentation() {
        WebElement firstName = field("firstName");
        String invalid = firstName.getAttribute("aria-invalid");
        String className = firstName.getAttribute("class");
        return "true".equalsIgnoreCase(invalid)
                || (className != null && className.toLowerCase().contains("invalid"));
    }

    public boolean firstNameHasFocus() {
        return field("firstName").equals(driver.switchTo().activeElement());
    }

    public boolean firstNameValidationCleared() {
        WebElement firstName = field("firstName");
        return !fieldValidationIsAssociated("firstName")
                && !"true".equalsIgnoreCase(firstName.getAttribute("aria-invalid"));
    }

    private WebElement field(String fieldName) {
        By locator = fields.get(fieldName);
        if (locator == null) {
            throw new IllegalArgumentException("Unsupported contact field: " + fieldName);
        }
        return fieldByLocator(locator);
    }

    private WebElement fieldByLocator(By locator) {
        return WaitUtils.visible(driver, locator);
    }

    private ExpectedCondition<Boolean> saveOutcomeVisible() {
        return ignored -> hasValidationErrors() || successfulSaveObserved();
    }

    private boolean successfulSaveObserved() {
        return driver.findElements(saveResult).stream().anyMatch(result ->
                result.isDisplayed() && "success".equalsIgnoreCase(result.getAttribute("data-status")));
    }
}