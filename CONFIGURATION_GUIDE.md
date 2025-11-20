# Configuration Guide for Non-Technical Users

This guide will help you configure which shows to enter for the lottery automation, even if you're not familiar with coding.

## Quick Overview

Both lotteries use simple JSON files that you can edit directly on GitHub:

- **Telecharge Lottery**: `telecharge/showsToEnter.json` - Use `num_tickets: 0` to skip
- **Broadway Direct Lottery**: `broadway-direct/showsToEnter.json` - Use `enabled: false` to skip

## Quick Start

### Option 1: Edit the File Directly on GitHub (Easiest)

This is the simplest method - no coding knowledge needed!

**For Telecharge Lottery:**

1. Go to your GitHub repository
2. Navigate to `telecharge/showsToEnter.json`
3. Click the pencil icon (✏️) to edit
4. Change the `num_tickets` value for each show:
   - `0` = Don't enter this show's lottery
   - `1` = Enter for 1 ticket
   - `2` = Enter for 2 tickets
5. Click "Commit changes" at the bottom

**For Broadway Direct Lottery:**

1. Go to your GitHub repository
2. Navigate to `broadway-direct/showsToEnter.json`
3. Click the pencil icon (✏️) to edit
4. Change the `enabled` value for each show:
   - `false` = Don't enter this show's lottery
   - `true` = Enter this show's lottery (or omit the field)
5. Click "Commit changes" at the bottom

### Option 2: Use the Interactive Tool (Command Line)

1. Open your terminal/command prompt
2. Navigate to the project folder
3. Run:
   ```bash
   make configure-shows
   ```
4. Choose which lottery to configure:
   - Option 1: Telecharge
   - Option 2: Broadway Direct
   - Option 3: Both
5. Follow the prompts:
   - **For Telecharge**: Set number of tickets (0 = skip, 1 or 2 = enter)
   - **For Broadway Direct**: Answer y/yes to enter, n/no to skip

The tool will guide you through each show and let you save your changes at the end.

## Understanding the Configuration File

The `telecharge/showsToEnter.json` file looks like this:

```json
[
  {
    "name": "Art",
    "url": "https://artonbroadway.com/",
    "lotteryUrl": "https://my.socialtoaster.com/st/lottery_select/?key=BROADWAY&source=iframe",
    "num_tickets": 2
  },
  {
    "name": "Chess",
    "url": "https://chessbroadway.com/",
    "lotteryUrl": "https://my.socialtoaster.com/st/lottery_select/?key=BROADWAY&source=iframe",
    "num_tickets": 0
  }
]
```

### What Each Field Means:

- **`name`**: The show name (don't change this - it must match exactly)
- **`url`**: The show's website (optional, just for reference)
- **`lotteryUrl`**: The lottery URL (don't change this)
- **`num_tickets`**: **This is what you control!**
  - `0` = Skip this show (won't enter the lottery)
  - `1` = Enter lottery for 1 ticket
  - `2` = Enter lottery for 2 tickets

## Examples

### Example 1: Only Enter 3 Shows

```json
[
  {
    "name": "Art",
    "num_tickets": 2
  },
  {
    "name": "Chess",
    "num_tickets": 0
  },
  {
    "name": "Hell's Kitchen",
    "num_tickets": 2
  },
  {
    "name": "The Great Gatsby",
    "num_tickets": 1
  }
]
```

In this example:

- ✅ Will enter: Art (2 tickets), Hell's Kitchen (2 tickets), The Great Gatsby (1 ticket)
- ❌ Will skip: Chess

### Example 2: Enter All Shows for 2 Tickets

Set `num_tickets: 2` for all shows (or leave it as default).

### Example 3: Disable All Shows Temporarily

Set `num_tickets: 0` for all shows. The automation will run but won't enter any lotteries.

## Updating the Show List

When new shows are added to Telecharge, run:

```bash
make discover-telecharge
```

This will:

- ✅ Add any new shows
- ✅ Keep your existing preferences (if you set a show to `num_tickets: 0`, it stays disabled)
- ✅ Update URLs if they changed

## Common Questions

**Q: What if I make a mistake in the JSON file?**
A: GitHub will show you an error when you try to save. Make sure:

- All brackets `[ ]` and braces `{ }` are properly closed
- All commas are in the right places
- All `num_tickets` values are numbers (0, 1, or 2)

**Q: Can I remove shows I don't want?**
A: Yes, but it's easier to just set `num_tickets: 0`. If you remove a show, it will be added back when you run `make discover-telecharge`.

**Q: What happens if I set num_tickets to something other than 0, 1, or 2?**
A: The script will use your default `NUMBER_OF_TICKETS` environment variable value instead.

**Q: How do I know which shows are available?**
A: Run `make discover-telecharge` to see all available shows, or check the Telecharge lottery page directly.

## For Broadway Direct Lottery

The Broadway Direct lottery uses a similar JSON configuration file.

### Configuration File Location

`broadway-direct/showsToEnter.json`

### File Format

```json
[
  {
    "name": "Aladdin",
    "url": "https://lottery.broadwaydirect.com/show/aladdin/",
    "enabled": true
  },
  {
    "name": "Beetlejuice",
    "url": "https://lottery.broadwaydirect.com/show/beetlejuice-ny/",
    "enabled": false
  }
]
```

### How to Configure

**On GitHub:**

1. Go to `broadway-direct/showsToEnter.json` in your repository
2. Click the ✏️ (pencil) icon to edit
3. Set `enabled: false` to skip a show, or `enabled: true` to enter it
4. Click "Commit changes"

**Locally:**
Edit the file directly with any text editor.

### Examples

**Skip specific shows:**

```json
[
  {
    "name": "Aladdin",
    "url": "https://lottery.broadwaydirect.com/show/aladdin/",
    "enabled": true
  },
  {
    "name": "Beetlejuice",
    "url": "https://lottery.broadwaydirect.com/show/beetlejuice-ny/",
    "enabled": false
  }
]
```

**Enter all shows:**
Set `enabled: true` for all shows (or omit the field, as `true` is the default).

**Temporarily disable all:**
Set `enabled: false` for all shows.
