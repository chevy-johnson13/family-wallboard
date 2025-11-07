# 📱 Phone Control Setup Guide

## Overview

Your Family Wallboard is designed to work as a **display-only device** on the Raspberry Pi, while you and your family control it from your phones. This is simpler than a touchscreen setup and works great for a wall-mounted display!

---

## How It Works

1. **Pi Display**: Shows the wallboard in fullscreen kiosk mode (read-only display)
2. **Phone Control**: Family members access the wallboard from their phones to:
   - View calendars, tasks, and meals
   - Add/edit tasks
   - Update meal plans
   - Change views (Today, Week, Month, etc.)
3. **Auto-Sync**: Changes made on phones automatically appear on the Pi display (auto-refreshes every 5 minutes)

---

## Setup Steps

### 1. Find Your Pi's IP Address

After deploying to the Pi, find its IP address:

```bash
# On the Pi (via SSH)
hostname -I
# Or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Or check your router's admin panel for connected devices named `familywallboard`.

**Example IP:** `192.168.1.100`

### 2. Access from Your Phone

1. **Make sure your phone is on the same WiFi network as the Pi**

2. **Open your phone's browser** (Safari on iPhone, Chrome on Android)

3. **Navigate to:** `http://192.168.1.100:3000`
   - Replace `192.168.1.100` with your Pi's actual IP address

4. **Bookmark the page** or **Add to Home Screen**:
   - **iPhone**: Tap Share button → "Add to Home Screen"
   - **Android**: Menu → "Add to Home Screen" or "Install App"

### 3. Create App Shortcuts

#### iPhone (iOS)
1. Open Safari and go to your wallboard URL
2. Tap the Share button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Family Wallboard" (or whatever you prefer)
5. Tap "Add"
6. Now you have an app icon on your home screen!

#### Android
1. Open Chrome and go to your wallboard URL
2. Tap the menu (three dots)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Name it "Family Wallboard"
5. Tap "Add" or "Install"
6. App icon appears on your home screen!

---

## Usage

### On Your Phone
- **Tap the app icon** to open the wallboard
- **Navigate** between Today, Week, Month, Tasks, and Meals views
- **Add tasks** by tapping the "+" button
- **Edit meals** by tapping on a meal
- **View calendars** - all 4 calendars (work + personal) are visible

### On the Pi Display
- Shows the wallboard in fullscreen
- **Auto-refreshes every 5 minutes** to show latest changes
- **Read-only** - no touch interaction needed
- Perfect for wall mounting!

---

## Network Configuration

### Static IP (Recommended)

To make it easier to access, set a static IP for your Pi:

```bash
# On the Pi
sudo nano /etc/dhcpcd.conf
```

Add at the end:
```
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

Replace:
- `192.168.1.100` with your desired IP
- `192.168.1.1` with your router's IP (usually correct, but check your router)

Then reboot:
```bash
sudo reboot
```

### Using Hostname (Alternative)

If your router supports mDNS, you can use:
- `http://familywallboard.local:3000`

This works automatically on most modern routers.

---

## Troubleshooting

### Can't Access from Phone

1. **Check WiFi**: Make sure phone and Pi are on the same network
2. **Check IP**: Verify Pi's IP address with `hostname -I` on the Pi
3. **Check Firewall**: Pi's firewall should allow port 3000
   ```bash
   sudo ufw allow 3000
   ```
4. **Test from computer**: Try accessing `http://<pi-ip>:3000` from a computer on the same network

### Changes Not Showing on Pi

- The Pi auto-refreshes every 5 minutes
- You can manually refresh by opening the wallboard URL on the Pi (if you have a keyboard/mouse)
- Or wait for the next auto-refresh cycle

### Slow Loading on Phone

- Make sure you're on WiFi (not cellular)
- Check your network speed
- The first load might be slower, subsequent loads are cached

---

## Security Notes

⚠️ **Important**: The wallboard is accessible to anyone on your local network.

**To secure it:**
1. Use a strong WiFi password
2. Consider adding basic authentication (future enhancement)
3. The wallboard is read-only on the Pi, so unauthorized access can only view (not modify) data

---

## Benefits of This Setup

✅ **No touchscreen needed** - cheaper and simpler  
✅ **Control from anywhere** - use your phone from the couch, kitchen, etc.  
✅ **Multiple users** - all family members can control it  
✅ **Easy updates** - make changes without walking to the wall  
✅ **Better UX** - phone interface is more responsive than touchscreen  

---

## Next Steps

1. Deploy to Pi following `PI_COMPLETE_SETUP_GUIDE.md`
2. Find Pi's IP address
3. Add app shortcuts to both your phones
4. Mount the Pi display on the wall
5. Enjoy your Family Wallboard! 🎉

---

**Questions?** Check the main README or troubleshooting guides!

