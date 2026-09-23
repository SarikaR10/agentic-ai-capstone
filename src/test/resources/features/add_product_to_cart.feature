Feature: Add a product to cart

  Background:
    Given the shopper is logged in to the inventory page

  @smoke @positive
  Scenario: Add one product and remove it from the cart
    When the shopper records the price of "Sauce Labs Backpack"
    And the shopper adds "Sauce Labs Backpack" to the cart
    Then the cart badge count is 1
    When the shopper opens the cart
    Then the cart contains "Sauce Labs Backpack" at the recorded price
    When the shopper removes "Sauce Labs Backpack" from the cart
    Then the cart badge count is 0

  @negative
  Scenario: Empty cart remains unchanged
    When the shopper opens the cart
    Then the cart badge count is 0
    And the cart is empty

  @edge
  Scenario: Two products have independent cart entries
    When the shopper records the price of "Sauce Labs Backpack"
    And the shopper records the price of "Bike Light"
    And the shopper adds "Sauce Labs Backpack" to the cart
    And the shopper adds "Bike Light" to the cart
    Then the cart badge count is 2
    When the shopper opens the cart
    Then the cart contains "Sauce Labs Backpack" at the recorded price
    And the cart contains "Bike Light" at the recorded price
    When the shopper removes "Sauce Labs Backpack" from the cart
    Then the cart badge count is 1