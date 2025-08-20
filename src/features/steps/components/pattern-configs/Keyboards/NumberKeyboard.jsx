// src/features/steps/components/pattern-configs/NumberKeyboard.jsx
import React from 'react';

const NumberKeyboard = ({ onAction, pendingText, currentNumber }) => {

    const handleNumberClick = (num) => {
        // Prevent starting with 0 (but allow 0 after other digits)
        if (num === '0') {
            const currentMultiplier = pendingText.match(/×\s*(\d*)$/)?.[1] || '';
            if (currentMultiplier === '') {
                // Don't allow plain "×0" - do nothing
                return;
            }
        }
        onAction(num);
    };

    return (
        <div className="space-y-3">
            {/* Show current repeat being built */}
            <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-3">
                <div className="text-sm font-medium text-lavender-700 mb-1">
                    {pendingText && pendingText !== '' ? 'How many times?' : 'Enter number:'}
                </div>
                <div className="text-base font-mono text-wool-700">
                    {pendingText && pendingText !== '' ? pendingText : (currentNumber || '0')}
                </div>
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
                    onClick={() => onAction('Enter')}
                    className="h-12 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors"
                >
                    ✓
                </button>
            </div>
        </div>
    );
};

export default NumberKeyboard;