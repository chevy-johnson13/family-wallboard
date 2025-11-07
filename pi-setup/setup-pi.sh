#!/bin/bash

# Family Wallboard - Raspberry Pi Setup Script
# This script installs all dependencies needed to run the Family Wallboard

set -e

echo "🏠 Family Wallboard - Raspberry Pi Setup"
echo "========================================"
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo ""
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✓ Node.js already installed: $(node --version)"
fi

echo ""
echo "📦 Installing system dependencies..."
sudo apt install -y \
    chromium \
    unclutter \
    xdotool \
    git \
    xserver-xorg-input-evdev

echo ""
echo "⚙️  Configuring screen settings..."

# Disable screen blanking
if ! grep -q "xset s off" ~/.config/lxsession/LXDE-pi/autostart 2>/dev/null; then
    mkdir -p ~/.config/lxsession/LXDE-pi
    echo ""
    echo "Note: Screen blanking configuration will be set up when you copy the autostart file"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy the Family Wallboard application to ~/family-wallboard"
echo "2. Configure the .env file with your API keys and calendar URLs"
echo "3. Copy the systemd service file and enable it"
echo "4. Copy the autostart file for kiosk mode"
echo "5. Reboot the Pi"
echo ""
echo "See pi-setup/README.md for detailed instructions."

