// src/features/knitting/components/SimpleRowSettings.jsx
import React, { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import { getStepPatternInfo } from '../../../shared/utils/sideIntelligence';
import { isAlgorithmicPattern, getPatternMetadata } from '../../../shared/utils/AlgorithmicPatterns';

/**
 * Simple Row 1 Settings
 * Collapsible, mobile-friendly controls for side and pattern row adjustment
 * Only appears on Row 1, uses existing IntelliKnit components
 */
const SimpleRowSettings = ({
    step,
    construction,
    currentSide,
    onSideChange,
    onPatternRowChange
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const patternInfo = getStepPatternInfo(step);
    const [selectedPatternRow, setSelectedPatternRow] = useState(1);

    const handleSideToggle = (newSide) => {
        onSideChange?.(newSide);
    };

    const handlePatternRowChange = (patternRow) => {
        setSelectedPatternRow(patternRow);
        onPatternRowChange?.(patternRow);
    };

    // Use existing IntelliKnit intelligence with construction awareness
    const shouldShowPatternRows = () => {
        if (!patternInfo?.hasRepeat || patternInfo.patternLength <= 1) return false;

        // Use the existing algorithmic pattern system intelligence  
        if (isAlgorithmicPattern(patternInfo.patternName)) {
            const metadata = getPatternMetadata(patternInfo.patternName);
            const rowHeight = metadata?.rowHeight || patternInfo.patternLength;

            // For flat construction: only show if rowHeight > 2 (more than just RS/WS)
            if (construction === 'flat') {
                return rowHeight > 2;
            }

            // For round construction: show if rowHeight > 1 (any pattern variation)
            if (construction === 'round') {
                return rowHeight > 1;
            }
        }

        // Also check for custom patterns with explicit row instructions
        const hasCustomInstructions = step.wizardConfig?.stitchPattern?.customText ||
            step.wizardConfig?.stitchPattern?.customDetails;

        return hasCustomInstructions;
    };

    // Generate smart pattern row options with meaningful labels
    const getPatternRowOptions = () => {
        if (!shouldShowPatternRows()) return [];

        const options = [];

        // For Garter in round, use descriptive names
        if (patternInfo.patternName === 'Garter' && construction === 'round') {
            options.push(
                { value: 1, label: 'Knit Round' },
                { value: 2, label: 'Purl Round' }
            );
        }
        // For other patterns, use numbered rows with pattern name
        else {
            for (let i = 1; i <= patternInfo.patternLength; i++) {
                options.push({
                    value: i,
                    label: `Row ${i}`
                });
            }
        }

        return options;
    };

    const patternRowOptions = getPatternRowOptions();
    const showSideToggle = construction === 'flat';
    const showPatternRows = patternRowOptions.length > 1;

    // Don't render anything if there are no controls to show
    if (!showSideToggle && !showPatternRows) {
        return null;
    }

    return (
        <div className="mb-4">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors text-left"
            >
                <div className="flex items-center gap-2 text-sm text-amber-800">
                    <Settings size={14} />
                    <span className="font-medium">Row 1 Settings</span>
                    <span className="text-xs text-amber-600">
                        (optional adjustments)
                    </span>
                </div>

                <ChevronDown
                    size={16}
                    className={`text-amber-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl border-t-0 rounded-t-none">
                    <div className="space-y-4">

                        {/* Side Toggle - only for flat construction */}
                        {showSideToggle && (
                            <div>
                                <SegmentedControl
                                    label="Starting Side"
                                    value={currentSide}
                                    onChange={handleSideToggle}
                                    options={[
                                        { value: 'RS', label: 'Right Side' },
                                        { value: 'WS', label: 'Wrong Side' }
                                    ]}
                                    className="text-sm"
                                />
                            </div>
                        )}

                        {/* Pattern Row Selection - only for patterns with meaningful row differences */}
                        {showPatternRows && (
                            <div>
                                <label className="form-label-sm">
                                    Start on Pattern Row
                                </label>
                                <select
                                    value={selectedPatternRow}
                                    onChange={(e) => handlePatternRowChange(parseInt(e.target.value))}
                                    className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                    style={{ fontSize: '16px', minHeight: '44px' }}
                                >
                                    {patternRowOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label} of {patternInfo.patternName}
                                        </option>
                                    ))}
                                </select>

                                {/* Pattern info */}
                                <div className="form-help">
                                    {patternInfo.patternName} pattern ({patternInfo.patternLength} row repeat)
                                </div>
                            </div>
                        )}

                        {/* Help text */}
                        <div className="text-xs text-amber-700 bg-amber-100 rounded-lg p-2">
                            💡 Only adjust these if you're continuing from a specific row in your pattern chart or written instructions
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleRowSettings;