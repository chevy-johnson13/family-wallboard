import express from 'express';
import fetch from 'node-fetch';
import { triggerOverlay, getOverlayStatus, dismissOverlay } from '../services/overlayService.js';

const router = express.Router();

// Trigger overlay (called by Home Assistant when doorbell rings)
router.post('/trigger', async (req, res, next) => {
  try {
    const { cameraEntityId, duration } = req.body;
    
    const overlay = await triggerOverlay({
      cameraEntityId: cameraEntityId || process.env.RING_CAMERA_ENTITY_ID,
      duration: duration || 60000 // 60 seconds default
    });
    
    res.json({ success: true, overlay });
  } catch (error) {
    next(error);
  }
});

// Get current overlay status
router.get('/status', (req, res) => {
  const status = getOverlayStatus();
  res.json(status);
});

// Dismiss overlay
router.post('/dismiss', (req, res) => {
  const status = dismissOverlay();
  res.json(status);
});

// Proxy camera snapshot to avoid CORS issues
router.get('/camera-snapshot/:entityId', async (req, res) => {
  try {
    const { entityId } = req.params;
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const token = process.env.HOME_ASSISTANT_TOKEN;
    
    // Step 1: Get the camera entity state to retrieve its access_token
    const stateResponse = await fetch(`${haUrl}/api/states/${entityId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!stateResponse.ok) {
      throw new Error(`Failed to fetch camera state: ${stateResponse.statusText}`);
    }
    
    const cameraState = await stateResponse.json();
    const cameraAccessToken = cameraState.attributes?.access_token;
    
    if (!cameraAccessToken) {
      throw new Error('Camera access token not found');
    }
    
    // Step 2: Fetch the camera snapshot using the camera's access token
    const snapshotUrl = `${haUrl}/api/camera_proxy/${entityId}?token=${cameraAccessToken}`;
    const response = await fetch(snapshotUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch camera snapshot: ${response.statusText}`);
    }
    
    // Forward the image with proper headers
    res.set('Content-Type', response.headers.get('content-type'));
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.body.pipe(res);
  } catch (error) {
    console.error('Error proxying camera snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch camera snapshot', details: error.message });
  }
});

export default router;

