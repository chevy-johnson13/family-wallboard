import { useState } from 'react';
import { overlayAPI } from '../services/api';

export default function CameraControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const triggerCamera = async (cameraEntityId: string, cameraName: string) => {
    setIsTriggering(true);
    try {
      await overlayAPI.trigger(cameraEntityId, 60000); // 60 seconds
      setIsOpen(false);
    } catch (error) {
      console.error('Error triggering camera:', error);
      alert(`Failed to show ${cameraName} camera`);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        title="View Cameras"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">Cameras</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="bg-blue-600 text-white px-4 py-3">
              <h3 className="font-bold text-lg">View Camera</h3>
              <p className="text-sm opacity-90">Select a camera to view</p>
            </div>
            
            <div className="p-2 space-y-2">
              {/* Front Door Camera */}
              <button
                onClick={() => triggerCamera('camera.front_door_live_view', 'Front Door')}
                disabled={isTriggering}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Front Door</div>
                  <div className="text-sm text-gray-500">Ring Doorbell</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Driveway Camera */}
              <button
                onClick={() => triggerCamera('camera.driveway_live_view', 'Driveway')}
                disabled={isTriggering}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Driveway</div>
                  <div className="text-sm text-gray-500">Ring Camera</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-t">
              <p className="text-xs text-gray-500 text-center">View will auto-dismiss after 60 seconds</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

