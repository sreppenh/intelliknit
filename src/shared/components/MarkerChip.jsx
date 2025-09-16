import React from 'react';

// Marker color configuration
const getMarkerColor = (markerName, markerColors) => {
    if (markerName === 'BOR') {
        return { bg: 'bg-lavender-200', border: 'border-lavender-500', text: 'text-lavender-700' };
    }
    const MARKER_COLOR_OPTIONS = [
        { bg: 'bg-sage-100', border: 'border-sage-400', text: 'text-sage-700' },
        { bg: 'bg-yarn-600', border: 'border-yarn-700', text: 'text-yarn-50' },
        { bg: 'bg-yarn-100', border: 'border-yarn-400', text: 'text-yarn-700' },
        { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-800' }
    ];
    const colorIndex = markerColors[markerName] || 0;
    return MARKER_COLOR_OPTIONS[colorIndex];
};

const MarkerChip = ({
    marker,
    active,
    onClick,
    markerColors,
    disabled = false
}) => {
    const style = getMarkerColor(marker, markerColors);

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`relative px-3 py-2 rounded-full font-medium transition-colors 
                ${disabled
                    ? 'opacity-50 cursor-not-allowed bg-wool-100 text-wool-400'
                    : active
                        ? `${style.bg} ${style.text} card-marker-select-compact-selected`
                        : `${style.bg} ${style.text} hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`
                }`}
        >
            {marker}
            {active && !disabled && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                </div>
            )}
        </button>
    );
};

export default MarkerChip;