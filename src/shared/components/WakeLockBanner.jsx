// src/shared/components/WakeLockBanner.jsx

import React, { useState, useEffect } from 'react';

/**
 * One-time banner prompting user to activate wake lock
 * Appears once per device, dismisses after activation
 * Uses localStorage to remember dismissal
 */
const WakeLockBanner = ({ needsActivation, onActivate }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const STORAGE_KEY = 'intelliknit_wakelock_activated';

    useEffect(() => {
        // Check if user has already activated wake lock before
        const hasActivated = localStorage.getItem(STORAGE_KEY);
        if (hasActivated) {
            setIsDismissed(true);
        }
    }, []);

    const handleActivate = () => {
        if (onActivate) {
            onActivate();
            // Remember that user has activated
            localStorage.setItem(STORAGE_KEY, 'true');
            setIsDismissed(true);
        }
    };

    // Don't show if dismissed or doesn't need activation
    if (isDismissed || !needsActivation) {
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
            onClick={handleActivate}
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
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    ☀️
                </div>

                {/* Title */}
                <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: '#4a5568' }}
                >
                    Keep Your Screen Awake
                </h2>

                {/* Description */}
                <p
                    className="text-base mb-6"
                    style={{ color: '#718096', lineHeight: '1.6' }}
                >
                    IntelliKnit can keep your screen on while you knit, so you don't have to keep unlocking your phone between rows.
                </p>

                {/* Activate Button */}
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
                    Tap to Activate
                </button>

                {/* Dismiss Link */}
                <button
                    onClick={() => setIsDismissed(true)}
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

                {/* Info Text */}
                <p
                    style={{
                        color: '#a0aec0',
                        fontSize: '12px',
                        marginTop: '16px',
                        lineHeight: '1.5'
                    }}
                >
                    This only works while IntelliKnit is open. You can change this anytime in settings.
                </p>
            </div>
        </div>
    );
};

export default WakeLockBanner;