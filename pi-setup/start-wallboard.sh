#!/bin/bash

# Wait for network and backend to be ready
sleep 15

# Set display (important for headless/autostart)
export DISPLAY=:0

# Disable keyring prompts
export GNOME_KEYRING_CONTROL=""
export SSH_AUTH_SOCK=""

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor after 1 second of inactivity
unclutter -idle 1 &

# Start Chromium in kiosk mode (with flags to avoid keyring and disable cache)
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
  --disable-restore-session-state \
  --password-store=basic \
  --use-mock-keychain \
  --disable-background-networking \
  --disable-sync \
  --disable-default-apps \
  --disable-extensions \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
  "http://localhost:3000?nocache=$(date +%s)"

