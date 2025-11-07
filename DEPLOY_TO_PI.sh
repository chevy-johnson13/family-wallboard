#!/bin/bash

# ============================================
# Deploy Family Wallboard to Raspberry Pi
# ============================================

set -e  # Exit on error

echo "🥧 Family Wallboard - Deploy to Raspberry Pi"
echo "=============================================="
echo ""

# Configuration
PI_USER="pi"
PI_HOST="familywallboard.local"
PI_DIR="Family-Wallboard"

# Check if we can reach the Pi
echo "📡 Checking connection to Pi..."
if ! ping -c 1 $PI_HOST > /dev/null 2>&1; then
  echo "❌ Cannot reach $PI_HOST"
  echo ""
  echo "Options:"
  echo "1. Make sure your Pi is powered on"
  echo "2. Check your Pi's IP address and update PI_HOST in this script"
  echo "3. Or specify IP manually: ./DEPLOY_TO_PI.sh <pi-ip-address>"
  exit 1
fi

# Allow custom IP
if [ -n "$1" ]; then
  PI_HOST="$1"
  echo "✅ Using custom Pi address: $PI_HOST"
else
  echo "✅ Pi is reachable at $PI_HOST"
fi

echo ""

# Create deployment package
echo "📦 Creating deployment package..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='backend/.env' \
    --exclude='frontend/dist' \
    --exclude='*.tar.gz' \
    -czf wallboard-deploy.tar.gz \
    backend/ frontend/ pi-setup/ home-assistant-examples/ \
    *.md 2>/dev/null || true

echo "✅ Package created: wallboard-deploy.tar.gz"
echo ""

# Copy to Pi
echo "📤 Copying files to Pi..."
scp wallboard-deploy.tar.gz $PI_USER@$PI_HOST:~/ || {
  echo "❌ Failed to copy files. Check SSH connection."
  exit 1
}

echo "✅ Files copied successfully"
echo ""

# Copy .env separately
echo "🔐 Copying environment variables..."
if [ -f ".env" ]; then
  scp .env $PI_USER@$PI_HOST:~/wallboard.env
  echo "✅ Environment file copied"
else
  echo "⚠️  No .env file found - you'll need to create one on the Pi"
fi

echo ""

# Deploy on Pi
echo "🚀 Deploying on Pi..."
ssh $PI_USER@$PI_HOST << 'ENDSSH'
  set -e
  
  echo "📂 Extracting files..."
  mkdir -p Family-Wallboard
  tar -xzf wallboard-deploy.tar.gz -C Family-Wallboard/
  
  echo "🔐 Setting up environment..."
  if [ -f ~/wallboard.env ]; then
    cp ~/wallboard.env Family-Wallboard/backend/.env
  fi
  
  echo "📥 Installing backend dependencies..."
  cd Family-Wallboard/backend
  npm install --production
  
  echo "📥 Installing frontend dependencies..."
  cd ../frontend
  npm install
  
  echo "🏗️  Building frontend..."
  npm run build
  
  echo ""
  echo "🔍 Verifying deployment..."
  echo "  - Backend files: $(ls -la backend/src/routes/viewState.js 2>/dev/null && echo '✅' || echo '❌')"
  echo "  - Frontend dist: $(test -d frontend/dist && echo '✅' || echo '❌')"
  echo "  - ViewStateSync component: $(ls -la frontend/src/components/ViewStateSync.tsx 2>/dev/null && echo '✅' || echo '❌')"
  echo "  - Frontend build timestamp: $(stat -c %y frontend/dist/index.html 2>/dev/null | cut -d' ' -f1-2 || echo 'N/A')"
  
  echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "Next steps:"
echo "1. SSH into Pi: ssh $PI_USER@$PI_HOST"
echo "2. Check .env file: nano ~/Family-Wallboard/backend/.env"
echo "   ⚠️  Make sure NODE_ENV=production is set!"
echo "3. Start with PM2 (recommended):"
echo "   cd ~/Family-Wallboard/backend"
echo "   NODE_ENV=production pm2 start npm --name 'wallboard-backend' -- run start"
echo "   pm2 save"
echo "   pm2 startup  # Follow the command it gives you"
echo "   OR set up systemd service:"
echo "   sudo cp ~/Family-Wallboard/pi-setup/family-wallboard.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable family-wallboard.service"
echo "   sudo systemctl start family-wallboard.service"
echo "4. Set up kiosk mode:"
echo "   mkdir -p ~/.config/lxsession/LXDE-pi"
echo "   cp ~/Family-Wallboard/pi-setup/autostart ~/.config/lxsession/LXDE-pi/autostart"
echo "5. Test: http://$PI_HOST:3000"
echo "6. Reboot: sudo reboot"
echo ""
echo "Or follow the complete guide in PI_COMPLETE_SETUP_GUIDE.md"

