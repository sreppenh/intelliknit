// src/shared/components/WakeLockStatus.jsx

import React, { useState, useEffect } from 'react';

/**
 * Subtle status indicator showing wake lock state
 * Displays at bottom of screen in small, unobtrusive text
 */
const WakeLockStatus = ({ wakeLockRef }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsActive(wakeLockRef.current !== null);

        // Poll every 2 seconds to update status
        const interval = setInterval(() => {
            setIsActive(wakeLockRef.current !== null);
        }, 2000);

        return () => clearInterval(interval);
    }, [wakeLockRef]);

    // Don't show if wake lock was never activated
    const wakeLockStatus = localStorage.getItem('intelliknit_wakelock_activated');
    if (!wakeLockStatus || wakeLockStatus === 'dismissed') {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '11px',
                color: isActive ? '#10b981' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                zIndex: 100,
                pointerEvents: 'none',
                userSelect: 'none'
            }}
        >
            <span style={{ fontSize: '8px' }}>
                {isActive ? '●' : '○'}
            </span>
            <span>
                {isActive ? 'Screen awake' : 'Screen lock inactive'}
            </span>
        </div>
    );
};

export default WakeLockStatus;