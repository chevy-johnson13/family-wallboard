# Home Assistant + Ring Integration Setup

This guide will help you integrate your Ring doorbell with the Family Wallboard so that when someone rings the doorbell, the camera feed automatically pops up on your wallboard display.

## Prerequisites

- ✅ Home Assistant installed and running
- ✅ Ring doorbell already set up and working
- ✅ Family Wallboard running on your Raspberry Pi (or accessible on your network)

---

## Step 1: Install Ring Integration in Home Assistant

### Option A: Via Home Assistant UI (Recommended)

1. Open Home Assistant in your browser
2. Go to **Settings** → **Devices & Services**
3. Click **"+ ADD INTEGRATION"** (bottom right)
4. Search for **"Ring"**
5. Click on **Ring** and follow the setup wizard
6. Log in with your Ring account credentials
7. Complete the two-factor authentication

### Option B: Via Configuration Files

Add to your `configuration.yaml`:

```yaml
ring:
  username: YOUR_RING_EMAIL
  password: YOUR_RING_PASSWORD
```

Then restart Home Assistant.

---

## Step 2: Find Your Ring Camera Entity ID

1. In Home Assistant, go to **Settings** → **Devices & Services**
2. Click on **Ring**
3. Find your doorbell camera - it should be named something like:
   - `camera.front_door`
   - `camera.ring_front_door`
   - `camera.doorbell`

4. Also find the doorbell button sensor (for detecting rings):
   - `binary_sensor.front_door_ding`
   - `binary_sensor.ring_front_door_button`

**Write these down - you'll need them!**

---

## Step 3: Configure Your Wallboard Backend

Edit your wallboard's `.env` file on the Raspberry Pi:

```bash
# On your Raspberry Pi
cd ~/family-wallboard/backend
nano .env
```

Update these values:

```bash
# Home Assistant Configuration
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your_long_lived_access_token_here
RING_CAMERA_ENTITY_ID=camera.ring_front_door
```

### Getting Your Home Assistant Long-Lived Access Token

