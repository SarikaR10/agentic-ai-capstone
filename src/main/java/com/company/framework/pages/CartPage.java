package com.company.framework.pages;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CartPage extends BasePage {
	private final By cartItems = By.cssSelector("[data-test='inventory-item']");
	private final By cartBadge = By.cssSelector("[data-test='shopping-cart-badge']");

	public CartPage(WebDriver driver) {
		super(driver);
	}

	public List<String> productNames() {
		return driver.findElements(cartItems).stream()
				.map(item -> item.findElement(By.cssSelector("[data-test='inventory-item-name']")).getText())
				.collect(Collectors.toList());
	}

	public BigDecimal productPrice(String productName) {
		return item(productName).findElement(By.cssSelector("[data-test='inventory-item-price']"))
				.getText().replace("$", "")
				.transform(BigDecimal::new);
	}

	public void removeProduct(String productName) {
		item(productName).findElement(By.cssSelector("button[data-test^='remove']")).click();
	}

	public int cartCount() {
		List<org.openqa.selenium.WebElement> badges = driver.findElements(cartBadge);
		return badges.isEmpty() ? 0 : Integer.parseInt(badges.get(0).getText());
	}

	private org.openqa.selenium.WebElement item(String productName) {
		return driver.findElements(cartItems).stream()
				.filter(item -> item.findElement(By.cssSelector("[data-test='inventory-item-name']"))
						.getText().equals(productName))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Product not found in cart: " + productName));
	}
}