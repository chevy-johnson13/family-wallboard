# Home Assistant Configuration Examples

This directory contains example configuration files for integrating your Ring doorbell with the Family Wallboard.

## Files

- **`rest_command.yaml`** - REST command to trigger the wallboard overlay
- **`automation.yaml`** - Automation to detect doorbell presses and trigger the overlay

## Quick Start

### 1. Find Your Entity IDs

In Home Assistant:
1. Go to **Developer Tools** → **States**
2. Search for "ring" to find your devices
3. Look for entities like:
   - `camera.ring_front_door` (camera)
   - `binary_sensor.front_door_ding` (doorbell button)
   - `binary_sensor.front_door_motion` (motion sensor)

### 2. Update Configuration Files

Open each example file and replace:
- `familywallboard.local` with your Raspberry Pi's IP or hostname
- `binary_sensor.front_door_ding` with your actual doorbell button entity ID
- `camera.ring_front_door` with your actual camera entity ID

### 3. Add to Home Assistant

#### Option A: Via configuration.yaml

Add the contents of `rest_command.yaml` to your `configuration.yaml`:

```yaml
# Add this section
rest_command:
  trigger_wallboard_overlay:
    url: "http://YOUR_PI_IP:3000/api/overlay/trigger"
    # ... rest of the config
```

#### Option B: Via Home Assistant UI

1. Go to **Settings** → **Automations & Scenes**
2. Click **"+ CREATE AUTOMATION"**
3. Switch to **YAML mode**
4. Copy and paste from `automation.yaml`

### 4. Restart Home Assistant

After adding the REST command to `configuration.yaml`, restart Home Assistant.

### 5. Test It!

#### Test the REST Command:
1. Go to **Developer Tools** → **Services**
2. Select **RESTful Command: trigger_wallboard_overlay**
3. Click **CALL SERVICE**
4. The Ring camera should appear on your wallboard!

#### Test the Automation:
1. Ring your doorbell
2. Watch the wallboard automatically display the camera feed!

## Customization

### Change Overlay Duration

In `rest_command.yaml`, modify the `duration` value:

```yaml
payload: |
  {
    "duration": 30000    # 30 seconds
  }
```

### Add Multiple Cameras

Copy the automation template and change the entity IDs for each camera.

### Trigger on Motion Instead

Use `binary_sensor.front_door_motion` instead of the ding sensor.

## Troubleshooting

See the main [HOME_ASSISTANT_SETUP.md](../HOME_ASSISTANT_SETUP.md) for detailed troubleshooting steps.

## Support

If you encounter issues:
1. Check Home Assistant logs (Settings → System → Logs)
2. Check wallboard backend logs: `sudo journalctl -u family-wallboard.service -f`
3. Verify network connectivity between Pi and Home Assistant

