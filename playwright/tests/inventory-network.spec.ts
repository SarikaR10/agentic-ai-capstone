import { expect, test as base } from '@playwright/test';

const username = process.env.PLAYWRIGHT_USERNAME;
const password = process.env.PLAYWRIGHT_PASSWORD;

if (!username || !password) {
  throw new Error('PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD must be set before running Playwright tests.');
}

type CapturedResponse = {
  url: string;
  status: number;
  resourceType: string;
  body?: unknown;
};

type InventoryProduct = {
  name: string;
  details: string[];
};

type NetworkEvidence = {
  responses: CapturedResponse[];
  pendingResponses: Promise<void>[];
  failedRequests: string[];
  pageErrors: string[];
  consoleErrors: string[];
  inventoryLoading: boolean;
  inventoryResponse?: { url: string; status: number; data: unknown };
  renderedProducts: InventoryProduct[];
};

const test = base.extend<{ networkEvidence: NetworkEvidence }>({
  networkEvidence: [async ({ page }, use, testInfo) => {
    const evidence: NetworkEvidence = {
      responses: [],
      pendingResponses: [],
      failedRequests: [],
      pageErrors: [],
      consoleErrors: [],
      inventoryLoading: false,
      renderedProducts: [],
    };

    page.on('response', (response) => {
      const request = response.request();
      const resourceType = request.resourceType();
      if (!evidence.inventoryLoading || (resourceType !== 'xhr' && resourceType !== 'fetch')) return;

      const captured: CapturedResponse = {
        url: withoutQuery(response.url()),
        status: response.status(),
        resourceType,
      };
      evidence.responses.push(captured);

      evidence.pendingResponses.push((async () => {
        try {
          captured.body = await response.json();
        } catch {
          captured.body = undefined;
        }
      })());
    });
    page.on('requestfailed', (request) => {
      const resourceType = request.resourceType();
      if (evidence.inventoryLoading && (resourceType === 'xhr' || resourceType === 'fetch')) {
        evidence.failedRequests.push(
          `${request.method()} ${withoutQuery(request.url())}: ${request.failure()?.errorText ?? 'request failed'}`,
        );
      }
    });
    page.on('pageerror', (error) => {
      if (evidence.inventoryLoading) evidence.pageErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (evidence.inventoryLoading && message.type() === 'error') evidence.consoleErrors.push(message.text());
    });

    await use(evidence);

    let settledCount = -1;
    while (settledCount !== evidence.pendingResponses.length) {
      settledCount = evidence.pendingResponses.length;
      await Promise.allSettled(evidence.pendingResponses);
    }

    await testInfo.attach('inventory-network-evidence.json', {
      body: JSON.stringify({
        responses: evidence.responses.map(({ url, status, resourceType }) => ({ url, status, resourceType })),
        inventoryResponse: evidence.inventoryResponse,
        renderedProducts: evidence.renderedProducts,
        failedRequests: evidence.failedRequests,
        pageErrors: evidence.pageErrors,
        consoleErrors: evidence.consoleErrors,
      }, null, 2),
      contentType: 'application/json',
    });
  }, { auto: true }],
});

function withoutQuery(url: string) {
  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}

function normalize(value: string | number) {
  return String(value).trim().toLowerCase().replace(/[$,\s]/g, '');
}

function collectPrimitiveValues(value: unknown): Array<string | number> {
  if (typeof value === 'string' || typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap(collectPrimitiveValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectPrimitiveValues);
  return [];
}

function collectObjectArrays(value: unknown): Array<Array<Record<string, unknown>>> {
  if (Array.isArray(value)) {
    const nested = value.flatMap(collectObjectArrays);
    if (value.length > 0 && value.every((entry) => entry !== null && typeof entry === 'object' && !Array.isArray(entry))) {
      nested.unshift(value as Array<Record<string, unknown>>);
    }
    return nested;
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectObjectArrays);
  return [];
}

async function loginAndReadInventory(page: Parameters<typeof base>[0]['page'], evidence: NetworkEvidence) {
  await page.goto('/');
  await page.getByLabel('Username').fill(username!);
  await page.getByLabel('Password').fill(password!);
  const cards = page.locator('[data-test="inventory-item"]');
  evidence.inventoryLoading = true;
  try {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('inventory-container')).toBeVisible();
    await expect(cards).not.toHaveCount(0);
  } finally {
    evidence.inventoryLoading = false;
  }

  const cardCount = await cards.count();
  const products: InventoryProduct[] = [];

  for (let index = 0; index < cardCount; index += 1) {
    const card = cards.nth(index);
    const name = (await card.getByTestId('inventory-item-name').innerText()).trim();
    const buttonLabels = await card.locator('button').allInnerTexts();
    const details = (await card.innerText())
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !buttonLabels.includes(line));
    products.push({ name, details });
  }

  evidence.renderedProducts = products;

  let settledCount = -1;
  while (settledCount !== evidence.pendingResponses.length) {
    settledCount = evidence.pendingResponses.length;
    await Promise.allSettled(evidence.pendingResponses);
  }

  const apiResponses = evidence.responses.filter(({ resourceType }) => resourceType === 'xhr' || resourceType === 'fetch');
  const matchingCandidates = apiResponses.flatMap((response) => {
    const captured = response as CapturedResponse;
    return collectObjectArrays(captured.body)
      .filter((records) => records.length === products.length)
      .flatMap((records) => {
        const matchedRecords = products.map((product) => records.filter((record) =>
          collectPrimitiveValues(record).some((value) => normalize(value) === normalize(product.name)),
        ));
        const eachProductHasOneRecord = matchedRecords.every((matches) => matches.length === 1);
        const recordsAreUnique = new Set(matchedRecords.map((matches) => matches[0])).size === records.length;
        return eachProductHasOneRecord && recordsAreUnique
          ? [{ response: captured, records: matchedRecords.map((matches) => matches[0]) }]
          : [];
      });
  });

  const candidateDiagnostics = apiResponses.map((response) => {
    const arrayLengths = collectObjectArrays(response.body).map((records) => records.length);
    return `${response.url} (status ${response.status}, object-array lengths: ${arrayLengths.join(', ') || 'none'})`;
  });
  expect(
    matchingCandidates,
    `Expected exactly one captured XHR/fetch response candidate matching the rendered inventory; found ${matchingCandidates.length}. ` +
      `Observed responses: ${candidateDiagnostics.join('; ') || 'none'}`,
  ).toHaveLength(1);
  const inventory = matchingCandidates[0];
  evidence.inventoryResponse = {
    url: inventory.response.url,
    status: inventory.response.status,
    data: inventory.records,
  };

  return { cards, products, inventoryResponse: inventory.response, records: inventory.records };
}

