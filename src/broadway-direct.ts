export async function broadwayDirect({ browser, userInfo, url }) {
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  const links = await page.getByRole("link", { name: /Enter/i }).all();
  const hrefs = await Promise.all(
    links.map((link) => link.getAttribute("href"))
  );

  for (let i = 0; i < hrefs.length; i++) {
    const href = hrefs[i];
    if (!href) {
      continue;
    }
    await page.goto(href, { waitUntil: "networkidle", timeout: 60000 });

    await page.getByLabel("First Name").waitFor({ timeout: 30000 });
    await page.getByLabel("First Name").fill(userInfo.firstName);
    await page.getByLabel("Last Name").fill(userInfo.lastName);
    await page
      .getByLabel("Qty of Tickets Requested")
      .selectOption(userInfo.numberOfTickets);
    await page.getByLabel("Email").fill(userInfo.email);

    // Enter Date of Birth
    await page.locator("#dlslot_dob_month").fill(userInfo.dateOfBirth.month);
    await page.locator("#dlslot_dob_day").fill(userInfo.dateOfBirth.day);
    await page.locator("#dlslot_dob_year").fill(userInfo.dateOfBirth.year);

    await page.getByLabel("Zip").fill(userInfo.zip);
    await page
      .getByLabel("Country of Residence")
      .selectOption({ label: userInfo.countryOfResidence });

    // Agree to terms
    await page.locator("#dlslot_agree").check({ force: true });

    // Handle cookie consent banner if present
    const cookieBanner = page.locator("#cookie-information-template-wrapper");
    const isCookieBannerVisible = await cookieBanner.isVisible().catch(() => false);
    if (isCookieBannerVisible) {
      // Try to find and click an accept/agree button within the cookie banner
      const acceptButton = cookieBanner.getByRole("button", { name: /accept|agree|ok|got it/i });
      const acceptButtonVisible = await acceptButton.isVisible().catch(() => false);
      if (acceptButtonVisible) {
        await acceptButton.click();
        // Wait for banner to disappear
        await cookieBanner.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
      } else {
        // If no explicit button, try to dismiss by clicking outside or waiting
        // Some banners auto-dismiss or can be closed by clicking backdrop
        await page.waitForTimeout(1000);
      }
    }

    // Submit the form - use force: true if cookie banner still blocks it
    const enterButton = page.getByLabel("Enter");
    const formUrl = page.url();

    // Log all non-GET requests to help debug what's happening
    page.on("response", (response) => {
      const method = response.request().method();
      const status = response.status();
      const url = response.url();
      const isStaticAsset = url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/i);
      
      if (
        (method === "POST" || method === "PUT" || method === "PATCH") &&
        !isStaticAsset
      ) {
        console.log(
          `🌐 ${method} ${status} ${url}`
        );
      }
    });

    // Set up waiting for any POST/PUT/PATCH response (form submissions)
    // This catches the actual form submission regardless of URL pattern
    const formSubmissionPromise = page
      .waitForResponse(
        (response) => {
          const method = response.request().method();
          const status = response.status();
          // Only catch POST/PUT/PATCH requests with successful status
          // Exclude static assets
          const url = response.url();
          const isStaticAsset = url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/i);
          const isFormSubmission =
            (method === "POST" || method === "PUT" || method === "PATCH") &&
            status >= 200 &&
            status < 400 &&
            !isStaticAsset;

          if (isFormSubmission) {
            console.log(
              `📡 Form submission response: ${method} ${status} ${url}`
            );
          }

          return isFormSubmission;
        },
        { timeout: 30000 }
      )
      .catch(() => null);

    try {
      await enterButton.click({ timeout: 10000 });
    } catch (error) {
      // If click fails due to interception, force the click
      await enterButton.click({ force: true });
    }

    // Wait for form submission response
    const response = await formSubmissionPromise;
    if (response) {
      console.log(
        `✅ Form submission completed: ${response.request().method()} ${response.status()} ${response.url()}`
      );
    } else {
      console.warn(`⚠️  No form submission response detected within timeout`);
    }
    
    // Wait for network to be idle to ensure all requests complete
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);

    // Check for success indicators
    const successIndicators = [
      page.getByText(/success|thank you|entered|submitted|you're entered|you are entered/i),
      page.locator('[class*="success"], [class*="alert-success"]'),
    ];

    const hasSuccessIndicator = await Promise.race(
      successIndicators.map(async (indicator) => {
        try {
          return await indicator.first().isVisible({ timeout: 3000 });
        } catch {
          return false;
        }
      })
    ).catch(() => false);

    // Check for error messages
    const errorIndicators = [
      page.locator('[class*="error"], [class*="alert-danger"], [role="alert"]'),
      page.getByText(/error|invalid|failed|try again/i),
    ];

    const hasErrorIndicator = await Promise.race(
      errorIndicators.map(async (indicator) => {
        try {
          return await indicator.first().isVisible({ timeout: 2000 });
        } catch {
          return false;
        }
      })
    ).catch(() => false);

    // Log warnings if submission appears to have failed
    const currentUrl = page.url();
    const urlChanged = currentUrl !== formUrl;

    // If we're still on the form page and no success indicator, log a warning
    if (!urlChanged && !hasSuccessIndicator) {
      if (hasErrorIndicator) {
        const errorText = await errorIndicators[0]
          .first()
          .textContent()
          .catch(() => "Unknown error");
        console.warn(`⚠️  Form submission may have failed: ${errorText}`);
      } else {
        console.warn(
          `⚠️  No clear success indicator found after submission. URL changed: ${urlChanged}`
        );
      }
    }

    // Wait for a random timeout to avoid spamming the API
    const breakTime = Math.floor(Math.random() * 1000) + 1;
    await page.waitForTimeout(breakTime);
  }
}
