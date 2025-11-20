import { test } from "@playwright/test";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { readFileSync } from "fs";
import { join } from "path";
import { getUserInfo, getTelechargeLogin } from "../src/get-user-info";
import { telecharge } from "../src/telecharge";

// Load the stealth plugin
const stealth = stealthPlugin();
chromium.use(stealth);

interface ShowConfig {
  name: string;
  url?: string; // URL is optional now since we don't navigate to individual show pages
  num_tickets?: number;
}

// Load shows from JSON file
function loadShows(): ShowConfig[] {
  try {
    const showsPath = join(__dirname, "../telecharge/showsToEnter.json");
    const showsData = JSON.parse(readFileSync(showsPath, "utf-8"));
    if (!Array.isArray(showsData)) {
      console.error("❌ showsToEnter.json must contain a JSON array");
      return [];
    }
    return showsData;
  } catch (error) {
    console.error(`❌ Error loading shows: ${error}`);
    return [];
  }
}

// Filter shows based on SHOWS environment variable
function filterShows(shows: ShowConfig[]): ShowConfig[] {
  const showsFilter = process.env.SHOWS;
  if (!showsFilter) {
    return shows;
  }

  const filterTerms = showsFilter.split(",").map((term) => term.trim().toLowerCase());

  return shows.filter((show) => {
    const showName = show.name.toLowerCase();
    const urlLower = show.url.toLowerCase();

    return filterTerms.some((term) => {
      return showName.includes(term) || urlLower.includes(term);
    });
  });
}

const allShows = loadShows();
const shows = filterShows(allShows);

if (shows.length === 0) {
  console.warn("⚠️  No shows to enter. Check telecharge/showsToEnter.json");
  if (allShows.length > 0) {
    console.warn("Available shows:");
    allShows.forEach((show) => {
      console.warn(`   - ${show.name} (${show.url})`);
    });
  }
}

// Run a single test that enters all lotteries at once
test("Enter all Telecharge lotteries", async ({}, testInfo) => {
  const userInfo = getUserInfo(process.env);
  
  // Filter shows - only include those with num_tickets > 0
  const enabledShows = shows.filter((show) => {
    const numTickets = show.num_tickets ?? parseInt(userInfo.numberOfTickets);
    return numTickets > 0;
  });
  
  const disabledShows = shows.filter((show) => {
    const numTickets = show.num_tickets ?? parseInt(userInfo.numberOfTickets);
    return numTickets === 0;
  });

  console.log(`\n🎭 Starting Telecharge lottery entry`);
  console.log(`   Total shows in config: ${shows.length}`);
  console.log(`   Enabled (will enter): ${enabledShows.length}`);
  if (disabledShows.length > 0) {
    console.log(`   Disabled (num_tickets: 0): ${disabledShows.length}`);
    disabledShows.forEach((show) => {
      console.log(`      - ${show.name}`);
    });
  }

  if (enabledShows.length === 0) {
    console.log("⚠️  No shows enabled. Set num_tickets > 0 to enter lotteries.");
    return;
  }

  const login = getTelechargeLogin(process.env);
  const browser = await chromium.launch({
    headless: process.env.CI ? true : false,
  });

  try {
    // Prepare shows list (only name and num_tickets are needed)
    const showsToEnter = shows.map((show) => ({
      name: show.name,
      num_tickets: show.num_tickets,
    }));

    const result = await telecharge({ browser, userInfo, login, shows: showsToEnter });

    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else if (result.reason === "closed") {
      console.log(`ℹ️  ${result.message}`);
    } else {
      console.log(`❌ ${result.message}`);
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

