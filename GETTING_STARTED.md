# Getting Started with Family Wallboard

## 🎉 Your Wallboard is Running!

**Frontend**: http://localhost:5173  
**Backend**: http://localhost:3000

---

## Quick Setup Checklist

### ✅ Already Done
- [x] Project structure created
- [x] Dependencies installed
- [x] Servers running locally
- [x] Basic interface working

### 📝 To Do Next

#### 1. Add Your Calendar(s)

**Get your Google Calendar ICS URL:**
1. Go to https://calendar.google.com
2. Click the **⋮** (three dots) next to your calendar name
3. Click **"Settings and sharing"**
4. Scroll to **"Integrate calendar"**
5. Copy the **"Secret address in iCalendar format"**

**Add to your .env file:**
```bash
# Edit this file
/Users/chevon.johnson/Desktop/Personal/Family Wallboard/backend/.env
```

Paste your URL:
```
CALENDAR_PERSON1_ICS_URL=https://calendar.google.com/calendar/ical/your@email.com/private-xxxxx/basic.ics
```

**Repeat for Person 2's and child's calendars if desired.**

#### 2. Optional: Add Todoist for Tasks

1. Get your token: https://todoist.com/prefs/integrations
2. Add to `.env`:
```
TODOIST_API_TOKEN=your_token_here
```
3. Get your project ID from the Todoist URL when viewing your family project

#### 3. Optional: Add Home Assistant for Ring

If you have Home Assistant and Ring already set up:
```
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your_long_lived_token
RING_CAMERA_ENTITY_ID=camera.ring_front_door
```

---

## Features to Try

### 📅 Today View
- See today's agenda
- "Dinner Tonight" meal highlight
- Clean, card-based layout

### 📆 Week View
- FullCalendar week grid
- Time-based schedule
- Color-coded by person

### 🗓️ Month View
- Monthly calendar overview
- All events at a glance

### ✅ Tasks View
- Add, complete, and delete tasks
- Syncs with Todoist
- Family to-do list

### 🍽️ Meals View
- Weekly meal planner
- Edit meals directly
- "Today" is highlighted

---

## Customization

### Change Calendar Names/Colors

Edit `backend/.env`:

```bash
CALENDAR_PERSON1_NAME=Dad
CALENDAR_PERSON1_COLOR=#3B82F6   # Blue

CALENDAR_PERSON2_NAME=Mom
CALENDAR_PERSON2_COLOR=#EC4899     # Pink

CALENDAR_CHILD_NAME=Child
CALENDAR_CHILD_COLOR=#10B981     # Green
```

### Adjust Night Mode Hours

Edit `frontend/src/hooks/useNightMode.ts` to change when night mode activates (default: 9 PM - 6 AM).

### Change Auto-Refresh Interval

Edit `frontend/src/hooks/useAutoRefresh.ts` (default: 5 minutes for calendar, 1 minute for tasks).

---

## Raspberry Pi Deployment

Once you're happy with how it looks, deploy to your Raspberry Pi:

1. **Get Raspberry Pi hardware**
   - Raspberry Pi 4 or 5 (4GB+ RAM)
   - 7" or 10" touchscreen
   - microSD card (32GB+)

2. **Install Raspberry Pi OS**
   - Use Raspberry Pi Imager
   - Enable SSH and WiFi during setup

3. **Run deployment script**
   ```bash
   cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard"
   ./pi-setup/deploy.sh pi@raspberrypi.local
   ```

4. **Follow setup guide**
   - See `pi-setup/README.md` for complete instructions

---

## Troubleshooting

### Calendar events not showing?
- Check your ICS URL is correct and not expired
- Verify backend logs: Look for errors in the terminal
- Test the URL in a browser (should download a .ics file)

### Tasks not loading?
- Verify your Todoist API token is correct
- Check you have access to the project

### Backend not starting?
- Check port 3000 isn't already in use: `lsof -ti:3000`
- Check for errors in the backend terminal

### Frontend not loading?
- Check port 5173 isn't already in use: `lsof -ti:5173`
- Clear browser cache and refresh

---

## Development Commands

### Start Backend (from backend/ directory)
```bash
npm run dev      # Development mode with auto-reload
npm start        # Production mode
```

### Start Frontend (from frontend/ directory)
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### View Backend Logs
Just watch the terminal where you ran `npm run dev`

---

## File Locations

**Backend Code**: `backend/src/`
**Frontend Code**: `frontend/src/`
**Configuration**: `backend/.env`
**Meal Data**: `backend/data/meals.json` (auto-created)
**Pi Setup**: `pi-setup/`

---

## Next Steps

1. ✨ **Try the app**: http://localhost:5173
2. 📅 **Add your calendar URLs** to see real events
3. 🎨 **Customize** colors, names, and settings
4. 🍓 **Get your Raspberry Pi** when you're ready
5. 🚀 **Deploy** to the Pi for your wall-mounted display

---

## Need Help?

- Check the main `README.md` for architecture details
- See `pi-setup/README.md` for Raspberry Pi deployment
- Review the PRD: `Family_Wallboard_PRD.txt`

Enjoy your Family Wallboard! 🏠📅✨

