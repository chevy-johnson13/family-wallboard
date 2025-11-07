# 🎉 Home Assistant + Ring Integration Complete!

## ✅ What's Done

### 1. Home Assistant Setup
- ✅ Docker Desktop installed
- ✅ Home Assistant running on `http://localhost:8123`
- ✅ Ring integration added to Home Assistant
- ✅ Long-lived access token created
- ✅ Camera entities identified:
  - `camera.front_door_live_view`
  - `camera.driveway_live_view`

### 2. Wallboard Backend Configuration
- ✅ `.env` file updated with:
  - `HOME_ASSISTANT_URL=http://localhost:8123`
  - `HOME_ASSISTANT_TOKEN=[your token]`
  - `RING_CAMERA_ENTITY_ID=camera.front_door_live_view`
- ✅ Overlay service configured to work with Ring cameras
- ✅ API endpoint `/api/overlay/trigger` tested and working

### 3. Wallboard Frontend Updates
- ✅ RingOverlay component updated to display Ring camera feeds
- ✅ Auto-refreshing snapshots for live-ish video (1 fps)
- ✅ Auto-dismiss after configured duration
- ✅ Manual dismiss button
- ✅ Countdown timer display

---

## 🧪 How to Test Right Now

### Test 1: Trigger Overlay via API (Command Line)

```bash
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":30000}'
```

**Expected Result:**
- Open your wallboard: http://localhost:5173
- You should see the Ring overlay appear with the camera feed
- It should auto-dismiss after 30 seconds

### Test 2: Trigger via Home Assistant Developer Tools

1. Open Home Assistant: http://localhost:8123
2. Go to **Developer Tools** → **Services**
3. For now, you can manually test by calling your backend from your browser console:
   ```javascript
   fetch('http://localhost:3000/api/overlay/trigger', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       cameraEntityId: 'camera.front_door_live_view',
       duration: 30000
     })
   })
   ```

---

## 🤖 Setting Up the Doorbell Automation

Now that everything is working, let's set up the automation so it triggers when someone actually rings your doorbell!

### Step 1: Find Your Doorbell Button Entity

1. In Home Assistant, go to: **Settings** → **Devices & Services**
2. Click on **Ring**
3. Click on your **Front Door** device
4. Look for an entity like:
   - `binary_sensor.front_door_ding`
   - `binary_sensor.front_door_button` 
   - `binary_sensor.front_door_motion` (if you want motion alerts too)

**Write down this entity ID** - you'll need it for the next step.

### Step 2: Add the REST Command

**Edit Home Assistant configuration:**

```bash
# Access the Home Assistant config directory
cd ~/homeassistant

# Edit configuration.yaml
nano configuration.yaml
```

**Add this at the bottom of the file:**

```yaml
rest_command:
  trigger_wallboard_overlay:
    url: "http://192.168.1.249:3000/api/overlay/trigger"
    method: POST
    content_type: "application/json"
    payload: |
      {
        "cameraEntityId": "camera.front_door_live_view",
        "duration": 60000
      }
```

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**Restart Home Assistant:**
1. In Home Assistant UI: **Developer Tools** → **YAML** → **Check Configuration**
2. If OK, click **Restart** → **Quick reload**

### Step 3: Create the Automation

**In Home Assistant UI:**

1. Go to: **Settings** → **Automations & Scenes**
2. Click **"+ Create Automation"**
3. Click **"Start with an empty automation"**

**Configure:**

**Trigger:**
- Type: `State`
- Entity: `binary_sensor.front_door_ding` (or whatever you found in Step 1)
- To: `on`

**Action:**
- Type: `Call service`
- Service: `rest_command.trigger_wallboard_overlay`
- Leave data empty

**Save:**
- Name: `Wallboard - Ring Doorbell Alert`
- Click **Save**

---

## 🎨 How It Works

### The Flow:

