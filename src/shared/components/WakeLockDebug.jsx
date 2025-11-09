// src/shared/components/WakeLockDebug.jsx

import React from 'react';

/**
 * Debug component to display wake lock status
 * Shows visual indicator of wake lock state for troubleshooting
 * 
 * TEMPORARY - Remove after debugging is complete
 */
const WakeLockDebug = ({ status }) => {
    if (!status) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                backgroundColor: status.active ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                zIndex: 9999,
                maxWidth: '300px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Wake Lock Debug
            </div>
            <div>
                <strong>Supported:</strong> {status.supported ? '✓ Yes' : '✗ No'}
            </div>
            <div>
                <strong>Active:</strong> {status.active ? '✓ Yes' : '✗ No'}
            </div>
            {status.lastAttempt && (
                <div>
                    <strong>Last Attempt:</strong> {status.lastAttempt}
                </div>
            )}
            {status.releaseCount > 0 && (
                <div>
                    <strong>Release Count:</strong> {status.releaseCount}
                </div>
            )}
            {status.error && (
                <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.9 }}>
                    <strong>Error:</strong> {status.error}
                </div>
            )}
        </div>
    );
};

export default WakeLockDebug;