import { useState, useEffect } from 'react';
import { overlayAPI } from '../services/api';
import type { OverlayStatus } from '../types';

export default function RingOverlay() {
  const [overlay, setOverlay] = useState<OverlayStatus>({ active: false });

  useEffect(() => {
    // Poll for overlay status every 2 seconds
    const checkOverlay = async () => {
      try {
        const status = await overlayAPI.getStatus();
        setOverlay(status);
      } catch (error) {
        console.error('Error checking overlay status:', error);
      }
    };

    checkOverlay();
    const interval = setInterval(checkOverlay, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async () => {
    try {
      await overlayAPI.dismiss();
    } catch (error) {
      console.error('Error dismissing overlay:', error);
    }
    setOverlay({ active: false });
  };

  if (!overlay.active) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <h2 className="text-xl font-bold">Someone's at the Door!</h2>
              <p className="text-sm opacity-90">Ring Doorbell - Front Door</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Stream */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {overlay.haUrl && overlay.entityId ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
              <div className="text-6xl mb-6">🔔</div>
              <h2 className="text-3xl font-bold mb-4">Someone's at the Door!</h2>
              <p className="text-2xl mb-4 text-blue-200">
                {overlay.entityId === 'camera.front_door_live_view' ? '📹 Front Door Camera' : '📹 Driveway Camera'}
              </p>
              <a
                href={`${overlay.haUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-medium transition-colors shadow-lg"
              >
                Open Home Assistant →
              </a>
              <div className="mt-6 text-center opacity-90">
                <p className="text-lg mb-2">👉 Click the camera card to view live feed</p>
                <p className="text-sm">(Camera will start streaming when opened)</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-4xl mb-4">📹</div>
                <p>Loading camera feed...</p>
              </div>
            </div>
          )}

          {/* Auto-dismiss countdown */}
          {overlay.expiresAt && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full">
              Auto-dismiss in {Math.ceil((new Date(overlay.expiresAt).getTime() - Date.now()) / 1000)}s
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={handleDismiss}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

