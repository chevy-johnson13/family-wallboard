import { useEffect } from 'react';

export function useAutoRefresh(callback: () => void, interval: number = 300000) {
  useEffect(() => {
    // Call immediately
    callback();

    // Set up interval (default 5 minutes)
    const intervalId = setInterval(callback, interval);

    // Wake from sleep handler
    let lastTime = Date.now();
    const checkWakeup = () => {
      const currentTime = Date.now();
      if (currentTime > lastTime + interval + 5000) {
        // Device likely woke from sleep
        console.log('🔄 Device woke from sleep, refreshing...');
        callback();
      }
      lastTime = currentTime;
    };

    const wakeupInterval = setInterval(checkWakeup, 10000);

    return () => {
      clearInterval(intervalId);
      clearInterval(wakeupInterval);
    };
  }, [callback, interval]);
}

