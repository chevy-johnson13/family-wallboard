#!/bin/bash
# Debug script for kiosk mode issues
# Run this on your Pi via SSH: bash <(cat DEBUG_KIOSK.sh)

echo "🔍 Checking Kiosk Mode Configuration..."
echo ""

echo "1️⃣ Checking if autostart file exists:"
if [ -f ~/.config/lxsession/LXDE-pi/autostart ]; then
    echo "✅ Autostart file exists"
    echo "Contents:"
    cat ~/.config/lxsession/LXDE-pi/autostart
else
    echo "❌ Autostart file NOT found at ~/.config/lxsession/LXDE-pi/autostart"
    echo "   Creating directory..."
    mkdir -p ~/.config/lxsession/LXDE-pi
fi

echo ""
echo "2️⃣ Checking if kiosk script exists:"
if [ -f ~/kiosk/start-wallboard.sh ]; then
    echo "✅ Kiosk script exists"
    echo "Checking permissions:"
    ls -la ~/kiosk/start-wallboard.sh
else
    echo "❌ Kiosk script NOT found at ~/kiosk/start-wallboard.sh"
fi

echo ""
echo "3️⃣ Checking if Chromium is installed:"
if command -v chromium &> /dev/null; then
    echo "✅ Chromium is installed: $(which chromium)"
else
    echo "❌ Chromium is NOT installed"
fi

echo ""
echo "4️⃣ Checking if backend is running:"
if pm2 list | grep -q wallboard-backend; then
    echo "✅ Backend is running"
    pm2 status wallboard-backend
else
    echo "❌ Backend is NOT running"
fi

echo ""
echo "5️⃣ Checking X session errors:"
if [ -f ~/.xsession-errors ]; then
    echo "Last 20 lines of .xsession-errors:"
    tail -20 ~/.xsession-errors
else
    echo "No .xsession-errors file found"
fi

echo ""
echo "6️⃣ Testing if Chromium can start manually:"
echo "   (This will open Chromium - close it to continue)"
read -p "   Press Enter to test Chromium startup..."
DISPLAY=:0 chromium --version

echo ""
echo "✅ Debug complete!"
echo ""
echo "📝 Quick Fix Commands:"
echo ""
echo "# Option 1: Use the autostart file from the repo"
echo "mkdir -p ~/.config/lxsession/LXDE-pi"
echo "cat > ~/.config/lxsession/LXDE-pi/autostart << 'EOF'"
echo "@lxpanel --profile LXDE-pi"
echo "@pcmanfm --desktop --profile LXDE-pi"
echo "@xscreensaver -no-splash"
echo "@xset s off"
echo "@xset -dpms"
echo "@xset s noblank"
echo "@unclutter -idle 0.1 -root"
echo "@bash -c \"sleep 15 && chromium --kiosk --noerrdialogs --disable-infobars --no-first-run --enable-features=OverlayScrollbar --start-fullscreen --disable-translate --disable-features=TranslateUI --disk-cache-dir=/dev/null 'http://localhost:3000'\""
echo "EOF"
echo ""
echo "# Then reboot:"
echo "sudo reboot"

