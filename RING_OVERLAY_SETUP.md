# Ring Overlay Setup Guide

## ✅ What's Already Done
- ✅ Home Assistant installed and running on Docker
- ✅ Ring integration added to Home Assistant
- ✅ Backend configured with Home Assistant token and camera entity
- ✅ Ring camera entities identified:
  - `camera.front_door_live_view`
  - `camera.driveway_live_view`

---

## 🎯 Next Steps: Add Home Assistant Automation

### Step 1: Find Your Doorbell Button Entity

In Home Assistant:
1. Go to **Settings** → **Devices & Services**
2. Click on **Ring**
3. Click on your **Front Door** device
4. Look for a **binary sensor** that ends in `_ding` or `_button`
   - Common names: `binary_sensor.front_door_ding`, `binary_sensor.front_door_button`

**Write down this entity ID!**

---

### Step 2: Add REST Command to Home Assistant

**Option A: Edit YAML files (Advanced)**

1. Access your Home Assistant config folder:
   ```bash
   cd ~/homeassistant
   ```

2. Edit `configuration.yaml`:
   ```bash
   nano configuration.yaml
   ```

3. Add this at the bottom:
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

4. Save and restart Home Assistant:
   - Go to **Developer Tools** → **YAML** → **Check Configuration**
   - Click **Restart**

**Option B: Use Home Assistant UI (Easier)**

Unfortunately, REST commands must be added via YAML. Follow Option A above.

---

### Step 3: Create the Automation

**In Home Assistant:**

1. Go to **Settings** → **Automations & Scenes**
2. Click **"+ Create Automation"**
3. Click **"Start with an empty automation"**

**Set up the automation:**

#### Trigger:
- **Trigger type**: State
- **Entity**: `binary_sensor.front_door_ding` (or whatever you found in Step 1)
- **To**: `on`

#### Action:
- **Action type**: Call service
- **Service**: `rest_command.trigger_wallboard_overlay`
- Leave "Service data" empty

#### Save:
- **Name**: "Wallboard - Ring Doorbell Alert"
- Click **Save**

---

### Step 4: Test the Ring Overlay

**Option 1: Press Your Physical Doorbell**
- Go outside and press your Ring doorbell
- Watch your wallboard at http://localhost:5173
- You should see the camera feed pop up in picture-in-picture mode!

**Option 2: Manually Test via Home Assistant**
1. In Home Assistant, go to **Developer Tools** → **Services**
2. Service: `rest_command.trigger_wallboard_overlay`
3. Click **"Call Service"**
4. Check your wallboard - the overlay should appear!

**Option 3: Test via Command Line**
```bash
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":60000}'
```

---

## 🎨 How the Ring Overlay Works

When someone rings your doorbell:
1. **Ring** detects the button press
2. **Home Assistant** receives the Ring event
3. **Automation** triggers and calls your wallboard API
4. **Wallboard backend** receives the trigger request
5. **Wallboard frontend** shows camera feed in picture-in-picture mode for 60 seconds
6. **Auto-dismiss** after 60 seconds, or click the X to close early

---

## 📋 Camera Entity Reference

You have two Ring cameras:
- **Front Door**: `camera.front_door_live_view` (configured as default)
- **Driveway**: `camera.driveway_live_view`

To show the **driveway** camera instead, change the payload:
```yaml
payload: |
  {
    "cameraEntityId": "camera.driveway_live_view",
    "duration": 60000
  }
```

---

## 🐛 Troubleshooting

### Overlay doesn't appear when doorbell is pressed

1. **Check the automation ran:**
   - Home Assistant → Settings → Automations
   - Find "Wallboard - Ring Doorbell Alert"
   - Check "Last Triggered" time

2. **Check backend logs:**
   ```bash
   # Backend should show: "Overlay trigger received"
   ```

3. **Test the API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/overlay/trigger \
     -H "Content-Type: application/json" \
     -d '{"cameraEntityId":"camera.front_door_live_view","duration":60000}'
   ```

4. **Check browser console:**
   - Open http://localhost:5173
   - Press F12 → Console tab
   - Look for errors

### Camera feed shows "No stream available"

- Home Assistant might not have streaming enabled
- Go to Home Assistant → Settings → System → Network
- Make sure "Home Assistant URL" is set correctly

### Home Assistant can't reach the wallboard

- Make sure your Mac's firewall allows connections on port 3000
- Verify both are on the same network
- Try the IP address instead of hostname

---

## 🚀 Next Steps

Once this is working on your Mac:
- You can decide if you want to move Home Assistant to dedicated hardware (separate Pi, old laptop, etc.)
- When you deploy to a Raspberry Pi, update the REST command URL to use the Pi's IP
- Everything else will work the same!

---

## 📝 Quick Command Reference

```bash
# Start Home Assistant
docker start homeassistant

# Stop Home Assistant
docker stop homeassistant

# View Home Assistant logs
docker logs -f homeassistant

# Restart backend (if you change .env)
cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard/backend"
npm run dev

# Test overlay API
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":60000}'
```

