import { test } from "@playwright/test";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { readFileSync } from "fs";
import { join } from "path";
import { getUserInfo } from "../src/get-user-info";
import { broadwayDirect } from "../src/broadway-direct";

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = stealthPlugin();

// Add the plugin to Playwright (any number of plugins can be added)
chromium.use(stealth);

interface ShowConfig {
  name: string;
  url: string;
  enabled?: boolean;
}

// Load shows from JSON file
function loadShows(): ShowConfig[] {
  try {
    const showsPath = join(__dirname, "../broadway-direct/showsToEnter.json");
    const showsData = JSON.parse(readFileSync(showsPath, "utf-8"));
    if (!Array.isArray(showsData)) {
      console.error("❌ showsToEnter.json must contain a JSON array");
      return [];
    }
    return showsData;
  } catch (error) {
    console.error(`❌ Error loading shows: ${error}`);
    // Fallback to hardcoded list if file doesn't exist
    return [
      {
        name: "Aladdin",
        url: "https://lottery.broadwaydirect.com/show/aladdin/",
        enabled: true,
      },
      {
        name: "Beetlejuice",
        url: "https://lottery.broadwaydirect.com/show/beetlejuice-ny/",
        enabled: true,
      },
      {
        name: "Death Becomes Her",
        url: "https://lottery.broadwaydirect.com/show/death-becomes-her-ny/",
        enabled: true,
      },
      {
        name: "Six",
        url: "https://lottery.broadwaydirect.com/show/six-ny/",
        enabled: true,
      },
      {
        name: "Sweeney Todd",
        url: "https://lottery.broadwaydirect.com/show/st-nyc/",
        enabled: true,
      },
      {
        name: "The Lion King",
        url: "https://lottery.broadwaydirect.com/show/the-lion-king/",
        enabled: true,
      },
      {
        name: "Wicked",
        url: "https://lottery.broadwaydirect.com/show/wicked/",
        enabled: true,
      },
    ];
  }
}

// Filter shows based on SHOWS environment variable and enabled status
function filterShows(shows: ShowConfig[]): ShowConfig[] {
  // First filter by enabled status
  let filtered = shows.filter((show) => show.enabled !== false);

  // Then filter by SHOWS environment variable if provided
  const showsFilter = process.env.SHOWS;
  if (!showsFilter) {
    return filtered;
  }

  const filterTerms = showsFilter
    .split(",")
    .map((term) => term.trim().toLowerCase());

  return filtered.filter((show) => {
    const showName = show.name.toLowerCase();
    const urlLower = show.url.toLowerCase();

    return filterTerms.some((term) => {
      if (showName.includes(term) || term.includes(showName)) {
        return true;
      }
      if (urlLower.includes(term)) {
        return true;
      }
      return false;
    });
  });
}

const allShows = loadShows();
const enabledShows = allShows.filter((s) => s.enabled !== false);
const disabledShows = allShows.filter((s) => s.enabled === false);
const shows = filterShows(allShows);

if (shows.length === 0) {
  console.warn(
    "⚠️  No shows to enter. Check broadway-direct/showsToEnter.json"
  );
  if (allShows.length > 0) {
    console.warn("Available shows:");
    allShows.forEach((show) => {
      const status = show.enabled === false ? " (disabled)" : "";
      console.warn(`   - ${show.name}${status}`);
    });
  }
} else {
  console.log(`\n🎭 Broadway Direct Lottery Configuration:`);
  console.log(`   Total shows in config: ${allShows.length}`);
  console.log(`   Enabled (will enter): ${enabledShows.length}`);
  if (disabledShows.length > 0) {
    console.log(`   Disabled: ${disabledShows.length}`);
    disabledShows.forEach((show) => {
      console.log(`      - ${show.name}`);
    });
  }
  if (process.env.SHOWS && shows.length < enabledShows.length) {
    console.log(
      `   Filtered to: ${shows.length} show(s) matching "${process.env.SHOWS}"`
    );
  }
}

const urls = shows.map((show) => show.url);

if (urls.length === 0) {
  console.warn("⚠️  No shows matched the filter. Available shows:");
  allShows.forEach((show) => {
    const status = show.enabled === false ? " (disabled)" : "";
    console.warn(`   - ${show.name}${status}`);
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
        console.log(
          `✅ Successfully completed lottery signup for: ${showName}`
        );
      } else if (result.reason === "closed") {
        console.log(
          `ℹ️  Lottery is closed for: ${showName} - ${result.message}`
        );
      } else if (result.reason === "no_entries") {
        console.log(
          `ℹ️  No entry links found for: ${showName} - ${result.message}`
        );
      } else {
        console.log(
          `❌ Failed to submit lottery entry for: ${showName} - ${result.message}`
        );
      }

      // Keep browser open for a bit to see the result (unless in CI or KEEP_BROWSER_OPEN is not set)
      if (!process.env.CI && !process.env.KEEP_BROWSER_OPEN) {
        console.log("⏳ Keeping browser open for 5 seconds to view results...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else if (process.env.KEEP_BROWSER_OPEN === "true") {
        console.log("🔍 Browser will stay open. Press Ctrl+C to close.");
        // Keep browser open indefinitely
        await new Promise(() => {});
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
});
