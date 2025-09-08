// src/shared/components/MarkerArrayVisualization.jsx
import React from 'react';
import markerArrayUtils from '../utils/markerArrayUtils';

// ===== FIXED MARKER COLOR CONFIGURATION =====
const MARKER_STYLES = {
    'M': { bgColor: 'bg-sage-100', borderColor: 'border-sage-400', textColor: 'text-sage-700' },
    'L': { bgColor: 'bg-yarn-200', borderColor: 'border-yarn-500', textColor: 'text-yarn-800' }, // Darker yarn
    'R': { bgColor: 'bg-yarn-100', borderColor: 'border-yarn-400', textColor: 'text-yarn-700' }, // Lighter yarn
    'S': { bgColor: 'bg-wool-200', borderColor: 'border-wool-400', textColor: 'text-wool-700' },
    'W': { bgColor: 'bg-rose-100', borderColor: 'border-rose-400', textColor: 'text-rose-700' },
    'U': { bgColor: 'bg-violet-100', borderColor: 'border-violet-400', textColor: 'text-violet-700' },
    'P': { bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400', textColor: 'text-emerald-700' },
    'BOR': { bgColor: 'bg-lavender-200', borderColor: 'border-lavender-500', textColor: 'text-lavender-700', special: true }
};

// Helper to get marker styling
const getMarkerStyle = (markerName, customColors = {}) => {
    if (markerName === 'BOR') return MARKER_STYLES.BOR;

    // If custom colors provided, use those first
    if (customColors[markerName] !== undefined) {
        const MARKER_COLOR_OPTIONS = [
            { bgColor: 'bg-sage-100', borderColor: 'border-sage-400', textColor: 'text-sage-700' },
            { bgColor: 'bg-yarn-200', borderColor: 'border-yarn-500', textColor: 'text-yarn-800' },
            { bgColor: 'bg-yarn-100', borderColor: 'border-yarn-400', textColor: 'text-yarn-700' },
            { bgColor: 'bg-wool-200', borderColor: 'border-wool-400', textColor: 'text-wool-700' }
        ];
        return MARKER_COLOR_OPTIONS[customColors[markerName]] || MARKER_COLOR_OPTIONS[0];
    }

    // Fallback to old logic
    const category = markerName.match(/^([A-Z])/)?.[1];
    return MARKER_STYLES[category] || {
        bgColor: 'bg-wool-200',
        borderColor: 'border-wool-400',
        textColor: 'text-wool-700'
    };
};

const MarkerArrayVisualization = ({
    stitchArray,
    construction = 'flat',
    showActions = false,
    actionIndicators = [],
    className = '',
    markerColors = {} // Add this prop
}) => {
    // Handle empty or invalid arrays
    if (!stitchArray || stitchArray.length === 0) {
        return (
            <div className={`text-center py-4 text-wool-500 ${className}`}>
                <div className="text-sm">No markers placed</div>
                <div className="text-xs mt-1">
                    {construction === 'round' ? 'BOR [?] ↻' : '[?]'}
                </div>
            </div>
        );
    }

    // Validate array structure
    const errors = markerArrayUtils.validateArray(stitchArray);
    if (errors.length > 0) {
        return (
            <div className={`text-center py-4 text-red-500 ${className}`}>
                <div className="text-sm">Invalid array</div>
                <div className="text-xs mt-1">{errors[0]}</div>
            </div>
        );
    }

    // Unified rendering for both flat and round
    const renderLayout = () => {
        const elements = [];

        stitchArray.forEach((item, index) => {
            if (typeof item === 'number') {
                // Add connecting line before number (except first element)
                if (index > 0) {
                    elements.push(
                        <span key={`line-${index}`} className="text-wool-400 mx-1">—</span>
                    );
                }

                // Stitch count with subtle styling
                elements.push(
                    <span key={index} className="text-sm font-semibold text-wool-700">
                        {item}
                    </span>
                );
            } else {
                // Add connecting line before marker (except first element)
                if (index > 0) {
                    elements.push(
                        <span key={`line-${index}`} className="text-wool-400 mx-1">—</span>
                    );
                }

                // Marker with current styling
                const style = getMarkerStyle(item, markerColors);
                elements.push(
                    <div key={index} className={`border-2 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-sm ${style.bgColor} ${style.borderColor} ${style.textColor}`}>
                        {style.special ? '●' : item}
                    </div>
                );
            }
        });

        return (
            <div className="flex items-center justify-center flex-wrap gap-y-2">
                {elements}
            </div>
        );
    };

    // Render action indicators (for preview mode)
    const renderActionIndicators = () => {
        if (!showActions || actionIndicators.length === 0) return null;

        return (
            <div className="mt-2 pt-2 border-t border-wool-200">
                <div className="text-xs text-wool-600 text-center">
                    <div className="font-medium mb-1">Actions:</div>
                    {actionIndicators.map((action, index) => (
                        <div key={index} className="text-xs">
                            {action.description || 'Shaping action'}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Summary information
    const totalStitches = markerArrayUtils.sumArrayStitches(stitchArray);
    const markerCount = markerArrayUtils.getArrayMarkers(stitchArray).length;

    return (
        <div className={`${className}`}>
            {/* Main visualization - NO container, transparent background */}
            <div className="p-2">
                {renderLayout()}

                {/* Summary info - minimal spacing */}
                <div className="mt-2 pt-2 border-t border-wool-200 text-center">
                    <div className="text-xs text-wool-600">
                        <span className="font-medium">{totalStitches}</span> stitches •
                        <span className="font-medium ml-1">{markerCount}</span> markers •
                        <span className="capitalize ml-1">{construction}</span>
                    </div>
                </div>

                {/* Action indicators */}
                {renderActionIndicators()}
            </div>

            {/* Debug info (development only) 
           {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                    <summary className="text-xs text-wool-400 cursor-pointer">Debug Info</summary>
                    <pre className="text-xs text-wool-400 mt-1 p-2 bg-wool-50 rounded overflow-x-auto">
                        {JSON.stringify(stitchArray, null, 2)}
                    </pre>
                </details>
            )} */}
        </div>
    );
};

export default MarkerArrayVisualization;