1. In Home Assistant, click your **profile icon** (bottom left)
2. Scroll down to **"Long-Lived Access Tokens"**
3. Click **"CREATE TOKEN"**
4. Give it a name like **"Family Wallboard"**
5. Copy the token (it's a long string like `eyJ0eXAiOiJKV1QiLCJhbG...`)
6. Paste it into your `.env` file as `HOME_ASSISTANT_TOKEN`

**⚠️ Important:** Save this token - you won't be able to see it again!

---

## Step 4: Add REST Command to Home Assistant

This allows Home Assistant to trigger the overlay on your wallboard.

Edit your Home Assistant `configuration.yaml`:

```yaml
rest_command:
  trigger_wallboard_overlay:
    url: "http://WALLBOARD_IP_OR_HOSTNAME:3000/api/overlay/trigger"
    method: POST
    content_type: "application/json"
    payload: |
      {
        "duration": 60000
      }
```

**Replace `WALLBOARD_IP_OR_HOSTNAME` with:**
- Your Raspberry Pi's IP address (e.g., `192.168.1.100`)
- Or hostname (e.g., `familywallboard.local`)

**Restart Home Assistant** after adding this.

---

## Step 5: Create Home Assistant Automation

This automation detects when someone rings the doorbell and triggers the wallboard overlay.

### Option A: Via Home Assistant UI (Easier)

1. Go to **Settings** → **Automations & Scenes**
2. Click **"+ CREATE AUTOMATION"**
3. Click **"START WITH AN EMPTY AUTOMATION"**

**Configure the automation:**

**Name:** Family Wallboard - Ring Doorbell Alert

**Trigger:**
- Type: **State**
- Entity: `binary_sensor.front_door_ding` (or your doorbell button sensor)
- To: **on**

**Action:**
- Type: **Call service**
- Service: **RESTful Command: trigger_wallboard_overlay**

4. Click **SAVE**

### Option B: Via YAML Configuration

Add to your `automations.yaml` (or in the UI, switch to YAML mode):

```yaml
- id: family_wallboard_ring_alert
  alias: "Family Wallboard - Ring Doorbell Alert"
  description: "Show Ring camera on wallboard when doorbell is pressed"
  
  trigger:
    - platform: state
      entity_id: binary_sensor.front_door_ding
      to: "on"
  
  action:
    - service: rest_command.trigger_wallboard_overlay
      data: {}
  
  mode: single
```

**Important:** Replace `binary_sensor.front_door_ding` with your actual Ring doorbell button entity ID!

---

## Step 6: Test the Integration

### Test 1: Check Home Assistant Connection

On your Raspberry Pi, test if the wallboard can reach Home Assistant:

```bash
curl -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN" \
  http://homeassistant.local:8123/api/camera_proxy/camera.ring_front_door
```

You should see image data or a successful response.

### Test 2: Manually Trigger the Overlay

In Home Assistant:

1. Go to **Developer Tools** → **Services**
2. Select **RESTful Command: trigger_wallboard_overlay**
3. Click **CALL SERVICE**

You should see the Ring camera pop up on your wallboard for 60 seconds!

### Test 3: Ring Your Doorbell

Ring your actual doorbell and watch the magic happen! 🔔

The camera feed should automatically appear on your wallboard display.

---

## Configuration Options

### Adjust Overlay Duration

In the REST command configuration, change the `duration` value (in milliseconds):

```yaml
payload: |
  {
    "duration": 30000    # 30 seconds
  }
```

Or

```yaml
payload: |
  {
    "duration": 120000   # 2 minutes
  }
```

### Multiple Cameras

If you have multiple Ring cameras (front door, back door, etc.), create separate automations:

```yaml
# Front Door
- id: wallboard_front_door_ring
  alias: "Wallboard - Front Door Ring"
  trigger:
    - platform: state
      entity_id: binary_sensor.front_door_ding
      to: "on"
  action:
    - service: rest_command.trigger_wallboard_overlay
      data:
        cameraEntityId: "camera.ring_front_door"
        duration: 60000

# Back Door
- id: wallboard_back_door_ring
  alias: "Wallboard - Back Door Ring"
  trigger:
    - platform: state
      entity_id: binary_sensor.back_door_ding
      to: "on"
  action:
    - service: rest_command.trigger_wallboard_overlay
      data:
        cameraEntityId: "camera.ring_back_door"
        duration: 60000
```

---

## Troubleshooting

### Camera feed doesn't show up

1. **Check the backend logs:**
   ```bash
   sudo journalctl -u family-wallboard.service -f
   ```

2. **Verify Home Assistant URL and token are correct** in `.env` file

3. **Check if camera entity ID is correct:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://homeassistant.local:8123/api/states/camera.ring_front_door
   ```

### Automation doesn't trigger

1. **Check the automation in Home Assistant:**
   - Go to Settings → Automations & Scenes
   - Find your automation
   - Click "RUN" to test manually

2. **Check the entity ID** of your Ring button sensor:
   - Go to Developer Tools → States
   - Search for "ring" or "ding"
   - Verify the exact entity ID

3. **Check Home Assistant logs:**
   - Settings → System → Logs

### Overlay appears but no video

1. The Ring camera might be in privacy mode
2. Check network connectivity between Pi and Home Assistant
3. Try accessing the camera directly in Home Assistant to verify it's working

---

## Security Notes

- ✅ Keep your `.env` file secure - it contains sensitive tokens
- ✅ Use a long-lived token specifically for the wallboard
- ✅ If you expose Home Assistant to the internet, use HTTPS
- ✅ Consider using a local network connection between wallboard and Home Assistant

---

## Optional: Motion Detection

You can also trigger the overlay on motion detection (not just doorbell rings):

```yaml
- id: wallboard_motion_alert
  alias: "Wallboard - Front Door Motion"
  trigger:
    - platform: state
      entity_id: binary_sensor.front_door_motion
      to: "on"
  action:
    - service: rest_command.trigger_wallboard_overlay
      data: {}
```

---

## What Happens When Someone Rings the Doorbell

1. 🔔 Someone presses your Ring doorbell
2. ⚡ Ring sends signal to Home Assistant
3. 🏠 Home Assistant detects the button press
4. 📡 Home Assistant calls your wallboard API
5. 📺 Wallboard displays the Ring camera feed in a picture-in-picture overlay
6. ⏱️ After 60 seconds (or your configured duration), the overlay automatically closes
7. 👍 You can manually close it anytime by tapping the X button

---

## Next Steps

Once everything is working:
- ✅ Fine-tune the overlay duration to your preference
- ✅ Consider adding motion detection triggers
- ✅ Set up multiple cameras if you have them
- ✅ Customize the overlay appearance (edit `frontend/src/components/RingOverlay.tsx`)

Enjoy your integrated smart home wallboard! 🏠🔔✨

