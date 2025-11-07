#!/bin/bash

# Family Wallboard - Deployment Script
# Usage: ./deploy.sh [user@hostname]
# Example: ./deploy.sh pi@familywallboard.local

set -e

if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh user@hostname"
    echo "Example: ./deploy.sh pi@familywallboard.local"
    exit 1
fi

TARGET=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏠 Family Wallboard - Deployment Script"
echo "========================================"
echo "Target: $TARGET"
echo "Project: $PROJECT_DIR"
echo ""

# Check if frontend is built
if [ ! -d "$PROJECT_DIR/frontend/dist" ]; then
    echo "📦 Building frontend..."
    cd "$PROJECT_DIR/frontend"
    npm install
    npm run build
    cd "$PROJECT_DIR"
else
    echo "✓ Frontend already built"
fi

echo ""
echo "📤 Deploying to Raspberry Pi..."

# Create directory on Pi
ssh $TARGET "mkdir -p ~/family-wallboard"

# Copy backend
echo "  → Copying backend..."
rsync -avz --exclude 'node_modules' --exclude '.env' \
    "$PROJECT_DIR/backend/" \
    $TARGET:~/family-wallboard/backend/

# Copy frontend build
echo "  → Copying frontend..."
rsync -avz \
    "$PROJECT_DIR/frontend/dist/" \
    $TARGET:~/family-wallboard/frontend/dist/

# Copy pi-setup files
echo "  → Copying setup files..."
rsync -avz \
    "$PROJECT_DIR/pi-setup/" \
    $TARGET:~/family-wallboard/pi-setup/

# Install backend dependencies on Pi
echo ""
echo "📦 Installing backend dependencies on Pi..."
ssh $TARGET "cd ~/family-wallboard/backend && npm install --production"

# Check if .env exists
echo ""
if ssh $TARGET "[ -f ~/family-wallboard/backend/.env ]"; then
    echo "✓ .env file already exists on Pi"
else
    echo "⚠️  No .env file found on Pi"
    echo "   You need to create ~/family-wallboard/backend/.env with your configuration"
    echo "   See backend/.env.example for reference"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. SSH to your Pi: ssh $TARGET"
echo "2. Configure .env file: nano ~/family-wallboard/backend/.env"
echo "3. Install systemd service:"
echo "   sudo cp ~/family-wallboard/pi-setup/family-wallboard.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable family-wallboard.service"
echo "   sudo systemctl start family-wallboard.service"
echo "4. Set up kiosk mode:"
echo "   mkdir -p ~/.config/lxsession/LXDE-pi"
echo "   cp ~/family-wallboard/pi-setup/autostart ~/.config/lxsession/LXDE-pi/"
echo "5. Reboot: sudo reboot"
echo ""