```
┌─────────────┐
│   Someone   │
│   Rings     │──┐
│  Doorbell   │  │
└─────────────┘  │
                 ▼
         ┌───────────────┐
         │  Ring Device  │
         │  Detects Press│
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────────┐
         │  Home Assistant   │
         │  (Docker on Mac)  │
         └────────┬──────────┘
                  │
                  ▼
         ┌────────────────────┐
         │   Automation       │
         │   Triggers         │
         └────────┬───────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │  REST Command calls      │
      │  Wallboard Backend       │
      │  http://192.168.1.249... │
      └──────────┬───────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │  Backend API             │
      │  /api/overlay/trigger    │
      └──────────┬───────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │  Frontend polls status   │
      │  Sees active overlay     │
      └──────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  🎥 Ring Overlay Appears!      │
    │  Shows live camera feed        │
    │  Auto-dismiss after 60s        │
    └────────────────────────────────┘
```

---

## 🎛️ Customization Options

### Change Duration

In the REST command payload, change `duration`:
- `30000` = 30 seconds
- `60000` = 60 seconds (1 minute)
- `120000` = 2 minutes

### Use Different Camera

Change `cameraEntityId` in the payload:
```yaml
"cameraEntityId": "camera.driveway_live_view"
```

### Add Motion Detection Automation

Create a second automation:
- Trigger: `binary_sensor.front_door_motion` changes to `on`
- Action: Same `rest_command.trigger_wallboard_overlay`

---

## 🐛 Troubleshooting

### Overlay doesn't appear

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check frontend is open:**
   - Open http://localhost:5173
   - Keep this browser tab open and visible

3. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/overlay/trigger \
     -H "Content-Type: application/json" \
     -d '{"cameraEntityId":"camera.front_door_live_view","duration":10000}'
   ```

4. **Check Home Assistant logs:**
   ```bash
   docker logs -f homeassistant
   ```

### Camera shows loading forever

- Ring cameras can take 5-10 seconds to "wake up" and start streaming
- The snapshot refreshes every 1 second, so it will appear jerky (this is normal)
- For better quality, Ring would need WebRTC support (complex setup)

### Home Assistant can't reach wallboard

- Make sure your Mac's firewall allows incoming connections on port 3000
- Verify Mac's IP hasn't changed: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Update the REST command URL if IP changed

---

## 🚀 What's Next?

### Option 1: Keep Running on Mac
- Home Assistant stays on your Mac in Docker
- Wallboard will also run on Mac (or move to Pi)
- Works great for testing!

### Option 2: Move Home Assistant to Dedicated Hardware
Once you're happy with the setup, you can move Home Assistant to:
- **Separate Raspberry Pi** (Pi 4 with 4GB+ RAM recommended)
- **Old laptop or mini PC** (even better performance)
- **Dedicated NUC or server**

**Benefits:**
- Always on, doesn't use Mac resources
- Can place closer to your network/devices
- More reliable for home automation

**When you move it:**
1. Backup Home Assistant config: `~/homeassistant`
2. Install Home Assistant on new device
3. Restore config
4. Update REST command URL to new IP

### Option 3: Deploy Wallboard to Raspberry Pi
Follow the deployment guide in `pi-setup/README.md` when ready!

---

## 📝 Quick Reference

### Start Everything

```bash
# Start Home Assistant
docker start homeassistant

# Start Wallboard Backend
cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard/backend"
npm run dev

# Start Wallboard Frontend
cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard/frontend"
npm run dev
```

### Test Overlay

```bash
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":30000}'
```

### View Logs

```bash
# Home Assistant logs
docker logs -f homeassistant

# Backend logs (running in background)
# Just look at the terminal where you ran npm run dev
```

### Stop Everything

```bash
# Stop Home Assistant
docker stop homeassistant

# Stop backend/frontend
# Press Ctrl+C in their terminal windows
# Or: pkill -f "Family Wallboard"
```

---

## 🎯 Current Status: READY TO TEST!

Everything is configured and ready. Just:

1. **Make sure everything is running:**
   - Home Assistant: `docker ps | grep homeassistant`
   - Backend: `curl http://localhost:3000/api/health`
   - Frontend: Open http://localhost:5173

2. **Test the overlay:**
   ```bash
   curl -X POST http://localhost:3000/api/overlay/trigger \
     -H "Content-Type: application/json" \
     -d '{"cameraEntityId":"camera.front_door_live_view","duration":30000}'
   ```

3. **Watch your wallboard** - the overlay should pop up!

4. **Set up the automation** following the steps above

5. **Ring your doorbell!** 🎉

---

Need help? Check `RING_OVERLAY_SETUP.md` for more detailed troubleshooting!

