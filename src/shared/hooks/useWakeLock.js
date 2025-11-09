// src/shared/hooks/useWakeLock.js

import { useEffect, useRef, useState, useCallback } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * Custom hook to prevent screen from sleeping while app is open
 * Requires user interaction on iOS/Safari due to security restrictions
 * 
 * Returns status object with activation method
 */
const useWakeLock = (options = {}) => {
    const { debug = false } = options;
    const wakeLockRef = useRef(null);
    const [status, setStatus] = useState({
        supported: false,
        active: false,
        error: null,
        lastAttempt: null,
        releaseCount: 0,
        needsUserGesture: false
    });

    /**
     * Request wake lock to keep screen on
     */
    const requestWakeLock = useCallback(async () => {
        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            const errorMsg = 'Wake Lock API not supported in this browser';
            IntelliKnitLogger.warn(errorMsg);
            setStatus(prev => ({ ...prev, supported: false, error: errorMsg }));
            return false;
        }

        try {
            const timestamp = new Date().toLocaleTimeString();
            setStatus(prev => ({ ...prev, lastAttempt: timestamp, supported: true }));

            wakeLockRef.current = await navigator.wakeLock.request('screen');

            IntelliKnitLogger.success('✓ Screen wake lock active');
            setStatus(prev => ({
                ...prev,
                active: true,
                error: null,
                lastAttempt: timestamp,
                needsUserGesture: false
            }));

            // Listen for wake lock release
            wakeLockRef.current.addEventListener('release', () => {
                IntelliKnitLogger.debug('Wake lock released');
                setStatus(prev => ({
                    ...prev,
                    active: false,
                    releaseCount: prev.releaseCount + 1
                }));
                wakeLockRef.current = null;
            });

            return true;
        } catch (err) {
            const errorMsg = `${err.name} - ${err.message}`;
            IntelliKnitLogger.warn(`Wake Lock request failed: ${errorMsg}`);

            // If NotAllowedError, we need user gesture
            const needsGesture = err.name === 'NotAllowedError';

            setStatus(prev => ({
                ...prev,
                active: false,
                error: errorMsg,
                needsUserGesture: needsGesture,
                supported: true
            }));

            return false;
        }
    }, []);

    useEffect(() => {
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

        // Try initial wake lock request (will fail on iOS, succeed on Android/Desktop)
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
    }, [requestWakeLock]);

    // Return debug info and activation method
    return debug ? { ...status, activate: requestWakeLock } : { activate: requestWakeLock };
};

export default useWakeLock;