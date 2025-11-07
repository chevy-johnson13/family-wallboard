import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import CameraControls from './CameraControls';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold">
            {format(currentTime, 'h:mm a')}
          </div>
          <div className="text-lg opacity-90">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Camera Controls */}
          <CameraControls />
          
          {/* WiFi Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm">Online</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

