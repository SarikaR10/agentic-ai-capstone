package com.company.framework.pages;

import com.company.framework.utils.ConfigReader;
import com.company.framework.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
	private final By username = By.cssSelector("[data-testid='login-username'], [data-test='username']");
	private final By password = By.cssSelector("[data-testid='login-password'], [data-test='password']");
	private final By submit = By.cssSelector("[data-testid='login-submit'], [data-test='login-button']");

	public LoginPage(WebDriver driver) {
		super(driver);
	}

	public void loginIfConfigured() {
		String configuredUrl = ConfigReader.get("url");
		String configuredUsername = ConfigReader.get("username");
		String configuredPassword = ConfigReader.get("password");
		if (configuredUrl == null || configuredUrl.isBlank() || "https://example.com".equals(configuredUrl)) {
			throw new IllegalStateException("Set -Durl to the authenticated target environment");
		}
		if (configuredUsername == null || configuredPassword == null
				|| configuredUsername.isBlank() || configuredPassword.isBlank()) {
			throw new IllegalStateException("Set -username and -password for authenticated allocation scenarios");
		}
		driver.get(configuredUrl);
		WaitUtils.visible(driver, username).sendKeys(configuredUsername);
		driver.findElement(password).sendKeys(configuredPassword);
		WaitUtils.clickable(driver, submit);
		driver.findElement(submit).click();
		WaitUtils.visible(driver, By.cssSelector("[data-testid='authenticated-shell'], [data-test='inventory-container']"));
	}
}