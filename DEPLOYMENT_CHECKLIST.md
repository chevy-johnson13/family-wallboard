# Family Wallboard - Deployment Checklist

Use this checklist when setting up your Family Wallboard on the Raspberry Pi.

## ✅ Hardware Checklist

- [ ] Raspberry Pi 4 or 5 (4GB+ RAM recommended)
- [ ] Official Raspberry Pi touchscreen (7" or 10") or HDMI display
- [ ] microSD card (32GB+ recommended)
- [ ] Official Raspberry Pi power supply
- [ ] (Optional) Wall mount for display

## ✅ Software Setup

### 1. Raspberry Pi OS Installation

- [ ] Download and install Raspberry Pi OS using Raspberry Pi Imager
- [ ] Enable SSH during imaging
- [ ] Set up WiFi credentials during imaging
- [ ] Set hostname to `familywallboard`

### 2. Initial Pi Configuration

```bash
# On the Raspberry Pi
sudo apt update && sudo apt upgrade -y
```

- [ ] Run the setup script: `./pi-setup/setup-pi.sh`
- [ ] Or manually install: Node.js, Chromium, unclutter, xdotool

### 3. Deploy Application

**Option A:** Use deployment script (from your laptop):
```bash
./pi-setup/deploy.sh pi@familywallboard.local
```

**Option B:** Manual deployment (copy files to Pi)

### 4. Configure Environment

- [ ] SSH to Pi: `ssh pi@familywallboard.local`
- [ ] Navigate to: `cd ~/family-wallboard/backend`
- [ ] Create `.env` from template: `cp ENV_SETUP.txt .env`
- [ ] Edit `.env`: `nano .env`

## ✅ Configuration

### Calendar Setup

- [ ] Get Outlook calendar ICS URL (yours)
- [ ] Get iCloud calendar ICS URL (yours) - optional
- [ ] Get Outlook calendar ICS URL (wife's) - optional  
- [ ] Get iCloud calendar ICS URL (wife's) - optional
- [ ] Add all URLs to `.env` file
- [ ] Set calendar colors and names

**Current configured calendars:**
- ✅ Chevon (Outlook) - Blue (#3B82F6)
- ⏳ Chevon (iCloud) - Not configured yet
- ⏳ Wife (Outlook) - Not configured yet
- ⏳ Wife (iCloud) - Not configured yet

### Todoist Setup

- [ ] Create Todoist account (if needed)
- [ ] Create "Family Wallboard" project
- [ ] Get API token from https://todoist.com/prefs/integrations
- [ ] Get project ID from project URL
- [ ] Add both to `.env` file

**Current status:** ✅ Configured with token and project ID

### Home Assistant + Ring Setup

**Only if you have Home Assistant and Ring:**

- [ ] Install Ring integration in Home Assistant
- [ ] Get Home Assistant long-lived access token
- [ ] Find Ring camera entity ID
- [ ] Find Ring doorbell button entity ID
- [ ] Add to wallboard `.env` file
- [ ] Add REST command to Home Assistant (see `home-assistant-examples/rest_command.yaml`)
- [ ] Create automation in Home Assistant (see `home-assistant-examples/automation.yaml`)
- [ ] Test by ringing doorbell

**Documentation:** See `HOME_ASSISTANT_SETUP.md`

## ✅ Pi Services Setup

### Install and Enable Backend Service

```bash
sudo cp ~/family-wallboard/pi-setup/family-wallboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable family-wallboard.service
sudo systemctl start family-wallboard.service
```

- [ ] Copied service file
- [ ] Enabled service
- [ ] Started service
- [ ] Verify status: `sudo systemctl status family-wallboard.service`

### Configure Kiosk Mode

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
cp ~/family-wallboard/pi-setup/autostart ~/.config/lxsession/LXDE-pi/autostart
```

- [ ] Copied autostart file
- [ ] Configured screen blanking disable
- [ ] Set up auto-launch of Chromium in kiosk mode

### Disable Screen Blanking

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Add under `[Seat:*]`:
```
xserver-command=X -s 0 -dpms
```

- [ ] Edited lightdm.conf
- [ ] Added screen blanking disable

## ✅ Testing

### Backend Tests

```bash
# On Pi
curl http://localhost:3000/api/health
curl http://localhost:3000/api/calendar/events
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/meals
```

- [ ] Health check responds
- [ ] Calendar API returns events
- [ ] Tasks API responds
- [ ] Meals API responds

### Frontend Tests

- [ ] Open http://familywallboard.local:3000 in browser
- [ ] All navigation tabs work (Today, Week, Month, Tasks, Meals)
- [ ] Calendar events display correctly
- [ ] Tasks can be added/completed
- [ ] Meals can be edited
- [ ] Touch works (if using touchscreen)

### Integration Tests

- [ ] Add task in Todoist app - appears on wallboard
- [ ] Add task on wallboard - appears in Todoist app
- [ ] Complete task - syncs both ways
- [ ] Calendar auto-refreshes every 5 minutes
- [ ] Night mode activates at 9 PM
- [ ] (If configured) Ring doorbell triggers camera overlay

## ✅ Final Steps

- [ ] Reboot Pi: `sudo reboot`
- [ ] Verify wallboard starts automatically in kiosk mode
- [ ] Mount display on wall (if desired)
- [ ] Position Pi near power outlet
- [ ] Enjoy your Family Wallboard! 🎉

## 📝 Current Configuration Summary

**Calendars:**
- ✅ Chevon's Outlook calendar (work)

**Tasks:**
- ✅ Todoist integration configured

**Meals:**
- ✅ Local meal planner ready

**Ring/Home Assistant:**
- ⏳ Not configured yet (ready to set up)

**Night Mode:**
- ✅ Active 9 PM - 6 AM

## 🔧 Troubleshooting

### Backend won't start
```bash
sudo journalctl -u family-wallboard.service -f
```

### Chromium doesn't launch in kiosk mode
- Check backend is running first
- Increase sleep time in autostart file
- Check for errors in `~/.xsession-errors`

### Touch not working
```bash
sudo apt install xserver-xorg-input-evdev
sudo reboot
```

### Calendar/Tasks not updating
- Check `.env` file for correct tokens and URLs
- Check network connectivity
- Verify API endpoints manually with curl

## 📚 Documentation

- **Main README:** [README.md](README.md)
- **Getting Started:** [GETTING_STARTED.md](GETTING_STARTED.md)
- **Pi Setup Guide:** [pi-setup/README.md](pi-setup/README.md)
- **Home Assistant Setup:** [HOME_ASSISTANT_SETUP.md](HOME_ASSISTANT_SETUP.md)
- **Your PRD:** [Family_Wallboard_PRD.txt](Family_Wallboard_PRD.txt)

---

**Questions or issues?** Review the documentation above or check the troubleshooting sections!

