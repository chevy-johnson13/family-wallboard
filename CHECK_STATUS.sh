#!/bin/bash

# ============================================
# Family Wallboard - Status Check
# ============================================

echo "🔍 Family Wallboard Status Check"
echo "===================================="
echo ""

# Check Backend
echo "1️⃣ Backend Health Check..."
BACKEND_STATUS=$(curl -s http://localhost:3000/api/health 2>&1)
if echo "$BACKEND_STATUS" | grep -q '"status":"ok"'; then
  echo "   ✅ Backend is running at http://localhost:3000"
else
  echo "   ❌ Backend is not responding"
  echo "   To start: cd backend && npm run dev"
fi
echo ""

# Check Frontend
echo "2️⃣ Frontend Check..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>&1)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "   ✅ Frontend is running at http://localhost:5173"
else
  echo "   ❌ Frontend is not responding"
  echo "   To start: cd frontend && npm run dev"
fi
echo ""

# Check Home Assistant
echo "3️⃣ Home Assistant Check..."
HA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8123 2>&1)
if [ "$HA_STATUS" = "200" ]; then
  echo "   ✅ Home Assistant is running at http://localhost:8123"
else
  echo "   ❌ Home Assistant is not responding"
  echo "   To start: Check Docker Desktop"
fi
echo ""

# Check Calendar Events
echo "4️⃣ Calendar Events..."
CALENDAR_COUNT=$(curl -s "http://localhost:3000/api/calendar/events" 2>&1 | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
if [ -n "$CALENDAR_COUNT" ]; then
  echo "   ✅ Calendar API working: $CALENDAR_COUNT events"
else
  echo "   ❌ Calendar API not responding"
fi
echo ""

# Check Todoist
echo "5️⃣ Todoist Tasks..."
TASKS_COUNT=$(curl -s "http://localhost:3000/api/tasks" 2>&1 | grep -o '"id"' | wc -l | xargs)
if [ "$TASKS_COUNT" -gt 0 ]; then
  echo "   ✅ Todoist API working: $TASKS_COUNT tasks"
else
  echo "   ⚠️  No Todoist tasks found (may need to add tasks in Todoist app)"
fi
echo ""

# Check Ring Overlay
echo "6️⃣ Ring Camera Overlay..."
OVERLAY_STATUS=$(curl -s http://localhost:3000/api/overlay/status 2>&1)
if echo "$OVERLAY_STATUS" | grep -q '"active"'; then
  echo "   ✅ Overlay API responding"
  if echo "$OVERLAY_STATUS" | grep -q '"active":true'; then
    echo "   🔔 Overlay is currently ACTIVE"
  else
    echo "   💤 Overlay is inactive"
  fi
else
  echo "   ❌ Overlay API not responding"
fi
echo ""

# Check Environment
echo "7️⃣ Environment Configuration..."
if [ -f ".env" ]; then
  echo "   ✅ .env file exists"
  
  # Check important variables
  if grep -q "TODOIST_API_TOKEN=" .env && ! grep -q "TODOIST_API_TOKEN=$" .env; then
    echo "   ✅ Todoist token configured"
  else
    echo "   ⚠️  Todoist token not set"
  fi
  
  if grep -q "HOME_ASSISTANT_TOKEN=" .env && ! grep -q "HOME_ASSISTANT_TOKEN=$" .env; then
    echo "   ✅ Home Assistant token configured"
  else
    echo "   ⚠️  Home Assistant token not set"
  fi
  
  if grep -q "CALENDAR_CHEVON_ICS_URL=" .env && ! grep -q "CALENDAR_CHEVON_ICS_URL=$" .env; then
    echo "   ✅ At least one calendar configured"
  else
    echo "   ⚠️  No calendars configured"
  fi
else
  echo "   ❌ .env file not found"
fi
echo ""

# Get Mac IP
echo "8️⃣ Mac IP Address (for Pi deployment)..."
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ -n "$MAC_IP" ]; then
  echo "   📍 Your Mac's IP: $MAC_IP"
  echo "   (Use this in Pi's .env if keeping Home Assistant on Mac)"
else
  echo "   ⚠️  Could not determine IP"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Summary:"
echo ""

ALL_GOOD=true

if ! echo "$BACKEND_STATUS" | grep -q '"status":"ok"'; then
  ALL_GOOD=false
fi

if [ "$FRONTEND_STATUS" != "200" ]; then
  ALL_GOOD=false
fi

if $ALL_GOOD; then
  echo "✅ Your wallboard is ready for deployment!"
  echo ""
  echo "Next steps:"
  echo "1. Review PI_PRE_DEPLOYMENT_CHECKLIST.md"
  echo "2. Flash your Raspberry Pi SD card"
  echo "3. Run ./DEPLOY_TO_PI.sh when ready"
else
  echo "⚠️  Some services are not running"
  echo ""
  echo "Start missing services:"
  if ! echo "$BACKEND_STATUS" | grep -q '"status":"ok"'; then
    echo "  Backend:  cd backend && npm run dev"
  fi
  if [ "$FRONTEND_STATUS" != "200" ]; then
    echo "  Frontend: cd frontend && npm run dev"
  fi
fi

echo ""

