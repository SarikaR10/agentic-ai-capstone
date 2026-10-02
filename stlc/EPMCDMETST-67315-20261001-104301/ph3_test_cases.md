# Manual Test Cases: EPMCDMETST-67315

## TC-001: Load inventory and verify backend data in the UI

- **Type:** Functional, smoke, positive end-to-end, UI, API, network
- **Priority:** High
- **Plan coverage:** TP-01
- **Story requirements:** Product data is successfully returned from backend services; network responses indicate successful processing; displayed products match backend data; no client-side or server-side errors occur during inventory loading; products and correct details are displayed; product count is displayed.
- **Preconditions:** Application is available; `standard_user` / `secret_sauce` credentials are available; network capture is enabled.

**Steps**
1. Start network capture before logging in.
2. Log in with `standard_user` / `secret_sauce` and navigate to the Inventory page.
3. Identify the inventory-related request from captured browser traffic and inspect its response status and available product data.
4. Verify that the inventory page displays products, populated product details, and a product count.
5. Compare the response product data with the corresponding displayed product details and count.

**Expected result:** The inventory-related request completes with a successful response code and populated product data. Products and their displayed details match the response data, the displayed product count is present and consistent with the products shown, and no client-side or server-side errors occur during inventory loading.

## TC-002: Detect inventory request, data, or loading errors

- **Type:** Functional, smoke, negative/error detection, UI, API, network
- **Priority:** High
- **Plan coverage:** TP-02
- **Story requirements:** No client-side or server-side errors occur during inventory loading; network responses indicate successful processing; response data is populated; products and correct details are displayed; product count is displayed.
- **Preconditions:** Application is available; `standard_user` / `secret_sauce` credentials are available; network capture is enabled.

**Steps**
1. Start network capture before logging in.
2. Log in with `standard_user` / `secret_sauce` and navigate to the Inventory page while observing the loading period.
3. Identify inventory-related traffic from the browser capture; record its status and whether product data is populated.
4. Observe the browser for client-side errors during inventory loading.
5. Check whether products, product details, or the displayed product count are missing or inconsistent; retain the observed status, response evidence, and UI evidence for any discrepancy.

**Expected result:** The case passes only when the inventory-related response is successful and populated, no client-side or server-side errors occur during loading, and the required products, details, and count are present and consistent. Any unsuccessful inventory response, empty response data, client-side error, or missing/inconsistent UI data is a requirement failure and is recorded with available evidence. No particular fallback message or recovery behavior is expected.

## TC-003: Compare the complete inventory list and count with the response

- **Type:** Functional, smoke, edge/data consistency, UI, API, network
- **Priority:** Medium
- **Plan coverage:** TP-03
- **Story requirements:** Response data is populated; displayed products match backend data; product details are correct; product count is displayed.
- **Preconditions:** Application is available; `standard_user` / `secret_sauce` credentials are available; network capture is enabled.

**Steps**
1. Start network capture before logging in.
2. Log in with `standard_user` / `secret_sauce` and navigate to the Inventory page.
3. Identify the inventory-related response and use its available product records and fields as the comparison source.
4. Compare the complete set of response products with the complete set of products displayed in the UI, including the first and last displayed products.
5. For each corresponding product, compare the displayed details with the available response values, and compare the displayed product count with the response product records and rendered products.

**Expected result:** Every response product is represented in the UI exactly once, no product is spuriously displayed, and each displayed product's available details match its corresponding response values. The displayed count is present and consistent with both the response product records and rendered products. The comparison uses the actual captured response and does not assume fixed product counts or specific response field names.
