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
    const renderRunningTotal = () => {
        const calculation = getStitchCalculation();

        if (tempRowText && calculation && calculation.isValid) {
            const totalFormat = formatRunningTotal(
                calculation.previousStitches,
                calculation.totalStitches,
                calculation.stitchChange
            );
            return (
                <div className="text-sm text-sage-600">
                    {totalFormat.baseText}
                    {totalFormat.changeText && (
                        <span className={`ml-1 ${totalFormat.changeColor}`}>
                            {totalFormat.changeText}
                        </span>
                    )}
                </div>
            );
        } else {
            // Better baseline calculation - get actual previous stitches
            const baseline = calculation?.previousStitches ||
                (rowInstructions.length > 0 ?
                    rowInstructions[rowInstructions.length - 1]?.endingStitches :
                    wizardData?.stitchCount ||
                    currentProject?.components?.[0]?.steps?.[0]?.startingStitches ||
                    10);
            return (
                <div className="text-sm text-sage-500">
                    {baseline} sts → {baseline} sts
                </div>
            );
        }
    };

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