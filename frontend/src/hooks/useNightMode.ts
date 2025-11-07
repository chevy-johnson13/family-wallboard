import { useState, useEffect } from 'react';

export function useNightMode() {
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    const checkNightMode = () => {
      const hour = new Date().getHours();
      // Night mode: 9 PM (21:00) to 6 AM (6:00)
      const shouldBeNightMode = hour >= 21 || hour < 6;
      setIsNightMode(shouldBeNightMode);
    };

    // Check immediately
    checkNightMode();

    // Check every minute
    const interval = setInterval(checkNightMode, 60000);

    return () => clearInterval(interval);
  }, []);

  return isNightMode;
}

