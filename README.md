# Broadway Lottery

## Overview

The project was created to automate signing up for Broadway musicals' lotteries to get affordable tickets. It supports multiple lottery platforms:

- **[Broadway Direct](https://lottery.broadwaydirect.com/)** - TypeScript/Playwright implementation
- **[Telecharge](https://www.telecharge.com/)** - TypeScript/Playwright implementation

Each lottery platform has its own workflow and can be enabled independently. The results of the lottery drawings are sent out via email (frequently at 3 p.m., but not always). Enjoy the shows and please use this automation responsibly. Reselling these tickets is not allowed.

## Quick Configuration Guide

**New to this project?** See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for step-by-step instructions on how to configure which shows to enter directly on GitHub - no coding knowledge required!

## How to use it

### Local Testing

You can test the automation locally before deploying to GitHub Actions:

1. **Set up the project:**

   ```bash
   make setup
   # or manually:
   npm install
   npx playwright install chromium
   ```

2. **Set environment variables:**

   **Using direnv (recommended):**

   If you have [direnv](https://direnv.net/) installed, copy the example file:

   ```bash
   cp .envrc.example .envrc
   # Then edit .envrc with your actual information
   direnv allow
   ```

   direnv will automatically load the environment variables when you enter the project directory.

   **Or export them directly in your shell:**

   ```bash
   export FIRST_NAME="Your First Name"
   export LAST_NAME="Your Last Name"
   export NUMBER_OF_TICKETS="2"
   export EMAIL="your.email@example.com"
   export DOB_MONTH="1"
   export DOB_DAY="15"
   export DOB_YEAR="1990"
   export ZIP="10001"
   export COUNTRY="USA"
   ```

   **Note:** The `.envrc` file is gitignored and won't be committed to the repository.

3. **Run tests:**

   **With browser visible (recommended for debugging):**

   ```bash
   make test
   # or
   npm run test:headed
   ```

   **In headless mode:**

   ```bash
   make test-headless
   # or
   npm run test:headless
   ```

   **Interactive UI mode:**

   ```bash
   make test-ui
   # or
   npm run test:ui
   ```

   **Debug mode (step through):**

   ```bash
   make test-debug
   # or
   npm run test:debug
   ```

   **Filter to specific shows:**

   You can test only specific shows by setting the `SHOWS` environment variable with a comma-separated list of show names:

   ```bash
   # Test only Aladdin and Wicked
   SHOWS=aladdin,wicked make test

   # Test only Six
   SHOWS=six-ny make test-headless

   # Using npm directly
   SHOWS=aladdin,wicked npm run test:headed
   ```

   The filter matches show names from the URL (e.g., `aladdin` matches `aladdin`, `six-ny` matches `six-ny`). You can also add it to your `.envrc` file:

   ```bash
   export SHOWS="aladdin,wicked"
   ```

   **Or configure shows via JSON file (recommended):**

   **Option A: Auto-discover shows from bwayrush.com:**

   ```bash
   make discover-broadway-direct
   ```

   This will automatically discover all Broadway Direct lottery shows from [bwayrush.com](https://bwayrush.com/) and update `broadway-direct/showsToEnter.json`. **Your existing preferences are preserved** - if you've set `enabled: false` for a show, it will remain disabled.

   **Option B: Edit the file directly:**

   Edit `broadway-direct/showsToEnter.json` to control which shows to enter:

   - Set `enabled: false` to skip a show
   - Set `enabled: true` (or omit) to enter a show

   See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for detailed instructions.

4. **View test report:**
   ```bash
   make test-report
   # or
   npm run test:report
   ```

### GitHub Actions (Automated)

1. "Fork" the repository (button at the top right side)
2. To create ([repository secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)) go to the **Settings** tab => **Secrets and variables** => **Actions**
3. Click "New repository secret" and add the following secrets with your personal information:

   **Required for both lotteries:**

   1. `FIRST_NAME` (example value: `Donald`)
   2. `LAST_NAME` (example value: `Duck`)
   3. `NUMBER_OF_TICKETS` (allowed values: `1` or `2`)
   4. `EMAIL` (example value: `donald.duck@gmail.com`)
   5. `DOB_MONTH` - month of birth (allowed values: `1` - `12`)
   6. `DOB_DAY` - day of birth (allowed values: `1` - `31`)
   7. `DOB_YEAR` - year of birth (example value: `1999`)
   8. `ZIP` - address postal code (example value: `10007`)
   9. `COUNTRY` (allowed values: `USA`, `CANADA`, `OTHER`)

   **Additional secrets required for Telecharge lottery:**

   10. `TELECHARGE_EMAIL` - Your Telecharge account email (example: `donald.duck@gmail.com`)
   11. `TELECHARGE_PASSWORD` - Your Telecharge account password

   ⚠️ **Important:** Make sure all secrets are set, especially `TELECHARGE_EMAIL` and `TELECHARGE_PASSWORD` if you're using the Telecharge lottery. The workflow will fail with "Missing required environment variable" errors if any secrets are missing.

4. Go to the **Actions** tab, accept the terms and conditions, and enable the workflow(s) you want to use:
   - **BroadwayDirect Lottery** - for Broadway Direct lotteries
   - **Telecharge Lottery** - for Telecharge lotteries
5. The workflows will run daily at the [specified time](/.github/workflows/broadway-direct-lottery.yml#L5) (UTC timezone) for Broadway Direct and [12:01 AM Eastern Time](/.github/workflows/telecharge-lottery.yml#L10) for Telecharge
6. Update show lists as needed:
   - **Broadway Direct**: Run `make discover-broadway-direct` or edit [broadway-direct/showsToEnter.json](/broadway-direct/showsToEnter.json)
   - **Telecharge**: Run `make discover-telecharge` or edit [telecharge/showsToEnter.json](/telecharge/showsToEnter.json)
   - **Both**: Run `make discover-all` to update both at once

### Secrets example

#### List of secrets

<img width="640" alt="image" src="https://github.com/NameFILIP/broadway-lottery/assets/834796/7b3baad6-5fad-42ff-9704-074d6bcaadc2">

#### Create a new secret

<img width="640" alt="image" src="https://github.com/NameFILIP/broadway-lottery/assets/834796/52daa38a-7fec-4f5d-b918-362b18dcb2bc">

## Email filters

In order to avoid being a daily loser, I recommend creating email filters to automatically Archive or Delete the following emails:

- from:(lottery@broadwaydirect.com) subject:(Lottery Entry Received)
- from:(lottery@broadwaydirect.com) subject:(Lottery Results: Try Again)

This way you will only receive emails when you win something.

## Telecharge Lottery Setup

The Telecharge lottery uses TypeScript and Playwright (same as Broadway Direct). To set it up locally:

1. **Install dependencies** (same as Broadway Direct):

   ```bash
   make setup
   # or manually:
   npm install
   npx playwright install chromium
   ```

2. **Configure shows:**

   **Option A: Interactive configuration tool (easiest for non-technical users):**

   ```bash
   make configure-shows
   ```

   This will ask you which lottery to configure (Telecharge, Broadway Direct, or both) and guide you through each show:

   - **Telecharge**: Set number of tickets (0 = skip, 1 or 2 = enter)
   - **Broadway Direct**: Answer y/yes to enter, n/no to skip

   **Option B: Auto-discover shows from bwayrush.com:**

   ```bash
   make discover-telecharge
   ```

   This will automatically discover all Telecharge lottery shows from [bwayrush.com](https://bwayrush.com/) and update `telecharge/showsToEnter.json`. **Your existing preferences are preserved** - if you've set `num_tickets: 0` for a show, it will remain disabled.

   **Option C: Edit the file directly on GitHub:**

   1. Go to `telecharge/showsToEnter.json` in your GitHub repository
   2. Click the ✏️ (pencil) icon to edit
   3. Change `num_tickets` values:
      - `0` = Skip this show (don't enter)
      - `1` = Enter for 1 ticket
      - `2` = Enter for 2 tickets
   4. Click "Commit changes"

   See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for detailed instructions and examples.

   **Selecting which shows to enter:**

   - Set `num_tickets` to `1` or `2` to enter that show's lottery
   - Set `num_tickets` to `0` to **skip** that show (it won't be entered)
   - If `num_tickets` is not specified, it defaults to the value from `NUMBER_OF_TICKETS` environment variable

   **Note:** After logging in, the script will automatically navigate to the lottery selection page where all available lotteries are displayed. It will then enter each enabled lottery by matching the show name. You don't need to provide individual show URLs.

3. **Set environment variables:**

   ```bash
   # Required for both lotteries
   export FIRST_NAME="Your First Name"
   export LAST_NAME="Your Last Name"
   export NUMBER_OF_TICKETS="2"
   export EMAIL="your.email@example.com"
   export DOB_MONTH="1"
   export DOB_DAY="15"
   export DOB_YEAR="1990"
   export ZIP="10001"
   export COUNTRY="USA"

   # Required for Telecharge lottery (login credentials)
   export TELECHARGE_EMAIL="your.telecharge.email@example.com"
   export TELECHARGE_PASSWORD="your_telecharge_password"
   ```

4. **Run the lottery:**

   ```bash
   # With browser visible (recommended for debugging)
   make telecharge
   # or
   npx playwright test e2e/telecharge.spec.ts

   # In headless mode
   make telecharge-headless
   # or
   CI=true npx playwright test e2e/telecharge.spec.ts

   # Filter to specific shows
   SHOWS=show1,show2 make telecharge
   ```

The GitHub Actions workflow will automatically run the Telecharge lottery daily at 12:01 AM Eastern Time (04:01 UTC) if enabled. Note: Due to daylight saving time, in winter (EST) it will run at 11:01 PM EST the day before, which is still acceptable as the lottery opens at midnight.
