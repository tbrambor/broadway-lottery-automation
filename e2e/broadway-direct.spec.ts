import { test } from "@playwright/test";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { getUserInfo } from "../src/get-user-info";
import { broadwayDirect } from "../src/broadway-direct";

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = stealthPlugin();

// Add the plugin to Playwright (any number of plugins can be added)
chromium.use(stealth);

const allUrls = [
  "https://lottery.broadwaydirect.com/show/aladdin/",
  "https://lottery.broadwaydirect.com/show/beetlejuice-ny/",
  "https://lottery.broadwaydirect.com/show/death-becomes-her-ny/",
  "https://lottery.broadwaydirect.com/show/mj-ny/",
  "https://lottery.broadwaydirect.com/show/six-ny/",
  "https://lottery.broadwaydirect.com/show/st-nyc/",
  "https://lottery.broadwaydirect.com/show/the-lion-king/",
  "https://lottery.broadwaydirect.com/show/wicked/",
];

// Filter URLs based on SHOWS environment variable
// Supports comma-separated list of show names (e.g., "aladdin,wicked") or full URLs
function filterUrls(urls: string[]): string[] {
  const showsFilter = process.env.SHOWS;
  if (!showsFilter) {
    return urls; // No filter, return all
  }

  const filterTerms = showsFilter.split(',').map(term => term.trim().toLowerCase());
  
  return urls.filter(url => {
    // Extract show name from URL (e.g., "aladdin" from "https://lottery.broadwaydirect.com/show/aladdin/")
    const showName = url.split("/show/")[1]?.replace(/\//g, "").toLowerCase() || "";
    const urlLower = url.toLowerCase();
    
    // Check if any filter term matches the show name or URL
    return filterTerms.some(term => {
      // Match by show name (e.g., "aladdin" matches "aladdin")
      if (showName.includes(term) || term.includes(showName)) {
        return true;
      }
      // Match by full URL
      if (urlLower.includes(term)) {
        return true;
      }
      return false;
    });
  });
}

const urls = filterUrls(allUrls);

if (urls.length === 0) {
  console.warn("⚠️  No shows matched the SHOWS filter. Available shows:");
  allUrls.forEach(url => {
    const showName = url.split("/show/")[1]?.replace(/\//g, "") || url;
    console.warn(`   - ${showName}`);
  });
}

urls.forEach((url) => {
  test(`Sign up at ${url}`, async ({}, testInfo) => {
    const showName =
      url.split("/show/")[1]?.replace(/-/g, " ").replace(/\//g, "") || url;
    console.log(`\n🎭 Starting lottery signup for: ${showName}`);
    console.log(`   URL: ${url}`);

    const userInfo = getUserInfo(process.env);
    // Use headless mode in CI environment
    const browser = await chromium.launch({
      headless: process.env.CI ? true : false,
    });

    try {
      const result = await broadwayDirect({ browser, userInfo, url });
      
      if (result.success) {
        console.log(`✅ Successfully completed lottery signup for: ${showName}`);
      } else if (result.reason === "closed") {
        console.log(`ℹ️  Lottery is closed for: ${showName} - ${result.message}`);
      } else if (result.reason === "no_entries") {
        console.log(`ℹ️  No entry links found for: ${showName} - ${result.message}`);
      } else {
        console.log(`❌ Failed to submit lottery entry for: ${showName} - ${result.message}`);
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
});