function assertResponseAndCountMatch(
  products: InventoryProduct[],
  records: Array<Record<string, unknown>>,
  responseStatus: number,
) {
  expect(responseStatus, 'The captured inventory response must be successful.').toBeGreaterThanOrEqual(200);
  expect(responseStatus, 'The captured inventory response must be successful.').toBeLessThan(300);
  expect(records, 'The captured inventory response must contain product records.').not.toHaveLength(0);
  expect(products.length, 'The rendered product count must equal the response product count.').toBe(records.length);

  const responseNames = records.map((record) => collectPrimitiveValues(record).find((value) =>
    products.some((product) => normalize(value) === normalize(product.name)),
  ));
  expect(responseNames.map((name) => normalize(name ?? ''))).toEqual(products.map((product) => normalize(product.name)));
}

function assertDisplayedDetailsMatch(products: InventoryProduct[], records: Array<Record<string, unknown>>) {
  for (const product of products) {
    const record = records.find((candidate) => collectPrimitiveValues(candidate).some((value) =>
      normalize(value) === normalize(product.name),
    ));
    expect(record, `No response product record matched rendered product "${product.name}".`).toBeDefined();
    const responseValues = new Set(collectPrimitiveValues(record).map(normalize));
    for (const detail of product.details) {
      expect(responseValues, `Rendered detail "${detail}" for "${product.name}" was not found in its response record.`)
        .toContain(normalize(detail));
    }
  }
}

function assertNoInventoryLoadingErrors(evidence: NetworkEvidence) {
  expect(evidence.failedRequests, 'No XHR/fetch requests should fail during inventory loading.').toEqual([]);
  expect(
    evidence.responses.filter(({ status }) => status >= 400),
    'No unsuccessful XHR/fetch responses should occur during inventory loading.',
  ).toEqual([]);
  expect(evidence.pageErrors, 'No uncaught client-side errors should occur during inventory loading.').toEqual([]);
  expect(evidence.consoleErrors, 'No browser console errors should occur during inventory loading.').toEqual([]);
}

test.describe('inventory response and rendered products', () => {
  test('EPMCDMETST-67315-TC-001: loads inventory and verifies backend data in the UI', async ({ page, networkEvidence }) => {
    const inventory = await loginAndReadInventory(page, networkEvidence);
    assertNoInventoryLoadingErrors(networkEvidence);
    assertResponseAndCountMatch(inventory.products, inventory.records, inventory.inventoryResponse.status);
    assertDisplayedDetailsMatch(inventory.products, inventory.records);
  });

  test('EPMCDMETST-67315-TC-002: detects inventory request, data, or loading errors', async ({ page, networkEvidence }) => {
    const inventory = await loginAndReadInventory(page, networkEvidence);
    assertNoInventoryLoadingErrors(networkEvidence);
    assertResponseAndCountMatch(inventory.products, inventory.records, inventory.inventoryResponse.status);
    assertDisplayedDetailsMatch(inventory.products, inventory.records);
  });

  test('EPMCDMETST-67315-TC-003: compares the complete inventory list and count with the response', async ({ page, networkEvidence }) => {
    const inventory = await loginAndReadInventory(page, networkEvidence);
    assertResponseAndCountMatch(inventory.products, inventory.records, inventory.inventoryResponse.status);

    const renderedNames = inventory.products.map((product) => normalize(product.name));
    const responseNames = inventory.records.map((record) => normalize(String(
      collectPrimitiveValues(record).find((value) => renderedNames.includes(normalize(value))) ?? '',
    )));
    expect(new Set(renderedNames).size, 'Rendered product names should be unique.').toBe(renderedNames.length);
    expect(responseNames).toHaveLength(renderedNames.length);
    expect([...responseNames].sort()).toEqual([...renderedNames].sort());
    expect(responseNames).toContain(renderedNames[0]);
    expect(responseNames).toContain(renderedNames[renderedNames.length - 1]);
    assertDisplayedDetailsMatch(inventory.products, inventory.records);
  });
});