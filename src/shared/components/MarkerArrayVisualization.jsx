// src/shared/components/MarkerArrayVisualization.jsx
import React from 'react';
import markerArrayUtils from '../utils/markerArrayUtils';

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
                        <div className="bg-wool-100 border border-wool-300 rounded px-3 py-2 min-w-[60px] text-center">
                            <div className="text-sm font-medium">{item}</div>
                            <div className="text-xs text-wool-600">
                                {item === 1 ? 'stitch' : 'stitches'}
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Marker
                const isSpecialMarker = item === 'BOR';
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className={`border-2 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${isSpecialMarker
                                ? 'bg-sage-200 border-sage-400 text-sage-700'
                                : 'bg-lavender-200 border-lavender-400 text-lavender-700'
                            }`}>
                            {isSpecialMarker ? '●' : item}
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
                        <div className="bg-wool-100 border border-wool-300 rounded px-3 py-2 min-w-[60px] text-center">
                            <div className="text-sm font-medium">{item}</div>
                            <div className="text-xs text-wool-600">
                                {item === 1 ? 'stitch' : 'stitches'}
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Marker
                const isSpecialMarker = item === 'BOR';
                elements.push(
                    <div key={index} className="flex items-center">
                        <div className={`border-2 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold ${isSpecialMarker
                                ? 'bg-sage-200 border-sage-400 text-sage-700'
                                : 'bg-lavender-200 border-lavender-400 text-lavender-700'
                            }`}>
                            {isSpecialMarker ? '●' : item}
                        </div>
                    </div>
                );
            }
        });

        return (
            <div className="flex items-center gap-2 justify-center flex-wrap">
                {elements}
                <div className="text-sage-600 text-lg ml-2">↻</div>
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
            <div className="bg-white border border-wool-200 rounded-lg p-4">
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