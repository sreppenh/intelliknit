// src/shared/hooks/useWakeLock.js

import { useEffect, useRef, useState } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * Custom hook to prevent screen from sleeping while app is open
 * Uses the Web Wake Lock API with graceful fallback for unsupported browsers
 * 
 * Returns debug status for troubleshooting
 * 
 * Usage:
 * ```jsx
 * function App() {
 *   const wakeLockStatus = useWakeLock({ debug: true });
 *   return <div>Your app content</div>;
 * }
 * ```
 */
const useWakeLock = (options = {}) => {
    const { debug = false } = options;
    const wakeLockRef = useRef(null);
    const [status, setStatus] = useState({
        supported: false,
        active: false,
        error: null,
        lastAttempt: null,
        releaseCount: 0
    });

    useEffect(() => {
        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            const errorMsg = 'Wake Lock API not supported in this browser';
            IntelliKnitLogger.warn(errorMsg);
            setStatus(prev => ({ ...prev, supported: false, error: errorMsg }));
            return;
        }

        setStatus(prev => ({ ...prev, supported: true }));

        /**
         * Request wake lock to keep screen on
         */
        const requestWakeLock = async () => {
            try {
                const timestamp = new Date().toLocaleTimeString();
                setStatus(prev => ({ ...prev, lastAttempt: timestamp }));

                wakeLockRef.current = await navigator.wakeLock.request('screen');

                IntelliKnitLogger.success('✓ Screen wake lock active');
                setStatus(prev => ({
                    ...prev,
                    active: true,
                    error: null,
                    lastAttempt: timestamp
                }));

                // Listen for wake lock release
                wakeLockRef.current.addEventListener('release', () => {
                    IntelliKnitLogger.debug('Wake lock released');
                    setStatus(prev => ({
                        ...prev,
                        active: false,
                        releaseCount: prev.releaseCount + 1
                    }));
                });
            } catch (err) {
                const errorMsg = `Wake Lock request failed: ${err.name} - ${err.message}`;
                IntelliKnitLogger.warn(errorMsg);
                setStatus(prev => ({
                    ...prev,
                    active: false,
                    error: errorMsg
                }));
            }
        };

        /**
         * Re-acquire wake lock when page becomes visible again
         */
        const handleVisibilityChange = () => {
            const timestamp = new Date().toLocaleTimeString();
            IntelliKnitLogger.debug(`Visibility changed: ${document.visibilityState} at ${timestamp}`);

            if (document.visibilityState === 'visible') {
                if (wakeLockRef.current === null || !status.active) {
                    IntelliKnitLogger.debug('Attempting to re-acquire wake lock...');
                    requestWakeLock();
                }
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

    // Return debug info if requested, otherwise return null
    return debug ? status : null;
};

export default useWakeLock;