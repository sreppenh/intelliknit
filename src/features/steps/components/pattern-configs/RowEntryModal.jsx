// src/features/steps/components/pattern-configs/RowEntryModal.jsx
import React from 'react';
import { StandardModal } from '../../../../shared/components/StandardModal';
import { formatRunningTotal, getPreviousRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';

const RowEntryModal = ({
    isOpen,
    onClose,
    editingRowIndex,
    rowInstructions,
    tempRowText,
    setTempRowText,
    placeholderText,
    isMobile,
    currentRowNumber,
    getRowSide,
    getStitchCalculation,
    wizardData,
    currentProject,
    keyboardComponent,
    onSave
}) => {
    // 🔧 CORRECTED renderRunningTotal function:

    const renderRunningTotal = () => {
        const calculation = getStitchCalculation();

        // Debug what's happening when buttons are clicked
        console.log('🔧 renderRunningTotal called:', {
            tempRowText,
            calculation,
            hasCalculation: !!calculation,
            isValid: calculation?.isValid
        });

        // Default state - no pattern entered yet
        if (!tempRowText || !tempRowText.trim()) {
            const baseline = calculation?.previousStitches || 30;
            const netChange = 0 - baseline;

            return (
                <div className="text-sm bg-sage-50 border border-sage-200 rounded-lg p-3">
                    <span className="text-sage-600">
                        Started with <span className="font-bold text-sage-800">{baseline}</span>,
                        Consumed <span className="font-bold text-sage-800">0</span>,
                        Produced <span className="font-bold text-sage-800">0</span>
                    </span>
                    <span className={`font-bold ml-2 ${netChange < 0 ? 'text-red-600' : netChange > 0 ? 'text-green-600' : 'text-sage-600'}`}>
                        ({netChange > 0 ? '+' : ''}{netChange})
                    </span>
                </div>
            );
        }

        // Pattern entered - check if calculation is valid
        if (!calculation) {
            console.log('🚨 No calculation returned');
            return (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    Error: No calculation available
                </div>
            );
        }

        if (!calculation.isValid) {
            console.log('🚨 Invalid calculation:', calculation);
            return (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    Error: {calculation.error || 'Invalid pattern'}
                </div>
            );
        }

        // Valid calculation
        const started = calculation.previousStitches;
        const consumed = started; // Work with ALL the starting stitches
        const produced = calculation.totalStitches;
        const netChange = produced - consumed;

        console.log('🔧 Valid calculation display:', { started, consumed, produced, netChange });

        return (
            <div className="text-sm bg-sage-50 border border-sage-200 rounded-lg p-3">
                <span className="text-sage-600">
                    Started with <span className="font-bold text-sage-800">{started}</span>,
                    Consumed <span className="font-bold text-sage-800">{consumed}</span>,
                    Produced <span className="font-bold text-sage-800">{produced}</span>
                </span>
                <span className={`font-bold ml-2 ${netChange < 0 ? 'text-red-600' : netChange > 0 ? 'text-green-600' : 'text-sage-600'}`}>
                    ({netChange > 0 ? '+' : ''}{netChange})
                </span>
            </div>
        );
    };

    // 🧪 CORRECTED TEST EXPECTATIONS:

    const CORRECTED_TEST_CASES = [
        // === INITIAL STATE ===
        {
            input: "",
            expected: "Started with 30, Consumed 0, Produced 0 (-30)",
            description: "Empty modal - no pattern entered yet"
        },

        // === BASIC PATTERNS ===
        {
            input: "K all",
            expected: "Started with 30, Consumed 30, Produced 30 (0)",
            description: "Basic knit - work with all 30, produce 30"
        },
        {
            input: "P all",
            expected: "Started with 30, Consumed 30, Produced 30 (0)",
            description: "Basic purl - work with all 30, produce 30"
        },

        // === INCREASES ===
        {
            input: "K1, yo, K to end",
            expected: "Started with 30, Consumed 30, Produced 31 (+1)",
            description: "Yarn over increase - work with 30, produce 31"
        },
        {
            input: "K1, M1, K to end",
            expected: "Started with 30, Consumed 30, Produced 31 (+1)",
            description: "Make-one increase - work with 30, produce 31"
        },

        // === DECREASES ===
        {
            input: "K1, ssk, K to end",
            expected: "Started with 30, Consumed 30, Produced 29 (-1)",
            description: "Single decrease - work with 30, produce 29"
        },
        {
            input: "K1, k2tog, K to end",
            expected: "Started with 30, Consumed 30, Produced 29 (-1)",
            description: "Single decrease - work with 30, produce 29"
        },

        // === BALANCED LACE ===
        {
            input: "K1, yo, ssk, K to end",
            expected: "Started with 30, Consumed 30, Produced 30 (0)",
            description: "Balanced lace - work with 30, produce 30"
        },
        {
            input: "K1, k2tog, yo, K to end",
            expected: "Started with 30, Consumed 30, Produced 30 (0)",
            description: "Balanced lace - work with 30, produce 30"
        }
    ];

    const title = editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`;
    const subtitle = `${getRowSide(currentRowNumber)}`;

    return (
        <StandardModal
            isOpen={isOpen}
            onClose={onClose}
            category="complex"
            colorScheme="sage"
            title={`${title} (${subtitle})`}
            subtitle={null} // No subtitle, everything in title
            showButtons={false} // Custom layout
        >
            {/* Running total display */}
            <div className="mb-4">
                {renderRunningTotal()}
            </div>

            {/* Text input */}
            <div className="mb-4">
                <textarea
                    value={tempRowText}
                    onChange={(e) => setTempRowText(e.target.value)}
                    placeholder={placeholderText}
                    rows={3}
                    className="w-full border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                    autoFocus={!isMobile}
                    readOnly={isMobile}
                    inputMode={isMobile ? "none" : "text"}
                    onTouchStart={(e) => {
                        if (isMobile) {
                            e.preventDefault();
                        }
                    }}
                />
            </div>

            {/* Keyboard component */}
            <div className="mb-4">
                {keyboardComponent}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border-2 border-wool-200 rounded-lg text-wool-600 hover:bg-wool-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={!tempRowText.trim()}
                    className="flex-1 py-3 px-4 bg-sage-500 text-white rounded-lg hover:bg-sage-600 disabled:bg-wool-300 disabled:cursor-not-allowed transition-colors"
                >
                    {editingRowIndex === null ? 'Add Row' : 'Save Row'}
                </button>
            </div>
        </StandardModal>
    );
};

export default RowEntryModal;