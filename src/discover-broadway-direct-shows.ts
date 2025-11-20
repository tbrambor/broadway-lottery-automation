import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Load the stealth plugin
const stealth = stealthPlugin();
chromium.use(stealth);

interface ShowInfo {
  name: string;
  url: string;
  enabled?: boolean;
}

/**
 * Discover Broadway Direct lottery shows from bwayrush.com
 */
async function discoverBroadwayDirectShows(): Promise<ShowInfo[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    
    console.log("🌐 Loading bwayrush.com...");
    await page.goto("https://bwayrush.com/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Wait for the content to load (it's a Svelte app)
    await page.waitForSelector(".table-row", { timeout: 30000 });
    await page.waitForTimeout(2000); // Give it a moment to fully render

    console.log("🔍 Searching for Broadway Direct lottery shows...");

    // Find all show rows
    const showRows = await page.locator(".table-row.playing").all();

    const shows: ShowInfo[] = [];

    for (const row of showRows) {
      try {
        // Get show name
        const showNameElement = row.locator(".show-title a").first();
        const showName = await showNameElement.textContent();
        const showUrl = await showNameElement.getAttribute("href");

        if (!showName || !showUrl) {
          continue;
        }

        // Look for Broadway Direct lottery link in the lottery column
        const lotteryColumn = row.locator(".column-lottery");
        const lotteryLinks = await lotteryColumn.locator("a").all();

        for (const link of lotteryLinks) {
          const href = await link.getAttribute("href");
          
          // Check if it's a Broadway Direct lottery link
          if (href && href.includes("lottery.broadwaydirect.com")) {
            // Clean and normalize the URL
            let lotteryUrl = href.trim();
            
            // Ensure it's a full URL
            if (!lotteryUrl.startsWith("http")) {
              lotteryUrl = lotteryUrl.startsWith("/") 
                ? `https://lottery.broadwaydirect.com${lotteryUrl}`
                : `https://lottery.broadwaydirect.com/${lotteryUrl}`;
            }
            
            // Ensure it ends with a slash
            if (!lotteryUrl.endsWith("/")) {
              lotteryUrl = `${lotteryUrl}/`;
            }
            
            shows.push({
              name: showName.trim(),
              url: lotteryUrl,
              enabled: true, // Default to enabled
            });
            console.log(`✅ Found: ${showName.trim()} -> ${lotteryUrl}`);
            break; // Only add once per show
          }
        }
      } catch (error) {
        // Skip this row if there's an error
        continue;
      }
    }

    return shows;
  } finally {
    await browser.close();
  }
}

/**
 * Load existing shows configuration to preserve user preferences
 */
function loadExistingShows(): Map<string, ShowInfo> {
  const showsPath = join(__dirname, "../broadway-direct/showsToEnter.json");
  const existingShows = new Map<string, ShowInfo>();

  if (existsSync(showsPath)) {
    try {
      const existingData = JSON.parse(readFileSync(showsPath, "utf-8"));
      if (Array.isArray(existingData)) {
        existingData.forEach((show: ShowInfo) => {
          existingShows.set(show.name, show);
        });
      }
    } catch (error) {
      // If file is invalid, start fresh
      console.log("⚠️  Could not load existing shows, starting fresh");
    }
  }

  return existingShows;
}

/**
 * Merge discovered shows with existing user preferences
 */
function mergeShows(discovered: ShowInfo[], existing: Map<string, ShowInfo>): ShowInfo[] {
  return discovered.map((show) => {
    const existingShow = existing.get(show.name);
    if (existingShow) {
      // Preserve user's enabled preference
      return {
        ...show,
        enabled: existingShow.enabled !== undefined ? existingShow.enabled : true,
      };
    }
    // New show - default to enabled
    return {
      ...show,
      enabled: true,
    };
  });
}

/**
 * Main function to discover and save Broadway Direct shows
 */
async function main() {
  console.log("🎭 Discovering Broadway Direct lottery shows from bwayrush.com...\n");

  try {
    // Load existing shows to preserve user preferences
    const existingShows = loadExistingShows();
    const existingCount = existingShows.size;
    
    if (existingCount > 0) {
      console.log(`📋 Found ${existingCount} existing show(s) with user preferences\n`);
    }

    // Discover new shows
    const discoveredShows = await discoverBroadwayDirectShows();

    if (discoveredShows.length === 0) {
      console.log("⚠️  No Broadway Direct lottery shows found.");
      return;
    }

    // Merge with existing preferences
    const mergedShows = mergeShows(discoveredShows, existingShows);

    // Count shows by status
    const enabledCount = mergedShows.filter(s => s.enabled !== false).length;
    const disabledCount = mergedShows.filter(s => s.enabled === false).length;
    const newCount = mergedShows.filter(s => !existingShows.has(s.name)).length;

    console.log(`\n📊 Summary:`);
    console.log(`   Total shows: ${mergedShows.length}`);
    console.log(`   Enabled (will enter): ${enabledCount}`);
    console.log(`   Disabled (enabled: false): ${disabledCount}`);
    if (newCount > 0) {
      console.log(`   New shows: ${newCount}`);
    }
    console.log();

    // Show all shows with their status
    mergedShows.forEach((show) => {
      const status = show.enabled !== false ? "✓" : "✗ (disabled)";
      const isNew = !existingShows.has(show.name) ? " [NEW]" : "";
      console.log(`   ${status} ${show.name}${isNew}`);
    });
    console.log();

    // Save to JSON file
    const outputPath = join(__dirname, "../broadway-direct/showsToEnter.json");
    writeFileSync(outputPath, JSON.stringify(mergedShows, null, 2) + "\n", "utf-8");
    console.log(`✅ Saved ${mergedShows.length} show(s) to ${outputPath}`);
    console.log("\n💡 To control which shows to enter:");
    console.log("   - Set enabled: false to skip a show");
    console.log("   - Set enabled: true (or omit) to enter that show");
    console.log("   - Your preferences are preserved when running discover-broadway-direct again");
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { discoverBroadwayDirectShows };

