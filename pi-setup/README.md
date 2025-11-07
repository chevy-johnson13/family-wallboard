# Raspberry Pi Setup Guide

This guide will walk you through setting up your Family Wallboard on a Raspberry Pi with a touchscreen display.

## Hardware Requirements

- **Raspberry Pi 4 or 5** (4GB RAM recommended)
- **Official Raspberry Pi Touchscreen Display** (7" or 10")
  - 7": https://www.raspberrypi.com/products/raspberry-pi-touch-display/
  - Or any HDMI touchscreen display
- **microSD card** (16GB minimum, 32GB+ recommended)
- **Power supply** (Official Raspberry Pi power supply recommended)
- **Case** (optional but recommended)

## Software Setup

### 1. Install Raspberry Pi OS

1. Download **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
2. Insert your microSD card
3. In Raspberry Pi Imager:
   - Choose OS: **Raspberry Pi OS (64-bit)** with desktop
   - Choose Storage: Your microSD card
   - Click the gear icon ⚙️ for advanced options:
     - Set hostname: `familywallboard`
     - Enable SSH
     - Set username/password
     - Configure WiFi
   - Click **Write**

4. Insert the microSD card into your Raspberry Pi and boot it up

### 2. Initial Raspberry Pi Configuration

SSH into your Pi or open a terminal:

```bash
ssh pi@familywallboard.local
# Or use the username you set during imaging
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Dependencies

Run the automated setup script:

```bash
cd ~
# Copy the setup script to your Pi first, then:
chmod +x setup-pi.sh
./setup-pi.sh
```

Or manually install:

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install other dependencies
sudo apt install -y \
  chromium \
  unclutter \
  xdotool \
  git

# Verify installations
node --version  # Should be v20.x
npm --version
```

### 4. Deploy the Application

#### Option A: Using the deployment script (Recommended)

On your development machine:

```bash
cd "Family Wallboard"
chmod +x pi-setup/deploy.sh
./pi-setup/deploy.sh pi@familywallboard.local
```

#### Option B: Manual deployment

On your development machine:

```bash
# Build the frontend
cd frontend
npm run build

# Copy files to Pi
scp -r ../backend pi@familywallboard.local:~/family-wallboard/
scp -r dist pi@familywallboard.local:~/family-wallboard/frontend/
```

On the Raspberry Pi:

```bash
cd ~/family-wallboard/backend
npm install --production
```

### 5. Configure Environment Variables

On the Raspberry Pi:

```bash
cd ~/family-wallboard/backend
nano .env
```

Add your configuration:

```bash
PORT=3000
NODE_ENV=production  # ⚠️ MUST be 'production' for frontend to be served!

# Calendar ICS URLs (get from your calendar providers)
CALENDAR_PERSON1_ICS_URL=https://calendar.google.com/calendar/ical/...
CALENDAR_PERSON1_COLOR=#3B82F6
CALENDAR_PERSON1_NAME=Person 1

CALENDAR_PERSON2_ICS_URL=https://calendar.google.com/calendar/ical/...
CALENDAR_PERSON2_COLOR=#EC4899
CALENDAR_PERSON2_NAME=Person 2

CALENDAR_CHILD_ICS_URL=https://calendar.google.com/calendar/ical/...
CALENDAR_CHILD_COLOR=#10B981
CALENDAR_CHILD_NAME=Child

# Todoist API (get from https://todoist.com/prefs/integrations)
TODOIST_API_TOKEN=your_token_here
TODOIST_PROJECT_ID=your_project_id

# Home Assistant (for Ring integration)
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your_token_here
RING_CAMERA_ENTITY_ID=camera.ring_front_door
```

Save and exit (Ctrl+X, Y, Enter)

### 6. Set Up Auto-Start

Copy the systemd service file:

```bash
sudo cp ~/family-wallboard/pi-setup/family-wallboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable family-wallboard.service
sudo systemctl start family-wallboard.service
```

Check status:

```bash
sudo systemctl status family-wallboard.service
```

### 7. Configure Kiosk Mode

Copy the autostart file:

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
cp ~/family-wallboard/pi-setup/autostart ~/.config/lxsession/LXDE-pi/autostart
```

Or manually create `~/.config/lxsession/LXDE-pi/autostart`:

```bash
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Disable screen blanking
@xset s off
@xset -dpms
@xset s noblank

# Hide mouse cursor when idle
@unclutter -idle 0.1 -root

