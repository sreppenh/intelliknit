// src/features/steps/components/pattern-configs/IncrementInputNumberMode.jsx
import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { calculateRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';

/**
 * IncrementInputNumberMode - Advanced pattern multiplier input
 * 
 * Provides +/- interface with stitch validation for Cable/Lace patterns.
 * Replicates NumberKeyboard's exact state behavior for seamless integration.
 */
const IncrementInputNumberMode = ({
    // Core display props
    pendingText,
    currentNumber,
    tempRowText,

    // Advanced pattern features
    getStitchCalculation,
    currentProject,
    patternType,

    // Direct state access for replicating NumberKeyboard behavior
    directStateAccess
}) => {

    const [currentMultiplier, setCurrentMultiplier] = useState(1);
    const [maxMultiplier, setMaxMultiplier] = useState(99);

    // Extract current multiplier from pendingText (same as NumberKeyboard)
    useEffect(() => {
        if (!pendingText || pendingText === '') {
            setCurrentMultiplier(1);
            return;
        }

        const multiplierMatch = pendingText.match(/×\s*(\d+)$/);
        if (multiplierMatch) {
            setCurrentMultiplier(parseInt(multiplierMatch[1]));
        } else {
            setCurrentMultiplier(1);
        }
    }, [pendingText]);

    // Calculate max multiplier based on remaining stitches
    useEffect(() => {
        if (!pendingText || pendingText === '') {
            setMaxMultiplier(99);
            return;
        }

        // Extract bracket content
        const bracketMatch = pendingText.match(/^(\[.*?\]|\(.*?\))/);
        if (!bracketMatch) {
            setMaxMultiplier(99);
            return;
        }

        const bracketContent = bracketMatch[1];

        // Get current row calculation INCLUDING everything typed so far
        const calculation = getStitchCalculation();
        if (!calculation || !calculation.isValid) {
            setMaxMultiplier(1);
            return;
        }

        // Calculate remaining stitches after current row consumption
        const startingStitches = calculation.previousStitches;
        const alreadyConsumed = calculation.stitchesConsumed;
        const remainingStitches = startingStitches - alreadyConsumed;

        // Build custom actions lookup
        const customActionsLookup = {};
        const patternKey = patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
        const customActions = currentProject?.customKeyboardActions?.[patternKey] || [];

        customActions.forEach(action => {
            if (typeof action === 'object' && action.name) {
                customActionsLookup[action.name] = {
                    consumes: action.consumed || 1,
                    produces: action.stitches || 1
                };
            }
        });

        // Calculate consumption per repeat for JUST this bracket
        try {
            const bracketResult = calculateRowStitches(bracketContent, 100, customActionsLookup); // Use dummy starting stitches
            const consumedPerRepeat = bracketResult.stitchesConsumed;

            if (consumedPerRepeat > 0 && remainingStitches > 0) {
                const maxRepeats = Math.floor(remainingStitches / consumedPerRepeat);
                setMaxMultiplier(Math.max(1, maxRepeats));
            } else if (remainingStitches <= 0) {
                setMaxMultiplier(1); // Can't consume more than available
            } else {
                setMaxMultiplier(99); // No consumption, unlimited repeats
            }

        } catch (error) {
            console.warn('Error calculating bracket consumption:', error);
            setMaxMultiplier(1);
        }

    }, [pendingText, tempRowText, getStitchCalculation, currentProject, patternType]);

    // Handle multiplier change - update pendingText immediately (like NumberKeyboard)
    const handleMultiplierChange = (newValue) => {
        const multiplier = parseInt(newValue) || 1;
        setCurrentMultiplier(multiplier);

        if (!pendingText || pendingText === '' || !directStateAccess) {
            return;
        }

        // Replicate NumberKeyboard's exact state update
        // Remove existing multiplier and add new one
        const currentText = pendingText.replace(/\s*×\s*\d*$/, '');
        const newText = multiplier === 1 ? currentText : `${currentText} × ${multiplier}`;

        // Update pendingRepeatText directly (same as NumberKeyboard digit input)
        directStateAccess.setPendingRepeatText(newText);
    };

    // Handle Save - replicate NumberKeyboard's Enter behavior exactly
    const handleSave = () => {
        if (!directStateAccess) return;

        // EXACT replication of handleNumberInput Enter logic
        if (!pendingText || pendingText === '') {
            // Manual mode
            const numberDisplay = currentNumber || '';
            if (numberDisplay) {
                directStateAccess.setTempRowText(prev => prev ? `${prev}, ${currentNumber}` : currentNumber);
            }
        } else {
            // BRACKET MODE: Extract multiplier and append to tempRowText
            const multiplier = pendingText.match(/×\s*(\d+)$/)?.[1];
            if (multiplier) {
                directStateAccess.setTempRowText(prev => `${prev} × ${multiplier}`);
            }
        }

        // Reset state (same as NumberKeyboard)
        directStateAccess.setKeyboardMode('pattern');
        directStateAccess.setPendingRepeatText('');
        directStateAccess.setCurrentNumber('');
    };

    // Handle Cancel - replicate NumberKeyboard's Cancel behavior exactly
    const handleCancel = () => {
        if (!directStateAccess) return;

        // Same state reset as NumberKeyboard
        directStateAccess.setKeyboardMode('pattern');
        directStateAccess.setPendingRepeatText('');
        directStateAccess.setCurrentNumber('');
    };

    return (
        <div className="space-y-4">
            {/* Preview Box - matches NumberKeyboard */}
            <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-4">
                <div className="text-sm font-medium text-lavender-700 mb-2">
                    How many times?
                </div>

                {/* Display current pendingText */}
                <div className="text-base font-mono text-wool-700 mb-3">
                    {pendingText && pendingText !== '' ? pendingText : (currentNumber || '0')}
                </div>
            </div>

            {/* IncrementInput Controls */}
            <div className="bg-white border-2 border-sage-200 rounded-lg p-4">
                <div className="mb-3">
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                        Repeat Count
                    </label>
                    <IncrementInput
                        value={currentMultiplier}
                        onChange={handleMultiplierChange}
                        min={1}
                        max={maxMultiplier}
                        label="repeats"
                        size="lg"
                        className="justify-center"
                    />
                </div>

                {/* Validation message */}
                {maxMultiplier < 99 && (
                    <div className="text-xs text-sage-600 mb-3 text-center">
                        Maximum {maxMultiplier} repeats (limited by available stitches)
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleCancel}
                    className="h-12 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 border border-red-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="h-12 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors"
                >
                    ✓ Save
                </button>
            </div>
        </div>
    );
};

export default IncrementInputNumberMode;