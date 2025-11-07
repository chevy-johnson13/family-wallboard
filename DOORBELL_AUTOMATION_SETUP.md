# 🔔 Doorbell Automation Setup Guide

## What We're Setting Up

When someone presses your Ring doorbell, Home Assistant will automatically:
1. Detect the doorbell press
2. Call your wallboard backend
3. Show the camera notification overlay
4. You click the button to view the live feed

---

## Step 1: Add REST Command to Home Assistant

### Option A: Using Home Assistant UI (Recommended)

1. **Open Home Assistant**: http://localhost:8123
2. **Go to Settings** → **Devices & Services** → **Helpers**
3. **Create a new helper**:
   - Type: RESTful Command
   - Name: `trigger_wallboard_overlay`
   - URL: `http://host.docker.internal:3000/api/overlay/trigger`
   - Method: `POST`
   - Content Type: `application/json`
   - Payload:
   ```json
   {
     "cameraEntityId": "camera.front_door_live_view",
     "duration": 60000
   }
   ```

> **Note**: We use `host.docker.internal` because Home Assistant is running in Docker and needs to reach your Mac's localhost.

### Option B: Using YAML Configuration

1. **Edit Home Assistant configuration**:
   ```bash
   # Find your Home Assistant config directory
   # Usually: ~/homeassistant/ or ~/.homeassistant/
   ```

2. **Add to `configuration.yaml`**:
   ```yaml
   rest_command:
     trigger_wallboard_overlay:
       url: "http://host.docker.internal:3000/api/overlay/trigger"
       method: POST
       content_type: "application/json"
       payload: |
         {
           "cameraEntityId": "camera.front_door_live_view",
           "duration": 60000
         }
   ```

3. **Restart Home Assistant**:
   - Settings → System → Restart

---

## Step 2: Create the Automation

### Find Your Doorbell Entity

First, let's find your doorbell's entity ID:

1. **Go to Developer Tools** → **States**
2. **Search for**: `front_door` or `ding`
3. **Look for entities like**:
   - `binary_sensor.front_door_ding`
   - `binary_sensor.front_door_motion`
   - `button.front_door_ding`

### Create the Automation (UI Method)

1. **Go to Settings** → **Automations & Scenes**
2. **Click**: "+ Create Automation"
3. **Choose**: "Create new automation"
4. **Configure**:

   **Name**: `Ring Doorbell → Family Wallboard`

   **Trigger**:
   - Type: `State`
   - Entity: `binary_sensor.front_door_ding` (or your doorbell entity)
   - From: `off`
   - To: `on`

   **Action**:
   - Type: `Call service`
   - Service: `rest_command.trigger_wallboard_overlay`

5. **Save**!

### Create the Automation (YAML Method)

Add to `automations.yaml`:

```yaml
- id: ring_doorbell_wallboard
  alias: "Ring Doorbell → Family Wallboard"
  description: "Show camera overlay on wallboard when doorbell is pressed"
  
  trigger:
    - platform: state
      entity_id: binary_sensor.front_door_ding
      from: "off"
      to: "on"
  
  action:
    - service: rest_command.trigger_wallboard_overlay
      data: {}
  
  mode: single
```

---

## Step 3: Test It!

### Test via Home Assistant Developer Tools

1. **Go to Developer Tools** → **Services**
2. **Service**: `rest_command.trigger_wallboard_overlay`
3. **Click**: "Call Service"
4. **Check your wallboard**: You should see the camera notification!

### Test with Real Doorbell

1. **Press your Ring doorbell**
2. **Watch the wallboard**: Notification should appear within 2-3 seconds
3. **Click**: "Open Home Assistant →"
4. **View**: Live camera feed!

---

## Troubleshooting

### "REST command not found"
- Make sure you've restarted Home Assistant after adding the `rest_command`
- Check Settings → System → Logs for errors

### "Overlay doesn't appear"
- Check that backend is running: `curl http://localhost:3000/api/health`
- Check Docker networking: `curl http://host.docker.internal:3000/api/health`
- Check Home Assistant logs for REST call errors

### "Can't find doorbell entity"
**Try these commands to find it**:
1. Go to your Front Door device in Home Assistant
2. Look at all the entities listed
3. Common entity IDs:
   - `binary_sensor.front_door_ding`
   - `binary_sensor.front_door_button`
   - `button.front_door_ding`

**Still can't find it?**
Run this command to list all Ring entities:

1. **Developer Tools** → **States**
2. **Filter**: Type "front" or "door"
3. Look for any entity that shows "on" when you press the doorbell

---

## Advanced: Multi-Camera Support

Want to trigger different cameras for different doorbells?

**Create separate automations**:

```yaml
# Front Door Doorbell
- id: ring_front_door_wallboard
  alias: "Front Door → Wallboard"
  trigger:
    - platform: state
      entity_id: binary_sensor.front_door_ding
      to: "on"
  action:
    - service: rest_command.trigger_front_door_camera

# Driveway Motion
- id: ring_driveway_wallboard
  alias: "Driveway Motion → Wallboard"
  trigger:
    - platform: state
      entity_id: binary_sensor.driveway_motion
      to: "on"
  action:
    - service: rest_command.trigger_driveway_camera
```

**Add corresponding REST commands**:

```yaml
rest_command:
  trigger_front_door_camera:
    url: "http://host.docker.internal:3000/api/overlay/trigger"
    method: POST
    content_type: "application/json"
    payload: '{"cameraEntityId":"camera.front_door_live_view","duration":60000}'
  
  trigger_driveway_camera:
    url: "http://host.docker.internal:3000/api/overlay/trigger"
    method: POST
    content_type: "application/json"
    payload: '{"cameraEntityId":"camera.driveway_live_view","duration":60000}'
```

---

## Quick Commands

**Test overlay from terminal**:
```bash
curl -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":60000}'
```

**Check Home Assistant logs**:
- Settings → System → Logs
- Filter for "rest_command" or "error"

**Restart Home Assistant**:
- Settings → System → Restart

---

## What's Next?

After you've got the doorbell working:
- ✅ Add motion detection automations
- ✅ Add driveway camera triggers
- ✅ Customize notification duration
- ✅ Deploy to your Raspberry Pi!

---

Good luck! Press your doorbell and watch the magic happen! 🎉

