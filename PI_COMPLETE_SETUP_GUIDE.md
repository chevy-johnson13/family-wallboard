# 🥧 Complete Raspberry Pi Setup Guide

## Overview

This guide will walk you through setting up your Family Wallboard on a Raspberry Pi with a touchscreen display.

---

## Part 1: Hardware Requirements

### What You Need:

✅ **Raspberry Pi** (3B+ or newer recommended)
   - Pi 4 (2GB+ RAM) or Pi 5 is best for smooth performance
   - Pi 3B+ works but may be slightly slower

✅ **Touchscreen Display**
   - Official 7" Raspberry Pi Touch Display (recommended)
   - Or any HDMI touchscreen compatible with Pi

✅ **Power Supply**
   - Official Raspberry Pi power supply (5V 3A for Pi 4/5)
   - Or USB-C power adapter with sufficient amperage

✅ **MicroSD Card**
   - 32GB minimum (64GB recommended)
   - Class 10 or UHS-1 for good performance

✅ **Case** (optional but recommended)
   - Protects Pi and makes mounting easier

---

## Part 2: Software Installation on Pi

### Step 1: Install Raspberry Pi OS

1. **Download Raspberry Pi Imager:**
   - On your Mac: https://www.raspberrypi.com/software/
   - Install and open it

2. **Flash the OS:**
   - Insert microSD card into Mac
   - Open Raspberry Pi Imager
   - Choose: **Raspberry Pi OS (64-bit) with desktop**
   - Select your microSD card
   - Click Settings (⚙️) before writing:
     - Set hostname: `familywallboard`
     - Enable SSH
     - Set username/password: `pi` / `raspberry` (or your preference)
     - Configure WiFi (your network SSID + password)
     - Set timezone: `America/New_York` (Eastern)
   - Click **Write** and wait for completion

3. **Boot the Pi:**
   - Insert microSD into Pi
   - Connect touchscreen (or HDMI monitor + USB mouse for setup)
   - Power on the Pi
   - Wait for first boot (1-2 minutes)

### Step 2: Initial Pi Configuration

SSH into your Pi from your Mac:

```bash
ssh pi@familywallboard.local
# Or: ssh pi@<PI_IP_ADDRESS>
# Password: raspberry (or what you set)
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Required Software

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x

# Install Chromium (web browser for kiosk mode)
sudo apt install -y chromium unclutter

# Install PM2 (process manager to keep apps running)
sudo npm install -g pm2

# Install Git (for version control)
sudo apt install -y git
```

---

## Part 3: Deploy Your Wallboard to Pi

### Option A: Transfer from Mac (Recommended)

On your **Mac**, run:

```bash
cd "/Users/chevon.johnson/Desktop/Personal/Family Wallboard"

# Create deployment package (excludes node_modules, .env, etc.)
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='backend/.env' \
    -czf wallboard-deploy.tar.gz \
    backend/ frontend/ pi-setup/ home-assistant-examples/ \
    *.md *.sh

# Copy to Pi
scp wallboard-deploy.tar.gz pi@familywallboard.local:~/

# Copy your .env file separately (it has your secrets)
scp .env pi@familywallboard.local:~/wallboard.env
```

On your **Pi** (via SSH):

```bash
# Extract the files
cd ~
mkdir -p Family-Wallboard
tar -xzf wallboard-deploy.tar.gz -C Family-Wallboard/
cd Family-Wallboard

# Set up .env file
cp ~/wallboard.env .env

# Install dependencies
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### Option B: Clone from Git (If you're using Git)

```bash
# On the Pi
cd ~
git clone <YOUR_GIT_REPO_URL> Family-Wallboard
cd Family-Wallboard

# Create .env file (copy from your Mac manually)
nano .env
# Paste your environment variables, then Ctrl+X, Y, Enter
```

---

## Part 4: Configure Environment for Pi

Edit your `.env` file on the Pi to update network addresses:

```bash
cd ~/Family-Wallboard/backend
nano .env
```

**Update these values:**

```env
# Server Configuration
PORT=3000
NODE_ENV=production  # ⚠️ MUST be 'production' for frontend to be served!

# Change localhost to your Mac's IP (if HA is still on Mac)
HOME_ASSISTANT_URL=http://YOUR_MAC_IP:8123
# Or if you moved HA to Pi:
# HOME_ASSISTANT_URL=http://localhost:8123

# Backend URL (optional - defaults to localhost:3000)
BACKEND_URL=http://localhost:3000

# Your existing tokens stay the same
HOME_ASSISTANT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RING_CAMERA_ENTITY_ID=camera.front_door_live_view
TODOIST_API_TOKEN=b181cd2de98be7d527d95b768a02992d9cba116b
# ... etc (your calendar URLs, etc.)
```

**⚠️ Critical:** `NODE_ENV=production` is required! Without it, the backend won't serve the frontend and you'll get "Route not found" errors.

Save with `Ctrl+X`, `Y`, `Enter`

---

## Part 5: Build Frontend for Production

```bash
cd ~/Family-Wallboard/frontend
npm run build

# This creates an optimized production build in 'dist/'
# The backend will serve this
```

---

## Part 6: Set Up Backend to Serve Frontend

Update your backend to serve the built frontend:

```bash
cd ~/Family-Wallboard/backend/src
nano index.js
```

Add this **before** the error handler (around line 30):

```javascript
// Serve frontend in production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

---

## Part 7: Start Services with PM2

PM2 will keep your backend running even after reboots.

**⚠️ IMPORTANT:** You must set `NODE_ENV=production` for the backend to serve the frontend. Without this, you'll get "Route not found" errors.

