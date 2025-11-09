// src/shared/components/WakeLockBanner.jsx

import React, { useState, useEffect } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * One-time banner prompting user to activate wake lock
 * Appears once per device, dismisses after activation
 * Uses localStorage to remember user preference
 */
const WakeLockBanner = ({ wakeLockRef, onSuccess }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const STORAGE_KEY = 'intelliknit_wakelock_activated';

    useEffect(() => {
        // Check if user has already activated or dismissed wake lock
        const hasActivated = localStorage.getItem(STORAGE_KEY);
        if (hasActivated) {
            setIsDismissed(true);
        }
    }, []);

    const handleActivate = async () => {
        setIsActivating(true);
        IntelliKnitLogger.debug('User activating wake lock...');

        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            IntelliKnitLogger.warn('Wake Lock API not supported in this browser');
            setIsActivating(false);
            return;
        }

        try {
            // Request wake lock DIRECTLY in the click handler
            const wakeLock = await navigator.wakeLock.request('screen');

            IntelliKnitLogger.success('✓ Screen wake lock active');
            wakeLockRef.current = wakeLock;

            // Listen for release
            wakeLock.addEventListener('release', () => {
                IntelliKnitLogger.debug('Wake lock released');
                wakeLockRef.current = null;
            });

            // Remember activation
            localStorage.setItem(STORAGE_KEY, 'true');

            // Notify parent
            if (onSuccess) {
                onSuccess();
            }

            // Show success briefly, then dismiss
            setTimeout(() => {
                setIsDismissed(true);
            }, 1500);

        } catch (err) {
            IntelliKnitLogger.warn(`Wake lock request failed: ${err.name}`);
            setIsActivating(false);
        }
    };

    const handleDismiss = () => {
        // Remember that user dismissed (don't show again)
        localStorage.setItem(STORAGE_KEY, 'dismissed');
        setIsDismissed(true);
    };

    // Don't show if dismissed
    if (isDismissed) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}
        >
            <div
                className="card"
                style={{
                    maxWidth: '400px',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: '#fefcf9',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}
            >
                {/* Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {isActivating ? '✨' : '☀️'}
                </div>

                {/* Title */}
                <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: '#4a5568' }}
                >
                    {isActivating ? 'Activating...' : 'Keep Your Screen Awake'}
                </h2>

                {/* Description */}
                {!isActivating && (
                    <p
                        className="text-base mb-6"
                        style={{ color: '#718096', lineHeight: '1.6' }}
                    >
                        IntelliKnit can keep your screen on while you knit, so you don't have to keep unlocking your phone between rows.
                    </p>
                )}

                {isActivating && (
                    <p
                        className="text-base mb-6"
                        style={{ color: '#10b981', lineHeight: '1.6', fontWeight: '600' }}
                    >
                        Screen wake lock activated! ✓
                    </p>
                )}

                {/* Activate Button */}
                {!isActivating && (
                    <>
                        <button
                            onClick={handleActivate}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '12px'
                            }}
                        >
                            Keep Screen Awake
                        </button>

                        {/* Dismiss Link */}
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#a0aec0',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            No thanks
                        </button>
                    </>
                )}

                {/* Info Text */}
                <p
                    style={{
                        color: '#a0aec0',
                        fontSize: '12px',
                        marginTop: '16px',
                        lineHeight: '1.5'
                    }}
                >
                    This only works while IntelliKnit is open.
                </p>
            </div>
        </div>
    );
};

export default WakeLockBanner;