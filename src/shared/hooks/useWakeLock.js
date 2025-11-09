// src/shared/hooks/useWakeLock.js

import { useEffect, useRef, useState, useCallback } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * Custom hook to prevent screen from sleeping while app is open
 * Requires user interaction on iOS/Safari due to security restrictions
 * 
 * Returns:
 * - isActive: boolean - whether wake lock is currently active
 * - needsActivation: boolean - whether user needs to tap to activate
 * - activate: function - call this in response to user interaction
 */
const useWakeLock = () => {
    const wakeLockRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [needsActivation, setNeedsActivation] = useState(false);
    const hasAttemptedRef = useRef(false);

    /**
     * Request wake lock to keep screen on
     */
    const requestWakeLock = useCallback(async () => {
        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            IntelliKnitLogger.warn('Wake Lock API not supported in this browser');
            return false;
        }

        try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');

            IntelliKnitLogger.success('✓ Screen wake lock active');
            setIsActive(true);
            setNeedsActivation(false);

            // Listen for wake lock release
            wakeLockRef.current.addEventListener('release', () => {
                IntelliKnitLogger.debug('Wake lock released');
                setIsActive(false);
                wakeLockRef.current = null;
            });

            return true;
        } catch (err) {
            IntelliKnitLogger.warn(`Wake Lock request failed: ${err.name}`);

            // If NotAllowedError, we need user gesture
            if (err.name === 'NotAllowedError') {
                setNeedsActivation(true);
            }

            return false;
        }
    }, []);

    useEffect(() => {
        /**
         * Re-acquire wake lock when page becomes visible again
         */
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (wakeLockRef.current === null && !isActive) {
                    IntelliKnitLogger.debug('Attempting to re-acquire wake lock...');
                    requestWakeLock();
                }
            }
        };

        // Try initial wake lock request (will fail on iOS, succeed on Android/Desktop)
        if (!hasAttemptedRef.current) {
            hasAttemptedRef.current = true;
            requestWakeLock();
        }

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
    }, [requestWakeLock, isActive]);

    return {
        isActive,
        needsActivation,
        activate: requestWakeLock
    };
};

export default useWakeLock;