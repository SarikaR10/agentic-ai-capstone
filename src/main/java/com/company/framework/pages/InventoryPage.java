package com.company.framework.pages;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class InventoryPage extends BasePage {
	private final By inventoryItems = By.cssSelector("[data-test='inventory-item']");
	private final By cartBadge = By.cssSelector("[data-test='shopping-cart-badge']");
	private final By cartLink = By.cssSelector("[data-test='shopping-cart-link']");

	public InventoryPage(WebDriver driver) {
		super(driver);
	}

	public List<String> productNames() {
		return driver.findElements(inventoryItems).stream()
				.map(item -> item.findElement(By.cssSelector("[data-test='inventory-item-name']")).getText())
				.collect(Collectors.toList());
	}

	public BigDecimal productPrice(String productName) {
		return new BigDecimal(product(productName)
				.findElement(By.cssSelector("[data-test='inventory-item-price']"))
				.getText().replace("$", ""));
	}

	public void addProduct(String productName) {
		product(productName).findElement(By.cssSelector("button[data-test^='add-to-cart']")).click();
	}

	public void openCart() {
		driver.findElement(cartLink).click();
	}

	public int cartCount() {
		List<org.openqa.selenium.WebElement> badges = driver.findElements(cartBadge);
		return badges.isEmpty() ? 0 : Integer.parseInt(badges.get(0).getText());
	}

	private org.openqa.selenium.WebElement product(String productName) {
		return driver.findElements(inventoryItems).stream()
				.filter(item -> item.findElement(By.cssSelector("[data-test='inventory-item-name']"))
						.getText().equals(productName))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Product not found: " + productName));
	}
}