# Wait for backend to start, then launch Chromium in kiosk mode
@bash -c "sleep 10 && chromium --kiosk --noerrdialogs --disable-infobars --no-first-run --enable-features=OverlayScrollbar --start-fullscreen 'http://localhost:3000'"
```

### 8. Disable Screen Blanking

Edit the lightdm configuration:

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Under `[Seat:*]` section, add:

```
xserver-command=X -s 0 -dpms
```

### 9. Configure Screen Rotation (if needed)

If you need to rotate the display:

```bash
sudo nano /boot/config.txt
```

Add (for 90-degree rotation):

```
display_rotate=1
```

Options: 0=normal, 1=90°, 2=180°, 3=270°

### 10. Reboot

```bash
sudo reboot
```

The wallboard should start automatically in fullscreen kiosk mode!

## Getting Calendar ICS URLs

### Google Calendar

1. Go to https://calendar.google.com
2. Click the three dots next to your calendar
3. Click "Settings and sharing"
4. Scroll down to "Integrate calendar"
5. Copy the "Secret address in iCalendar format"

### Outlook/Office 365

1. Go to Outlook Calendar
2. Click the calendar settings gear icon
3. Click "View all Outlook settings"
4. Go to "Calendar" > "Shared calendars"
5. Under "Publish a calendar", select your calendar
6. Click "Publish"
7. Copy the ICS link

### iCloud Calendar

1. Go to iCloud.com and open Calendar
2. Click the share icon next to your calendar
3. Enable "Public Calendar"
4. Copy the webcal:// link
5. Replace `webcal://` with `https://`

## Getting Todoist API Token

1. Go to https://todoist.com/prefs/integrations
2. Scroll down to "API token"
3. Copy your token
4. To get Project ID:
   - Open your family project in Todoist
   - Look at the URL: `https://todoist.com/app/project/XXXXXXXX`
   - The number is your project ID

## Home Assistant Setup (Ring Integration)

### 1. Install Ring Integration

In Home Assistant:
1. Go to Settings > Devices & Services
2. Click "+ Add Integration"
3. Search for "Ring"
4. Follow the setup wizard

### 2. Create Automation

Create a new automation in Home Assistant:

```yaml
alias: Family Wallboard - Ring Doorbell Alert
description: Show Ring camera on wallboard when doorbell pressed
trigger:
  - platform: state
    entity_id: binary_sensor.front_door_ding
    to: "on"
action:
  - service: rest_command.trigger_wallboard_overlay
    data: {}
mode: single
```

### 3. Add REST Command

In `configuration.yaml`:

```yaml
rest_command:
  trigger_wallboard_overlay:
    url: "http://familywallboard.local:3000/api/overlay/trigger"
    method: POST
    content_type: "application/json"
    payload: '{}'
```

Restart Home Assistant.

## Alexa Integration for Voice Tasks

### Option 1: Todoist Alexa Skill (Recommended)

1. In the Alexa app, go to Skills & Games
2. Search for "Todoist"
3. Enable the skill and link your Todoist account
4. Say: "Alexa, ask Todoist to add buy diapers to my list"

Tasks will automatically sync to your wallboard!

### Option 2: Custom Webhook (Advanced)

Create an Alexa routine that calls a webhook to your backend's `/api/tasks` endpoint.

## Troubleshooting

### Chromium doesn't start in kiosk mode

Check the backend is running:
```bash
sudo systemctl status family-wallboard.service
curl http://localhost:3000/api/health
```

### Screen blanks after inactivity

Make sure you completed step 8 (disable screen blanking).

### Touch not working

Install touch drivers:
```bash
sudo apt install -y xserver-xorg-input-evdev
```

### Backend won't start

Check logs:
```bash
sudo journalctl -u family-wallboard.service -f
```

### Calendar events not showing

1. Verify your ICS URLs are correct and accessible
2. Check backend logs: `sudo journalctl -u family-wallboard.service -f`
3. Test the API: `curl http://localhost:3000/api/calendar/events`

## Maintenance

### Update the application

```bash
cd ~/family-wallboard
git pull  # If using git
sudo systemctl restart family-wallboard.service
# Refresh the browser (Ctrl+R) or reboot
```

### View logs

```bash
sudo journalctl -u family-wallboard.service -f
```

### Restart services

```bash
sudo systemctl restart family-wallboard.service
```

### Remote access

You can SSH into your Pi to make changes:

```bash
ssh pi@familywallboard.local
```

Or use VNC (enable in `sudo raspi-config` > Interface Options > VNC).

## Tips

- **Wall mounting**: Use a sturdy mount designed for your display size
- **Power**: Use the official Raspberry Pi power supply to avoid issues
- **Network**: Consider using Ethernet for more reliable connectivity
- **Backup**: Keep a backup image of your SD card once everything is working
- **Updates**: Regularly update the system: `sudo apt update && sudo apt upgrade`

## Support

For issues or questions:
- Check the logs first
- Ensure all services are running
- Verify network connectivity
- Test API endpoints manually

Enjoy your Family Wallboard! 🏠📅✨

