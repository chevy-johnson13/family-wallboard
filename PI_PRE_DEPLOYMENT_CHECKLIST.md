# 📋 Pre-Deployment Checklist

Before deploying to your Raspberry Pi, make sure everything is working perfectly on your Mac!

---

## ✅ Step 1: Verify Everything Works on Mac

### 1. Backend Running?
```bash
curl http://localhost:3000/api/health
```
Expected: `{"status":"ok"}`

### 2. Frontend Loading?
Open: http://localhost:5173
- ✅ Calendar events showing?
- ✅ Today view working?
- ✅ Tasks loading from Todoist?
- ✅ No console errors?

### 3. Ring/Home Assistant Integration?
```bash
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":30000}'
```
- ✅ Overlay appears?
- ✅ "Open Home Assistant" button works?

### 4. Manual Camera Buttons?
- ✅ Click "Cameras" button in top-right
- ✅ Both Front Door and Driveway options work?

---

## ✅ Step 2: Prepare Configuration

### 1. Check Your `.env` File

Open: `/Users/chevon.johnson/Desktop/Personal/Family Wallboard/.env`

Make sure these are set:

```env
# ✅ Google/Outlook/iCloud Calendar ICS URLs
CALENDAR_CHEVON_ICS_URL=https://...
CALENDAR_WIFE_ICS_URL=
CALENDAR_BABY_ICS_URL=

# ✅ Todoist
TODOIST_API_TOKEN=b181cd2de98be7d527d95b768a02992d9cba116b
TODOIST_PROJECT_ID=2343093886

# ✅ Home Assistant (will need to update for Pi)
HOME_ASSISTANT_URL=http://localhost:8123
HOME_ASSISTANT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RING_CAMERA_ENTITY_ID=camera.front_door_live_view

# ✅ Meals (optional)
MEALS_GOOGLE_SHEET_ID=
```

**Notes:**
- Wife and Baby calendars can be added later
- Meals are optional for now
- You'll update `HOME_ASSISTANT_URL` on the Pi

### 2. Find Your Mac's IP Address (if keeping HA on Mac)

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Write down your Mac's IP: `192.168.1.___`

You'll need this for the Pi to connect to Home Assistant.

---

## ✅ Step 3: Prepare Raspberry Pi Hardware

### You Need:

1. **Raspberry Pi** (3B+, 4, or 5)
   - Have it? ☐

2. **Touchscreen Display**
   - Official 7" Pi Touch Display, or
   - Any HDMI touchscreen
   - Have it? ☐

3. **MicroSD Card** (32GB+ recommended)
   - Have it? ☐

4. **Power Supply**
   - Official Pi power supply (recommended)
   - Or USB-C adapter with sufficient power
   - Have it? ☐

5. **Keyboard + Mouse** (for initial setup)
   - Can be temporary, just for setup
   - Have them? ☐

6. **Network**
   - Will Pi use WiFi or Ethernet?
   - Know your WiFi password? ☐

---

## ✅ Step 4: Prepare Raspberry Pi OS

### Option A: Flash Now (Recommended)

1. Download **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
2. Insert microSD card into your Mac
3. Open Imager and configure:
   - **OS**: Raspberry Pi OS (64-bit) with desktop
   - **Storage**: Your microSD card
   - **Settings** (⚙️):
     - Hostname: `familywallboard`
     - Enable SSH: ✅
     - Username: `pi`
     - Password: `raspberry` (or your choice)
     - WiFi: Your network name + password
     - Timezone: `America/New_York`
4. Click **Write** and wait

### Option B: Do It Later

We'll walk through it when you're ready.

---

## ✅ Step 5: Decide on Home Assistant Setup

Which option do you prefer?

### Option A: Keep HA on Mac ⭐ Easiest
- **Pros**: Simple deployment, no changes needed
- **Cons**: Mac must stay on for doorbell integration
- **Best for**: Testing, or if Mac is always on anyway

### Option B: Move HA to Pi
- **Pros**: Pi is fully self-contained
- **Cons**: Need to reconfigure Ring integration, get new token
- **Best for**: Final production setup

### Option C: Dedicated HA Device
- **Pros**: Most reliable, both devices independent
- **Cons**: Requires extra hardware (another Pi, NAS, etc.)
- **Best for**: If you already have HA running elsewhere

**Your choice:** _____

---

## ✅ Step 6: Test Deployment Script

Make sure the deployment script can create a package:

```bash
cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard"
./DEPLOY_TO_PI.sh
```

If you see "Cannot reach familywallboard.local" - that's OK! Your Pi isn't set up yet.

Just verify it creates `wallboard-deploy.tar.gz`.

---

## ✅ Step 7: Optional - Add More Calendars

If you want to add your wife's and baby's calendars now:

### iCloud Calendar:
1. Open iCloud Calendar (iCloud.com)
2. Click calendar name → Public Calendar → Copy link
3. Add to `.env` as `CALENDAR_WIFE_ICS_URL` or `CALENDAR_BABY_ICS_URL`

### Outlook Calendar:
1. Open Outlook web
2. Settings → View all Outlook settings
3. Calendar → Shared calendars
4. Publish calendar → ICS → Copy link
5. Add to `.env`

### Google Calendar:
1. Google Calendar → Settings → Settings for my calendars
2. Select calendar → Integrate calendar
3. Copy "Secret address in iCal format"
4. Add to `.env`

---

## 🎯 You're Ready When:

- ✅ Wallboard works perfectly on your Mac
- ✅ All integrations tested (calendars, Todoist, Ring)
- ✅ `.env` file is complete and working
- ✅ Pi hardware is ready
- ✅ MicroSD card is flashed with Pi OS
- ✅ You know Mac's IP address (if keeping HA there)
- ✅ You've decided on HA setup option

---

## 🚀 Next Step:

Once all the above is ready, follow: **`PI_COMPLETE_SETUP_GUIDE.md`**

Or run: `./DEPLOY_TO_PI.sh` (after Pi is booted and connected)

---

## Need Help?

Common issues:

**Calendar errors showing "Not Found"?**
- Normal if Wife/Baby calendars aren't configured yet
- Your work calendar should be working

**Night mode dimming screen?**
- Expected between 9 PM - 6 AM
- To test without dimming, change `useNightMode.ts`

**Can't reach Home Assistant?**
- Make sure Docker container is running: `docker ps`
- Check http://localhost:8123 in browser

**Todoist tasks not showing?**
- Add some tasks in Todoist app first
- Verify token in `.env`
- Check backend logs

---

Good luck! 🎉