```bash
cd ~/Family-Wallboard/backend

# Start backend with PM2 (with NODE_ENV=production)
NODE_ENV=production pm2 start npm --name "wallboard-backend" -- run start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it gives you (copy/paste the sudo command)

# Check status
pm2 status
```

**Note:** Make sure your `.env` file also has `NODE_ENV=production` set. The backend will only serve the frontend static files when `NODE_ENV=production`.

Your wallboard backend is now running at `http://familywallboard.local:3000`!

---

## Part 8: Set Up Kiosk Mode (Auto-Start Chromium Full-Screen)

### Create Kiosk Start Script

```bash
mkdir -p ~/kiosk
nano ~/kiosk/start-wallboard.sh
```

Paste this:

```bash
#!/bin/bash

# Wait for network
sleep 10

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor after 1 second of inactivity
unclutter -idle 1 &

# Start Chromium in kiosk mode
chromium \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --kiosk \
  --incognito \
  --disable-translate \
  --disable-features=TranslateUI \
  --disable-component-update \
  --check-for-update-interval=604800 \
  --window-position=0,0 \
  --start-fullscreen \
  http://localhost:3000
```

Make it executable:

```bash
chmod +x ~/kiosk/start-wallboard.sh
```

### Configure Autostart

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
nano ~/.config/lxsession/LXDE-pi/autostart
```

Add this:

```
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@point-rpi
@/home/pi/kiosk/start-wallboard.sh
```

Save and exit.

---

## Part 9: Optional - Install Home Assistant on Pi

If you want Home Assistant running on the same Pi:

### Quick Docker Method:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi
newgrp docker

# Run Home Assistant
docker run -d \
  --name homeassistant \
  --restart=unless-stopped \
  --privileged \
  -v /home/pi/homeassistant:/config \
  -v /etc/localtime:/etc/localtime:ro \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable

# Check status
docker ps
```

Home Assistant will be at `http://familywallboard.local:8123`

**Then:**
1. Complete Home Assistant onboarding
2. Install Ring integration (same as before)
3. Create long-lived access token
4. Update `.env` on Pi with new token

---

## Part 10: Testing

### Test Backend:

```bash
# From your Mac
curl http://familywallboard.local:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend:

Open `http://familywallboard.local:3000` in your Mac's browser.

### Test on Pi Display:

Reboot the Pi:

```bash
sudo reboot
```

The wallboard should automatically open in full-screen kiosk mode!

---

## Part 11: Touchscreen Calibration (if needed)

If touch input is misaligned:

```bash
sudo apt install -y xinput-calibrator
DISPLAY=:0 xinput_calibrator
```

Follow on-screen instructions, then save calibration.

---

## Part 12: Useful Commands

### View Backend Logs:
```bash
pm2 logs wallboard-backend
```

### Restart Backend:
```bash
pm2 restart wallboard-backend
```

### Stop Backend:
```bash
pm2 stop wallboard-backend
```

### Update Code:
```bash
cd ~/Family-Wallboard
# Pull latest changes (if using Git)
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart wallboard-backend
```

### Restart Kiosk:
```bash
# Kill Chromium
pkill chromium
# It will auto-restart on next login, or run manually:
~/kiosk/start-wallboard.sh &
```

### Remote Desktop (VNC):
```bash
sudo raspi-config
# Interface Options -> VNC -> Enable
```

Then use VNC Viewer from your Mac: `familywallboard.local`

---

## Part 13: Network Configuration

### Static IP (Recommended):

```bash
sudo nano /etc/dhcpcd.conf
```

Add at the end:

```
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Change IP to match your network. Save and reboot.

---

## Troubleshooting

### Wallboard won't load:
1. Check backend: `pm2 status`
2. Check logs: `pm2 logs wallboard-backend`
3. Test manually: `curl http://localhost:3000/health`

### Touchscreen not working:
1. Check connections
2. Run `xinput list` to see if touch device is detected
3. May need to install touchscreen drivers for your specific model

### Kiosk won't start on boot:
1. Check autostart file: `cat ~/.config/lxsession/LXDE-pi/autostart`
2. Check script permissions: `ls -la ~/kiosk/start-wallboard.sh`
3. View boot logs: `cat ~/.xsession-errors`

### Home Assistant not connecting:
1. Check HA is running: `curl http://localhost:8123` (or Mac IP)
2. Verify token in `.env`
3. Check network connectivity

---

## Next Steps After Setup

1. **Add Person 2's and child's calendars** to `.env`
2. **Set up doorbell automation** in Home Assistant
3. **Add Todoist tasks** to see them on the wallboard
4. **Customize night mode hours** if needed (in `frontend/src/hooks/useNightMode.ts`)
5. **Set up meal planning** data

---

## Performance Tips

- **Pi 3B+**: May see some lag with complex calendar views. Consider disabling animations.
- **Pi 4 (2GB+)**: Smooth performance expected.
- **Pi 5**: Excellent performance.

If performance is sluggish:
1. Reduce `AUTO_REFRESH_INTERVAL` in frontend (currently 5 min)
2. Disable transitions/animations in Tailwind config
3. Consider using Pi 4 or 5

---

## Mounting Options

### Wall Mount:
- Use official Pi touchscreen case with mounting holes
- VESA mount adapters available
- 3D-printed mounts on Thingiverse

### Desktop Stand:
- Smarticase or similar with kickstand
- DIY picture frame mount

---

## You're Done! 🎉

Your Family Wallboard should now be:
- ✅ Running on boot automatically
- ✅ Full-screen kiosk mode
- ✅ Touch-enabled
- ✅ Auto-refreshing every 5 minutes
- ✅ Showing your calendars, tasks, and Ring camera integration

Enjoy your custom family command center!

