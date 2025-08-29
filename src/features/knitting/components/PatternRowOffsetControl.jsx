// src/features/knitting/components/PatternRowOffsetControl.jsx
import React, { useState } from 'react';
import { ChevronDown, RotateCw } from 'lucide-react';
import {
    getStepPatternInfo,
    calculatePatternOffset,
    getCurrentSide
} from '../../../shared/utils/sideIntelligence';

/**
 * Pattern Row Offset Control
 * Allows user to start a pattern on a specific row and side
 * Only appears on Row 1 of steps with repeating patterns
 */
const PatternRowOffsetControl = ({
    step,
    construction = 'flat',
    currentSide,
    onOffsetChange,
    onSideChange
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedRow, setSelectedRow] = useState(1);
    const [selectedSide, setSelectedSide] = useState(currentSide);

    const patternInfo = getStepPatternInfo(step);

    // Don't show if no repeating pattern
    if (!patternInfo || !patternInfo.hasRepeat || patternInfo.patternLength <= 1) {
        return null;
    }

    const handleRowChange = (patternRow) => {
        setSelectedRow(patternRow);

        // Calculate what side this pattern row should be
        const naturalSide = (patternRow % 2 === 1) ? 'RS' : 'WS';
        setSelectedSide(naturalSide);

        // Calculate offset and notify parent
        const offset = calculatePatternOffset(patternRow, naturalSide, construction, patternInfo.patternLength);
        onOffsetChange?.(offset);
        onSideChange?.(offset.adjustedStartingSide);
    };

    const handleSideToggle = () => {
        const newSide = selectedSide === 'RS' ? 'WS' : 'RS';
        setSelectedSide(newSide);

        // Calculate offset with the toggled side
        const offset = calculatePatternOffset(selectedRow, newSide, construction, patternInfo.patternLength);
        onOffsetChange?.(offset);
        onSideChange?.(offset.adjustedStartingSide);
    };

    const isDefault = selectedRow === 1 && selectedSide === 'RS';

    return (
        <div className="text-xs">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-800 transition-colors"
            >
                <span>Start on Row {selectedRow}{construction === 'flat' ? ` (${selectedSide})` : ''}</span>
                <ChevronDown
                    size={12}
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {isExpanded && (
                <div className="mt-2 p-3 bg-white border border-amber-200 rounded-md shadow-sm">
                    <div className="mb-2 text-amber-800 font-medium">
                        {patternInfo.patternName} ({patternInfo.patternLength} rows)
                    </div>

                    <div className="space-y-2">
                        {/* Row Selection */}
                        <div>
                            <label className="block text-amber-700 mb-1">Start on Pattern Row:</label>
                            <div className="flex gap-1 flex-wrap">
                                {Array.from({ length: patternInfo.patternLength }, (_, i) => i + 1).map(row => (
                                    <button
                                        key={row}
                                        onClick={() => handleRowChange(row)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${row === selectedRow
                                            ? 'bg-sage-500 text-white'
                                            : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                                            }`}
                                    >
                                        {row}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Side Toggle - Only for flat construction */}
                        {construction === 'flat' && (
                            <div>
                                <label className="block text-amber-700 mb-1">Side:</label>
                                <button
                                    onClick={handleSideToggle}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-50 transition-colors"
                                >
                                    <RotateCw size={10} />
                                    {selectedSide} <span className="text-amber-600">→ {selectedSide === 'RS' ? 'WS' : 'RS'}</span>
                                </button>
                            </div>
                        )}

                        {/* Reset to Default */}
                        {!isDefault && (
                            <button
                                onClick={() => handleRowChange(1)}
                                className="text-xs text-amber-600 hover:text-amber-800 underline"
                            >
                                Reset to Row 1 (RS)
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatternRowOffsetControl;