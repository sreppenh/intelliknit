// src/shared/hooks/useWakeLock.js

import { useEffect, useRef } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * Custom hook to prevent screen from sleeping while app is open
 * Uses the Web Wake Lock API with graceful fallback for unsupported browsers
 * 
 * Usage:
 * ```jsx
 * function App() {
 *   useWakeLock();
 *   return <div>Your app content</div>;
 * }
 * ```
 */
const useWakeLock = () => {
    const wakeLockRef = useRef(null);

    useEffect(() => {
        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            IntelliKnitLogger.warn('Wake Lock API not supported in this browser');
            return;
        }

        /**
         * Request wake lock to keep screen on
         */
        const requestWakeLock = async () => {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                IntelliKnitLogger.success('✓ Screen wake lock active');

                // Listen for wake lock release (happens automatically on page hide/minimize)
                wakeLockRef.current.addEventListener('release', () => {
                    IntelliKnitLogger.debug('Wake lock released');
                });
            } catch (err) {
                // This will fail if user doesn't have the page focused
                // or if browser denies for some reason (low battery, etc)
                IntelliKnitLogger.warn('Wake Lock request failed', err.message);
            }
        };

        /**
         * Re-acquire wake lock when page becomes visible again
         */
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
                requestWakeLock();
            }
        };

        // Initial wake lock request
        requestWakeLock();

        // Re-acquire wake lock when returning to app
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup: release wake lock when component unmounts
        return () => {
            if (wakeLockRef.current !== null) {
                wakeLockRef.current.release()
                    .then(() => {
                        IntelliKnitLogger.debug('Wake lock released on cleanup');
                        wakeLockRef.current = null;
                    })
                    .catch((err) => {
                        IntelliKnitLogger.error('Error releasing wake lock', err);
                    });
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // This hook doesn't return anything - it just manages the wake lock
    return null;
};

export default useWakeLock;