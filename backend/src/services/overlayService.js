import fetch from 'node-fetch';

let currentOverlay = null;

// Get Home Assistant camera stream URL
async function getCameraStreamUrl(entityId) {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const token = process.env.HOME_ASSISTANT_TOKEN;
  
  if (!haUrl || !token) {
    throw new Error('Home Assistant configuration missing');
  }
  
  try {
    // Use our backend proxy to avoid CORS issues
    // The backend will fetch from Home Assistant and forward to frontend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    return {
      entityId,
      haUrl,
      token,
      // Use backend proxy for camera snapshot (avoids CORS)
      snapshotUrl: `${backendUrl}/api/overlay/camera-snapshot/${entityId}`,
      // Original HA URL for reference
      streamUrl: `${haUrl}/api/camera_proxy_stream/${entityId}?token=${token}`
    };
  } catch (error) {
    console.error('Error getting camera stream:', error);
    throw error;
  }
}

// Trigger overlay display
export async function triggerOverlay({ cameraEntityId, duration }) {
  console.log(`🔔 Triggering overlay for ${cameraEntityId}`);
  
  try {
    const cameraInfo = await getCameraStreamUrl(cameraEntityId);
    
    currentOverlay = {
      active: true,
      cameraEntityId,
      ...cameraInfo,
      triggeredAt: new Date().toISOString(),
      duration,
      expiresAt: new Date(Date.now() + duration).toISOString()
    };
    
    // Auto-dismiss after duration
    setTimeout(() => {
      if (currentOverlay && currentOverlay.triggeredAt === currentOverlay.triggeredAt) {
        console.log('🔔 Auto-dismissing overlay');
        currentOverlay = null;
      }
    }, duration);
    
    return currentOverlay;
  } catch (error) {
    console.error('Error triggering overlay:', error);
    throw error;
  }
}

// Get current overlay status
export function getOverlayStatus() {
  if (!currentOverlay) {
    return { active: false };
  }
  
  // Check if overlay has expired
  if (new Date() > new Date(currentOverlay.expiresAt)) {
    currentOverlay = null;
    return { active: false };
  }
  
  return currentOverlay;
}

// Manually dismiss overlay
export function dismissOverlay() {
  console.log('🔔 Manually dismissing overlay');
  currentOverlay = null;
  return { active: false };
}

