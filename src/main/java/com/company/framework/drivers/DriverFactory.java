package com.company.framework.drivers;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public final class DriverFactory {
	private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

	private DriverFactory() {
	}

	public static void start() {
		WebDriverManager.chromedriver().setup();
		DRIVER.set(new ChromeDriver());
	}

	public static WebDriver get() {
		WebDriver driver = DRIVER.get();
		if (driver == null) {
			throw new IllegalStateException("WebDriver has not been started");
		}
		return driver;
	}

	public static void stop() {
		WebDriver driver = DRIVER.get();
		if (driver != null) {
			driver.quit();
			DRIVER.remove();
		}
	}
}