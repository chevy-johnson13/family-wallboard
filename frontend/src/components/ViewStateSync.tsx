import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { viewStateAPI } from '../services/api';

/**
 * Component that:
 * 1. Syncs current route to backend (for phones/other devices)
 * 2. Polls backend for view state changes and navigates (for Pi display)
 */
export default function ViewStateSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastSyncedPath = useRef<string>(location.pathname);
  const isPi = useRef<boolean>(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Detect if we're running on the Pi
    // Check if we're accessing via localhost or the Pi's hostname
    const hostname = window.location.hostname;
    isPi.current = hostname === 'localhost' || hostname === '127.0.0.1';
    // Note: We check for exact localhost match, not familywallboard.local
    // because phones accessing via familywallboard.local should still sync
    console.log('🔍 ViewStateSync: isPi =', isPi.current, 'hostname =', hostname);
  }, []);

  // Sync current route to backend (for phones/other devices)
  // IMPORTANT: Only sync if NOT on Pi - Pi should only poll, not push
  useEffect(() => {
    // Don't sync if we're on the Pi - Pi should only follow, not lead
    if (isPi.current) {
      return;
    }

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce to avoid too many API calls
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await viewStateAPI.setCurrentView(location.pathname);
        lastSyncedPath.current = location.pathname;
        console.log('📤 Synced view state to backend:', location.pathname);
      } catch (error) {
        // Silently fail - this is not critical
        console.error('Failed to sync view state:', error);
      }
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [location.pathname]);

  // Poll for view state changes (only on Pi)
  useEffect(() => {
    if (!isPi.current) {
      // Not running on Pi, don't poll
      return;
    }

    // Poll for view state changes every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const viewState = await viewStateAPI.getCurrentView();
        
        // Only navigate if the path is different from current location
        if (viewState.path !== location.pathname) {
          // Check if the remote state is newer (within last 30 seconds)
          const remoteTime = new Date(viewState.timestamp).getTime();
          const now = Date.now();
          const timeDiff = now - remoteTime;
          
          // Only sync if the remote state is recent (within 30 seconds)
          // This prevents old states from overriding current navigation
          if (timeDiff < 30000) {
            console.log('📥 Pi: Syncing to view state:', viewState.path);
            lastSyncedPath.current = viewState.path;
            navigate(viewState.path, { replace: true });
          } else {
            console.log('⏰ Pi: View state too old, ignoring:', timeDiff, 'ms');
          }
        }
      } catch (error) {
        // Silently fail - this is not critical
        console.error('Failed to poll view state:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [location.pathname, navigate]);

  // This component doesn't render anything
  return null;
}

