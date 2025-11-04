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
    try {
      await enterButton.click({ timeout: 10000 });
    } catch (error) {
      // If click fails due to interception, force the click
      await enterButton.click({ force: true });
    }

    // Wait for a random timeout to avoid spamming the API
    const breakTime = Math.floor(Math.random() * 1000) + 1;
    await page.waitForTimeout(breakTime);
  }
}
