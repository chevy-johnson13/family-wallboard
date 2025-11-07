#!/bin/bash

# Quick verification script to check if deployment worked

PI_USER="pi"
PI_HOST="${1:-familywallboard.local}"

echo "🔍 Verifying deployment on Pi..."
echo "=================================="
echo ""

ssh $PI_USER@$PI_HOST << 'ENDSSH'
  echo "📂 Checking files..."
  echo ""
  
  echo "Backend files:"
  if [ -f ~/Family-Wallboard/backend/src/routes/viewState.js ]; then
    echo "  ✅ viewState.js route exists"
    echo "     Last modified: $(stat -c %y ~/Family-Wallboard/backend/src/routes/viewState.js | cut -d' ' -f1-2)"
  else
    echo "  ❌ viewState.js route NOT found"
  fi
  
  echo ""
  echo "Frontend files:"
  if [ -f ~/Family-Wallboard/frontend/src/components/ViewStateSync.tsx ]; then
    echo "  ✅ ViewStateSync.tsx component exists"
    echo "     Last modified: $(stat -c %y ~/Family-Wallboard/frontend/src/components/ViewStateSync.tsx | cut -d' ' -f1-2)"
  else
    echo "  ❌ ViewStateSync.tsx component NOT found"
  fi
  
  if [ -d ~/Family-Wallboard/frontend/dist ]; then
    echo "  ✅ Frontend dist folder exists"
    if [ -f ~/Family-Wallboard/frontend/dist/index.html ]; then
      echo "     index.html last modified: $(stat -c %y ~/Family-Wallboard/frontend/dist/index.html | cut -d' ' -f1-2)"
    fi
  else
    echo "  ❌ Frontend dist folder NOT found"
  fi
  
  echo ""
  echo "Backend status:"
  if pm2 list | grep -q wallboard-backend; then
    echo "  ✅ PM2 process is running"
    pm2 status wallboard-backend
  else
    echo "  ❌ PM2 process NOT running"
  fi
  
  echo ""
  echo "API endpoints:"
  echo "  Testing /health..."
  curl -s http://localhost:3000/health | head -c 50 && echo "" || echo "  ❌ Failed"
  echo "  Testing /api/view-state..."
  curl -s http://localhost:3000/api/view-state | head -c 50 && echo "" || echo "  ❌ Failed"
  
  echo ""
  echo "Frontend build check:"
  if grep -q "ViewStateSync" ~/Family-Wallboard/frontend/dist/assets/*.js 2>/dev/null; then
    echo "  ✅ ViewStateSync found in built JavaScript"
  else
    echo "  ⚠️  ViewStateSync not found in built files (may need rebuild)"
  fi
ENDSSH

echo ""
echo "✅ Verification complete!"

