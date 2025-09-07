// src/shared/components/MarkerArrayVisualization.jsx
import React from 'react';
import markerArrayUtils from '../utils/markerArrayUtils';
import { getMarkerStyle, generateSmartMarkerNames } from '../utils/markerColors';

// ===== MARKER COLOR CONFIGURATION =====
const MARKER_STYLES = {
    'R': { bgColor: 'bg-sage-100', borderColor: 'border-sage-400', textColor: 'text-sage-700' },
    'M': { bgColor: 'bg-sky-100', borderColor: 'border-sky-400', textColor: 'text-sky-700' },
    'S': { bgColor: 'bg-amber-100', borderColor: 'border-amber-400', textColor: 'text-amber-700' },
    'W': { bgColor: 'bg-rose-100', borderColor: 'border-rose-400', textColor: 'text-rose-700' },
    'U': { bgColor: 'bg-violet-100', borderColor: 'border-violet-400', textColor: 'text-violet-700' },
    'P': { bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400', textColor: 'text-emerald-700' },
    'BOR': { bgColor: 'bg-sage-200', borderColor: 'border-sage-500', textColor: 'text-sage-700', special: true }
};

// Helper to get marker styling
{/* const getMarkerStyle = (markerName) => {
    if (markerName === 'BOR') return MARKER_STYLES.BOR;

    // Parse first letter for category
    const category = markerName.match(/^([A-Z])/)?.[1];

    return MARKER_STYLES[category] || {
        bgColor: 'bg-wool-200',
        borderColor: 'border-wool-400',
        textColor: 'text-wool-700'
    };
};  */}

const MarkerArrayVisualization = ({
    stitchArray,
    construction = 'flat',
    showActions = false,
    actionIndicators = [],
    className = ''
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

    // Render flat construction
    const renderFlat = () => {
        const elements = [];

        stitchArray.forEach((item, index) => {
            if (typeof item === 'number') {
                // Stitch segment
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className="bg-white border-2 border-wool-300 rounded-lg px-3 py-2 min-w-[60px] text-center shadow-sm">
                            <div className="text-sm font-semibold text-wool-700">{item}</div>
                            <div className="text-xs text-wool-500">
                                {item === 1 ? 'stitch' : 'stitches'}
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Marker
                const style = getMarkerStyle(item);
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className={`border-2 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-sm ${style.bgColor} ${style.borderColor} ${style.textColor}`}>
                            {style.special ? '●' : item}
                        </div>
                    </div>
                );
            }
        });

        return (
            <div className="flex items-center gap-2 justify-center flex-wrap">
                {elements}
            </div>
        );
    };

    // Render round construction  
    const renderRound = () => {
        const elements = [];

        stitchArray.forEach((item, index) => {
            if (typeof item === 'number') {
                // Stitch segment
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className="bg-white border-2 border-wool-300 rounded-lg px-3 py-2 min-w-[60px] text-center shadow-sm">
                            <div className="text-sm font-semibold text-wool-700">{item}</div>
                            <div className="text-xs text-wool-500">
                                {item === 1 ? 'stitch' : 'stitches'}
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Marker
                const style = getMarkerStyle(item);
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className={`border-2 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-sm ${style.bgColor} ${style.borderColor} ${style.textColor}`}>
                            {style.special ? '●' : item}
                        </div>
                    </div>
                );
            }
        });

        return (
            <div className="flex items-center gap-2 justify-center flex-wrap">
                {elements}
                <div className="text-sage-600 text-2xl ml-2">↻</div>
            </div>
        );
    };

    // Render action indicators (for preview mode)
    const renderActionIndicators = () => {
        if (!showActions || actionIndicators.length === 0) return null;

        return (
            <div className="mt-3 pt-3 border-t border-wool-200">
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
            {/* Main visualization */}
            <div className="bg-white border-2 border-wool-200 rounded-xl p-4 shadow-sm">
                {construction === 'round' ? renderRound() : renderFlat()}

                {/* Summary info */}
                <div className="mt-3 pt-3 border-t border-wool-200 text-center">
                    <div className="text-xs text-wool-600">
                        <span className="font-medium">{totalStitches}</span> stitches •
                        <span className="font-medium ml-1">{markerCount}</span> markers •
                        <span className="capitalize ml-1">{construction}</span>
                    </div>
                </div>

                {/* Action indicators */}
                {renderActionIndicators()}
            </div>

            {/* Debug info (development only) */}
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                    <summary className="text-xs text-wool-400 cursor-pointer">Debug Info</summary>
                    <pre className="text-xs text-wool-400 mt-1 p-2 bg-wool-50 rounded overflow-x-auto">
                        {JSON.stringify(stitchArray, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default MarkerArrayVisualization;