#!/bin/bash

# Quick test script for doorbell automation
# Run this to simulate a doorbell press

echo "🔔 Testing doorbell notification..."
echo ""

# Test 1: Check backend is running
echo "1️⃣ Checking backend..."
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ]; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is not running - start it first!"
  exit 1
fi

# Test 2: Check Home Assistant is running
echo ""
echo "2️⃣ Checking Home Assistant..."
HA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8123)
if [ "$HA_STATUS" = "200" ]; then
  echo "✅ Home Assistant is running"
else
  echo "❌ Home Assistant is not responding"
  exit 1
fi

# Test 3: Trigger the overlay
echo ""
echo "3️⃣ Triggering doorbell notification..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/overlay/trigger \
  -H "Content-Type: application/json" \
  -d '{"cameraEntityId":"camera.front_door_live_view","duration":30000}')

echo "✅ Notification sent!"
echo ""
echo "📺 Check your wallboard at http://localhost:5173"
echo "   You should see the doorbell notification appear!"
echo ""
echo "Response: $RESPONSE"

