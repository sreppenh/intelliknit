// src/features/steps/components/pattern-configs/RowEntryModal.jsx
import React from 'react';
import { StandardModal } from '../../../../shared/components/modals/StandardModal';
import { formatRunningTotal, getPreviousRowStitches, calculateRowStitchesLive, calculateRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';
import { isRowComplete } from '../../../../shared/utils/stitchCalculatorUtils';
import { getKeyboardPatternKey } from '../../../../shared/utils/stepDisplayUtils';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

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
    construction,
    keyboardComponent,
    onSave
}) => {
    // 🔧 CORRECTED renderRunningTotal function:
    // PHASE 2: In RowEntryModal.jsx - Update renderRunningTotal with validation

    const terms = getConstructionTerms(construction);

    const renderRunningTotal = () => {
        const calculation = getStitchCalculation();

        // Default state - no pattern entered yet
        if (!tempRowText || !tempRowText.trim()) {
            const baseline = calculation?.previousStitches || 30;
            return (
                <div className="text-xs bg-sage-50 border border-sage-200 rounded-lg p-3">
                    <span className="text-sage-600">
                        Started with <span className="font-bold text-sage-800">{baseline}</span>, no pattern yet
                    </span>
                </div>
            );
        }

        // Check if we're in "calculating" mode (open brackets/parens)
        if (calculation?.isCalculating) {
            return (
                <div className="text-xs bg-yarn-50 border border-yarn-200 rounded-lg p-3">
                    <span className="text-yarn-600">
                        <span className="font-bold text-yarn-800">Calculating...</span>
                        <span className="ml-2 text-xs">(close all brackets and parentheses)</span>
                    </span>
                </div>
            );
        }

        // Pattern entered - check if calculation is valid
        if (!calculation || !calculation.isValid) {
            return (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    Error: {calculation?.error || 'Invalid pattern'}
                </div>
            );
        }

        // Valid calculation - show results with validation
        const started = calculation.previousStitches;
        const consumed = calculation.stitchesConsumed;
        const produced = calculation.totalStitches;
        const netChange = produced - consumed;
        const remaining = started - consumed;

        // Determine validation status
        const isComplete = consumed === started;
        const hasOverconsumed = consumed > started;
        const isIncomplete = consumed < started && consumed > 0;

        return (
            <div className="space-y-2">
                {/* Main calculation display */}
                <div className="text-xs bg-sage-50 border border-sage-200 rounded-lg p-3">
                    <span className="text-sage-600">
                        Started with <span className="font-bold text-sage-800">{started}</span>,
                        Consumed <span className="font-bold text-sage-800">{consumed}</span>,
                        Produced <span className="font-bold text-sage-800">{produced}</span>
                    </span>
                    <span className={`font-bold ml-2 ${netChange < 0 ? 'text-red-600' : netChange > 0 ? 'text-green-600' : 'text-sage-600'}`}>
                        ({netChange > 0 ? '+' : ''}{netChange})
                    </span>
                </div>

                {/* Validation status */}
                {isComplete && (
                    <div className="text-xs bg-green-50 border border-green-200 rounded-lg p-2">
                        <span className="text-green-700 font-medium">✅ Row complete!</span>
                        <span className="text-green-600 ml-2">All stitches consumed</span>
                    </div>
                )}

                {hasOverconsumed && (
                    <div className="text-xs bg-red-50 border border-red-200 rounded-lg p-2">
                        <span className="text-red-700 font-medium">❌ Overconsumed!</span>
                        <span className="text-red-600 ml-2">Pattern uses {consumed - started} too many stitches</span>
                    </div>
                )}

                {isIncomplete && (
                    <div className="text-xs bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <span className="text-yellow-700 font-medium">⚠️ Incomplete row</span>
                        <span className="text-yellow-600 ml-2">{remaining} stitches remaining</span>
                    </div>
                )}
            </div>
        );
    };




    // Replace getRowCompletionStatus function:
    const getRowCompletionStatus = () => {
        const calculation = getStitchCalculation();
        if (!calculation || !calculation.isValid) {
            return { isComplete: false, reason: 'invalid' };
        }

        const customActionsLookup = {};
        const patternType = wizardData?.stitchPattern?.pattern;
        const patternKey = getKeyboardPatternKey(patternType);
        const customActions = currentProject?.customKeyboardActions?.[patternKey] || [];

        customActions.forEach(customAction => {
            if (typeof customAction === 'object' && customAction.name) {
                customActionsLookup[customAction.name] = {
                    consumes: customAction.consumed,  // ✅ Map to correct property
                    produces: customAction.stitches   // ✅ Map to correct property
                };
            }
        });

        return isRowComplete(tempRowText, calculation.previousStitches, customActionsLookup);
    };

    const title = editingRowIndex === null
        ? `${terms.Row} ${rowInstructions.length + 1}`
        : `Edit ${terms.Row} ${editingRowIndex + 1}`;

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

            {/* Action buttons - hide when in numbers or button_edit mode */}
            {keyboardComponent?.props?.keyboardMode !== 'numbers' &&
                keyboardComponent?.props?.keyboardMode !== 'button_edit' && (
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border-2 border-wool-200 rounded-lg text-wool-600 hover:bg-wool-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={!getRowCompletionStatus().isComplete}
                            className={`flex-1 py-3 px-4 rounded-lg transition-colors ${getRowCompletionStatus().isComplete
                                ? 'bg-sage-500 text-white hover:bg-sage-600'
                                : 'bg-wool-300 text-wool-500 cursor-not-allowed'
                                }`}
                            title={
                                !getRowCompletionStatus().isComplete && getRowCompletionStatus().reason === 'incomplete'
                                    ? `Row incomplete - ${getRowCompletionStatus().remaining || 0} stitches remaining`
                                    : undefined
                            }
                        >
                            {editingRowIndex === null ? `Add ${terms.Row}` : `Save ${terms.Row}`}
                        </button>
                    </div>
                )}
        </StandardModal>
    );
};

export default RowEntryModal;