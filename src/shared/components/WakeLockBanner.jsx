// src/shared/components/WakeLockBanner.jsx

import React, { useState, useEffect } from 'react';

/**
 * One-time banner prompting user to activate wake lock
 * DIRECT APPROACH: Calls wake lock API directly from button click
 */
const WakeLockBanner = ({ wakeLockRef, onSuccess }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [needsActivation, setNeedsActivation] = useState(true);
    const STORAGE_KEY = 'intelliknit_wakelock_activated';

    useEffect(() => {
        // Check if user has already activated wake lock before
        const hasActivated = localStorage.getItem(STORAGE_KEY);
        if (hasActivated) {
            setDebugInfo('Previously activated (from localStorage)');
        }
    }, []);

    const handleActivate = async () => {
        console.log('🔵 Banner: Button clicked - requesting wake lock DIRECTLY');
        setDebugInfo('Requesting wake lock...');

        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            setDebugInfo('❌ Wake Lock API not supported');
            console.error('Wake Lock API not supported');
            return;
        }

        try {
            console.log('🔵 Calling navigator.wakeLock.request()...');

            // Request wake lock DIRECTLY in the click handler
            const wakeLock = await navigator.wakeLock.request('screen');

            console.log('✅ Wake lock acquired!', wakeLock);
            wakeLockRef.current = wakeLock;

            setIsActive(true);
            setNeedsActivation(false);
            setDebugInfo('✅ SUCCESS! Wake lock is ACTIVE');

            // Listen for release
            wakeLock.addEventListener('release', () => {
                console.log('Wake lock released');
                setIsActive(false);
                wakeLockRef.current = null;
            });

            // Remember activation
            localStorage.setItem(STORAGE_KEY, 'true');

            // Notify parent
            if (onSuccess) {
                onSuccess();
            }

            // Auto-dismiss after showing success
            setTimeout(() => {
                setIsDismissed(true);
            }, 2000);

        } catch (err) {
            console.error('❌ Wake lock request failed:', err);
            setDebugInfo(`❌ FAILED: ${err.name} - ${err.message}`);
            setNeedsActivation(true);
        }
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
                    {isActive ? '✅' : '☀️'}
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

                {/* DEBUG INFO */}
                {debugInfo && (
                    <div style={{
                        backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
                        color: isActive ? '#065f46' : '#991b1b',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                    }}>
                        {debugInfo}
                    </div>
                )}

                {/* Status Display */}
                <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    textAlign: 'left'
                }}>
                    <div><strong>API Supported:</strong> {'wakeLock' in navigator ? 'Yes ✅' : 'No ❌'}</div>
                    <div><strong>Is Active:</strong> {isActive ? 'Yes ✅' : 'No ❌'}</div>
                </div>

                {/* Activate Button - DIRECT onClick handler */}
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
                    {isActive ? 'Wake Lock Active! 🎉' : 'Tap to Activate'}
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
                    Close (for debugging)
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
                    DEBUG MODE: Open Safari console for detailed logs
                </p>
            </div>
        </div>
    );
};

export default WakeLockBanner;