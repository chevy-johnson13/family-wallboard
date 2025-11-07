# 📅 How to Get Your iCloud Calendar ICS URL

Follow these steps to get your personal iCloud calendar URL for the Family Wallboard.

---

## Step-by-Step Instructions

### For Your iCloud Calendar:

1. **Open iCloud Calendar in a web browser**
   - Go to: https://www.icloud.com/calendar
   - Sign in with your Apple ID

2. **Find your calendar in the sidebar**
   - Look for your personal calendar (usually your name or "Home")
   - If you don't see it, make sure it's not hidden (check the checkbox next to it)

3. **Share the calendar**
   - Click the **share icon** (looks like a person with a +) next to your calendar name
   - Or right-click on the calendar name and select **"Share Calendar"**

4. **Make it public**
   - In the sharing dialog, look for **"Public Calendar"** option
   - Toggle it **ON** or check the box
   - This will generate a public link

5. **Copy the calendar URL**
   - You'll see a link that looks like:
     ```
     webcal://p01-calendarws.icloud.com/ca/subscribe/1/...
     ```
   - **Important:** Copy this entire URL

6. **Convert webcal:// to https://**
   - Replace `webcal://` with `https://` in the URL
   - The final URL should look like:
     ```
     https://p01-calendarws.icloud.com/ca/subscribe/1/...
     ```

7. **Add to your .env file**
   - Open: `backend/.env`
   - Add these lines (replace with your actual URL):
     ```env
     CALENDAR_CHEVON_PERSONAL_ICS_URL=https://p01-calendarws.icloud.com/ca/subscribe/1/YOUR_TOKEN_HERE
     CALENDAR_CHEVON_PERSONAL_NAME=Chevon (Personal)
     CALENDAR_CHEVON_PERSONAL_COLOR=#60A5FA
     ```

### For Your Wife's iCloud Calendar:

Repeat the same steps above, but use:
```env
CALENDAR_WIFE_PERSONAL_ICS_URL=https://p01-calendarws.icloud.com/ca/subscribe/1/HER_TOKEN_HERE
CALENDAR_WIFE_PERSONAL_NAME=Wife (Personal)
CALENDAR_WIFE_PERSONAL_COLOR=#F472B6
```

---

## Example .env Configuration

Here's what your complete calendar section should look like:

```env
# Work Calendars
CALENDAR_CHEVON_ICS_URL=https://outlook.office365.com/owa/calendar/...
CALENDAR_CHEVON_COLOR=#3B82F6
CALENDAR_CHEVON_NAME=Chevon (Work)

CALENDAR_WIFE_ICS_URL=https://calendar.google.com/calendar/ical/...
CALENDAR_WIFE_COLOR=#EC4899
CALENDAR_WIFE_NAME=Wife (Work)

# Personal iCloud Calendars
CALENDAR_CHEVON_PERSONAL_ICS_URL=https://p01-calendarws.icloud.com/ca/subscribe/1/...
CALENDAR_CHEVON_PERSONAL_NAME=Chevon (Personal)
CALENDAR_CHEVON_PERSONAL_COLOR=#60A5FA

CALENDAR_WIFE_PERSONAL_ICS_URL=https://p01-calendarws.icloud.com/ca/subscribe/1/...
CALENDAR_WIFE_PERSONAL_NAME=Wife (Personal)
CALENDAR_WIFE_PERSONAL_COLOR=#F472B6
```

---

## Troubleshooting

### Can't find the share option?
- Make sure you're viewing the calendar in the web interface (not the Mac Calendar app)
- Try right-clicking on the calendar name in the sidebar
- Some calendars might need to be enabled for sharing first

### The URL doesn't work?
- Make sure you replaced `webcal://` with `https://`
- Verify the calendar is set to "Public Calendar"
- Try copying the URL again - sometimes there are extra characters

### Events not showing up?
- Wait a few minutes for the calendar to sync
- Check the backend logs for any errors
- Verify the URL is accessible by opening it in a browser (you should see ICS/calendar data)

---

## Security Note

⚠️ **Important:** Making your calendar "public" means anyone with the URL can view your calendar events. However:
- The URL is long and random (hard to guess)
- It's only used by your wallboard
- You can regenerate it anytime by turning public sharing off and back on

If you're concerned about privacy, you can:
- Only share specific calendars (not your main one)
- Create a separate "Family" calendar for wallboard use
- Regularly regenerate the URL

---

## After Adding to .env

1. **Restart your backend** (if it's running):
   ```bash
   # Stop the current backend (Ctrl+C)
   # Then restart:
   cd backend
   npm run dev
   ```

2. **Check the wallboard** - You should now see both work and personal calendars with different colors!

3. **Verify in the UI** - Go to http://localhost:5173 and check:
   - Both calendars appear in the calendar list
   - Events from both calendars show up
   - They have different colors (work = darker blue, personal = lighter blue)

---

Need help? Check the main README or ask for assistance!

