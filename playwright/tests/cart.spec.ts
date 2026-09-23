import { expect, test } from '@playwright/test';

const username = process.env.PLAYWRIGHT_USERNAME;
const password = process.env.PLAYWRIGHT_PASSWORD;

if (!username || !password) {
  throw new Error('PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD must be set before running Playwright tests.');
}

const backpack = 'Sauce Labs Backpack';
const bikeLight = 'Sauce Labs Bike Light';

async function login(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByTestId('inventory-container')).toBeVisible();
}

function productCard(page: Parameters<typeof test>[0]['page'], productName: string) {
  return page.locator('[data-test="inventory-item"]').filter({ hasText: productName });
}

async function productPrice(page: Parameters<typeof test>[0]['page'], productName: string) {
  return productCard(page, productName).getByTestId('inventory-item-price').innerText();
}

test.describe('cart management', () => {
  test('adds one inventory product, preserves its price, and removes it', async ({ page }) => {
    await login(page);
    const recordedPrice = await productPrice(page, backpack);
    await productCard(page, backpack).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

    await page.getByTestId('shopping-cart-link').click();
    const cartItem = page.locator('[data-test="inventory-item"]').filter({ hasText: backpack });
    await expect(cartItem.getByTestId('inventory-item-name')).toHaveText(backpack);
    await expect(cartItem.getByTestId('inventory-item-price')).toHaveText(recordedPrice);

    await cartItem.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });

  test('keeps an empty cart unchanged when no product is added', async ({ page }) => {
    await login(page);
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.locator('[data-test="cart-list"] [data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });

  test('keeps the remaining product after removing one of two cart entries', async ({ page }) => {
    await login(page);
    const recordedBackpackPrice = await productPrice(page, backpack);
    const recordedBikeLightPrice = await productPrice(page, bikeLight);
    await productCard(page, backpack).getByRole('button', { name: 'Add to cart' }).click();
    await productCard(page, bikeLight).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    await page.getByTestId('shopping-cart-link').click();
    const backpackItem = page.locator('[data-test="inventory-item"]').filter({ hasText: backpack });
    const bikeLightItem = page.locator('[data-test="inventory-item"]').filter({ hasText: bikeLight });
    await expect(backpackItem.getByTestId('inventory-item-price')).toHaveText(recordedBackpackPrice);
    await expect(bikeLightItem.getByTestId('inventory-item-price')).toHaveText(recordedBikeLightPrice);

    await backpackItem.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(bikeLightItem.getByTestId('inventory-item-name')).toHaveText(bikeLight);
  });
});