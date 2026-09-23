package com.company.framework.stepdefinitions;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.company.framework.drivers.DriverFactory;
import com.company.framework.pages.CartPage;
import com.company.framework.pages.InventoryPage;
import com.company.framework.pages.LoginPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class CartStepDefinitions {
	private final InventoryPage inventoryPage = new InventoryPage(DriverFactory.get());
	private final CartPage cartPage = new CartPage(DriverFactory.get());
	private final Map<String, BigDecimal> recordedPrices = new HashMap<>();

	@Given("the shopper is logged in to the inventory page")
	public void login() {
		new LoginPage(DriverFactory.get()).loginIfConfigured();
	}

	@When("the shopper records the price of {string}")
	public void recordPrice(String productName) {
		recordedPrices.put(productName, inventoryPage.productPrice(productName));
	}

	@When("the shopper adds {string} to the cart")
	public void addProduct(String productName) {
		inventoryPage.addProduct(productName);
	}

	@When("the shopper opens the cart")
	public void openCart() {
		inventoryPage.openCart();
	}

	@When("the shopper removes {string} from the cart")
	public void removeProduct(String productName) {
		cartPage.removeProduct(productName);
	}

	@Then("the cart badge count is {int}")
	public void verifyCartCount(int expectedCount) {
		assertEquals(cartPage.cartCount(), expectedCount);
	}

	@Then("the cart contains {string} at the recorded price")
	public void verifyCartItem(String productName) {
		assertTrue(cartPage.productNames().contains(productName));
		assertEquals(cartPage.productPrice(productName), recordedPrices.get(productName));
	}

	@Then("the cart is empty")
	public void verifyCartEmpty() {
		assertTrue(cartPage.productNames().isEmpty());
	}
}