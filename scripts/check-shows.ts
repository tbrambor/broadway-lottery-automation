import { readFileSync } from "fs";
import { join } from "path";

// Extract show names from the HTML source provided
const htmlSource = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Become a User | The Shubert Organization, Inc</title>
  ...
</head>
<body id='st_campaign_body' class='st_campaign_body_BROADWAY st_campaign_body_font_arial st_campaign_body_page_-st-lottery_select- st_campaign_body_logged_in  '>
    ...
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39453').click()">
        <div class="lottery_show_title st_uppercase">
            Art
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39469').click()">
        <div class="lottery_show_title st_uppercase">
            Chess
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39433').click()">
        <div class="lottery_show_title st_uppercase">
            Hell&#39;s Kitchen
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39454').click()">
        <div class="lottery_show_title st_uppercase">
            Jamie Allan&#39;s Amaze
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39460').click()">
        <div class="lottery_show_title st_uppercase">
            Little Bear Ridge Road
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39452').click()">
        <div class="lottery_show_title st_uppercase">
            Mamma Mia!
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39436').click()">
        <div class="lottery_show_title st_uppercase">
            Maybe Happy Ending
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39459').click()">
        <div class="lottery_show_title st_uppercase">
            Ragtime
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39434').click()">
        <div class="lottery_show_title st_uppercase">
            The Great Gatsby
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39432').click()">
        <div class="lottery_show_title st_uppercase">
            The Outsiders
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39465').click()">
        <div class="lottery_show_title st_uppercase">
            Kyoto
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39464').click()">
        <div class="lottery_show_title st_uppercase">
            Kyoto - Table Seating
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39435').click()">
        <div class="lottery_show_title st_uppercase">
            Oh, Mary!
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39440').click()">
        <div class="lottery_show_title st_uppercase">
            Operation Mincemeat: A New Musical
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39470').click()">
        <div class="lottery_show_title st_uppercase">
            Two Strangers (Carry a Cake Across New York)
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39467').click()">
        <div class="lottery_show_title st_uppercase">
            Romy &amp; Michele: The Musical
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39473').click()">
        <div class="lottery_show_title st_uppercase">
            The Comedy Series featuring Ego Nwodim
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39449').click()">
        <div class="lottery_show_title st_uppercase">
            Heathers
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39461').click()">
        <div class="lottery_show_title st_uppercase">
            Liberation
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39428').click()">
        <div class="lottery_show_title st_uppercase">
            Little Shop of Horrors
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39429').click()">
        <div class="lottery_show_title st_uppercase">
            The Play That Goes Wrong
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39450').click()">
        <div class="lottery_show_title st_uppercase">
            Heathers
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39462').click()">
        <div class="lottery_show_title st_uppercase">
            Liberation
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39430').click()">
        <div class="lottery_show_title st_uppercase">
            Little Shop of Horrors
        </div>
        ...
    </div>
    <div class="lottery_show st_style_page_text_border" onclick="$('#event-39431').click()">
        <div class="lottery_show_title st_uppercase">
            The Play That Goes Wrong
        </div>
        ...
    </div>
</body>
</html>`;

// Parse shows from HTML
function extractShowsFromHTML(html: string): string[] {
  const shows: string[] = [];
  const regex = /<div class="lottery_show_title st_uppercase">\s*([^<]+)\s*<\/div>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    let showName = match[1].trim();
    // Decode HTML entities
    showName = showName
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    shows.push(showName);
  }
  
  // Remove duplicates and sort
  return [...new Set(shows)].sort();
}

// Load current shows from JSON
function loadCurrentShows(): string[] {
  try {
    const showsPath = join(__dirname, "../telecharge/showsToEnter.json");
    const showsData = JSON.parse(readFileSync(showsPath, "utf-8"));
    return showsData.map((show: any) => show.name).sort();
  } catch (error) {
    console.error(`Error loading shows: ${error}`);
    return [];
  }
}

// Main comparison
function main() {
  console.log("🔍 Comparing shows from HTML source with showsToEnter.json...\n");
  
  // Extract shows from the HTML source you provided
  const htmlShows = extractShowsFromHTML(htmlSource);
  const currentShows = loadCurrentShows();
  
  console.log(`📊 Shows found in HTML source: ${htmlShows.length}`);
  console.log(`📊 Shows in showsToEnter.json: ${currentShows.length}\n`);
  
  // Find missing shows
  const missingShows = htmlShows.filter(show => !currentShows.includes(show));
  const extraShows = currentShows.filter(show => !htmlShows.includes(show));
  
  if (missingShows.length > 0) {
    console.log(`❌ Missing shows (in HTML but not in JSON): ${missingShows.length}`);
    missingShows.forEach(show => {
      console.log(`   - ${show}`);
    });
    console.log();
  } else {
    console.log("✅ All shows from HTML are in showsToEnter.json\n");
  }
  
  if (extraShows.length > 0) {
    console.log(`⚠️  Extra shows (in JSON but not in HTML): ${extraShows.length}`);
    extraShows.forEach(show => {
      console.log(`   - ${show}`);
    });
    console.log();
  }
  
  // Show all shows from HTML
  console.log("📋 All shows available on the lottery page:");
  htmlShows.forEach((show, index) => {
    const inJson = currentShows.includes(show) ? "✓" : "✗";
    console.log(`   ${index + 1}. ${show} ${inJson}`);
  });
}

main();

