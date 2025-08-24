// src/features/steps/components/pattern-configs/NumberKeyboard.jsx
import React from 'react';

const NumberKeyboard = ({
    onAction,
    pendingText,
    currentNumber,
    mode = 'repeat', // 'repeat' | 'copy_row'
    maxRowNumber = 0 // For copy row validation
}) => {

    const handleNumberClick = (num) => {
        if (mode === 'repeat') {
            // Existing repeat logic
            if (num === '0') {
                const currentMultiplier = pendingText.match(/×\s*(\d*)$/)?.[1] || '';
                if (currentMultiplier === '') {
                    // Don't allow plain "×0" - do nothing
                    return;
                }
            }
            onAction(num);
        } else if (mode === 'copy_row') {
            // Copy row mode - build row number
            const newNumber = (currentNumber || '') + num;
            const rowNum = parseInt(newNumber);

            // Validate row number doesn't exceed available rows
            if (rowNum <= maxRowNumber) {
                onAction(num);
            }
            // If invalid, don't add the digit (do nothing)
        }
    };

    const handleEnter = () => {
        if (mode === 'copy_row') {
            const rowNum = parseInt(currentNumber);
            // Validate row number is valid (1-based indexing)
            if (rowNum >= 1 && rowNum <= maxRowNumber) {
                onAction('Enter');
            }
            // If invalid, don't submit (do nothing)
        } else {
            // Existing repeat logic
            onAction('Enter');
        }
    };

    // Generate display text based on mode
    const getDisplayText = () => {
        if (mode === 'copy_row') {
            if (currentNumber && currentNumber !== '') {
                const rowNum = parseInt(currentNumber);
                if (rowNum >= 1 && rowNum <= maxRowNumber) {
                    return `Copy Row ${currentNumber}`;
                } else {
                    return `Row ${currentNumber} (invalid)`;
                }
            }
            return 'Enter row number (1-' + maxRowNumber + ')';
        } else {
            // Existing repeat mode display
            return pendingText && pendingText !== '' ? pendingText : (currentNumber || '0');
        }
    };

    const getPromptText = () => {
        if (mode === 'copy_row') {
            return 'Which row to copy?';
        } else {
            return pendingText && pendingText !== '' ? 'How many times?' : 'Enter number:';
        }
    };

    // Check if Enter should be enabled
    const isEnterEnabled = () => {
        if (mode === 'copy_row') {
            const rowNum = parseInt(currentNumber);
            return rowNum >= 1 && rowNum <= maxRowNumber;
        }
        return true; // Default for repeat mode
    };

    return (
        <div className="space-y-3">
            {/* Show current input being built */}
            <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-3">
                <div className="text-sm font-medium text-lavender-700 mb-1">
                    {getPromptText()}
                </div>
                <div className={`text-base font-mono ${mode === 'copy_row' && currentNumber &&
                        (parseInt(currentNumber) < 1 || parseInt(currentNumber) > maxRowNumber)
                        ? 'text-red-600'
                        : 'text-wool-700'
                    }`}>
                    {getDisplayText()}
                </div>
                {/* Show validation hint for copy mode */}
                {mode === 'copy_row' && maxRowNumber > 0 && (
                    <div className="text-xs text-lavender-600 mt-1">
                        Valid range: 1-{maxRowNumber}
                    </div>
                )}
            </div>

            {/* Number grid: 1-9 */}
            <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="h-12 bg-sage-100 text-sage-700 rounded-lg text-lg font-medium hover:bg-sage-200 transition-colors"
                    >
                        {num}
                    </button>
                ))}
            </div>

            {/* Bottom row: Backspace, 0, Enter */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => onAction('⌫')}
                    className="h-12 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 border border-red-200 transition-colors"
                >
                    ⌫
                </button>
                <button
                    onClick={() => handleNumberClick('0')}
                    className="h-12 bg-sage-100 text-sage-700 rounded-lg text-lg font-medium hover:bg-sage-200 transition-colors"
                >
                    0
                </button>
                <button
                    onClick={handleEnter}
                    className={`h-12 rounded-lg text-sm font-medium transition-colors ${isEnterEnabled()
                            ? 'bg-sage-500 text-white hover:bg-sage-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    disabled={!isEnterEnabled()}
                >
                    ✓
                </button>
            </div>
        </div>
    );
};

export default NumberKeyboard;