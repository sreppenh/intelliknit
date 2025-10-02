// src/features/knitting/components/SimpleRowSettings.jsx
import React, { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import { getStepPatternInfo } from '../../../shared/utils/sideIntelligence';
import { isAlgorithmicPattern, getPatternMetadata } from '../../../shared/utils/AlgorithmicPatterns';
import IncrementInput from '../../../shared/components/IncrementInput';
import { getPatternRowOffset, getColorRowOffset } from '../../../shared/utils/progressTracking';

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
    onPatternRowChange,
    lengthTarget = null,
    startingLength = null,
    onStartingLengthChange = null,
    defaultExpanded = false,
    component = null,
    stepIndex = null,
    project = null,
    onContinuationChange = null
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const patternInfo = getStepPatternInfo(step);
    const [selectedPatternRow, setSelectedPatternRow] = useState(1);

    // ✅ NEW: Continuation state
    const [resetPattern, setResetPattern] = useState(false);
    const [resetColor, setResetColor] = useState(false);

    // ✅ NEW: Calculate continuation offsets
    const patternOffset = component && stepIndex !== null && project
        ? getPatternRowOffset(step, component, stepIndex, project.id)
        : 0;

    const colorOffset = component && stepIndex !== null && project
        ? getColorRowOffset(step, component, stepIndex, project.id)
        : 0;

    // ✅ NEW: Show toggles only if there's an actual offset
    const showPatternContinuation = patternOffset > 0;
    const showColorContinuation = colorOffset > 0;

    // ✅ NEW: Handle continuation toggle changes
    const handleResetPatternChange = (checked) => {
        setResetPattern(checked);
        onContinuationChange?.({ resetPattern: checked, resetColor });
    };

    const handleResetColorChange = (checked) => {
        setResetColor(checked);
        onContinuationChange?.({ resetPattern, resetColor: checked });
    };


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
    if (!showSideToggle && !showPatternRows && lengthTarget?.type !== 'until_length' && !showPatternContinuation && !showColorContinuation) {
        return null;
    }

    return (
        <div className="mb-4">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 bg-yarn-50 hover:bg-yarn-100 border border-yarn-200 rounded-lg transition-colors text-left"  >
                <div className="flex items-center gap-2 text-xs text-yarn-800">
                    <Settings size={12} />
                    <span className="font-medium">Row 1 Settings</span>
                </div>

                <ChevronDown
                    size={16}
                    className={`text-yarn-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="mt-1 p-3 bg-yarn-50 border border-yarn-200 rounded-lg border-t-0 rounded-t-none">
                    <div className="space-y-3">

                        {/* Until-Length Starting Measurement */}
                        {lengthTarget?.type === 'until_length' && (
                            <div>
                                <label className="form-label-sm">
                                    Current piece length
                                </label>
                                <div className="flex items-center gap-2">
                                    <IncrementInput
                                        value={startingLength || ''}
                                        onChange={onStartingLengthChange}
                                        label="current distance knit"
                                        min={0}
                                        max={lengthTarget.value}
                                        useDecimals={true}
                                        step={0.25}
                                        size="sm"
                                    />
                                    <span className="text-sm text-yarn-700">
                                        {lengthTarget.units}
                                    </span>
                                </div>
                                <div className="text-xs text-yarn-600 mt-1">
                                    How long is your piece currently?
                                </div>
                            </div>
                        )}


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

                        {/* ✅ NEW: Pattern Continuation Toggle */}
                        {showPatternContinuation && (
                            <div className="pt-3 border-t border-yarn-200">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={resetPattern}
                                        onChange={(e) => handleResetPatternChange(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 text-sage-600 border-wool-300 rounded focus:ring-sage-500"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-wool-700">
                                            Reset pattern to Row 1
                                        </div>
                                        <div className="text-xs text-wool-600 mt-0.5">
                                            Previous step ended on row {patternOffset}. Check this to start fresh.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* ✅ NEW: Color Continuation Toggle */}
                        {showColorContinuation && (
                            <div className={showPatternContinuation ? '' : 'pt-3 border-t border-yarn-200'}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={resetColor}
                                        onChange={(e) => handleResetColorChange(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 text-sage-600 border-wool-300 rounded focus:ring-sage-500"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-wool-700">
                                            Reset color sequence
                                        </div>
                                        <div className="text-xs text-wool-600 mt-0.5">
                                            Previous step ended on row {colorOffset} of stripe pattern. Check this to start fresh.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleRowSettings;