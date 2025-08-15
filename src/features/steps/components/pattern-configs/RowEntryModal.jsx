// src/features/steps/components/pattern-configs/RowEntryModal.jsx
import React from 'react';
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
    if (!isOpen) return null;

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const renderRunningTotal = () => {
        const calculation = getStitchCalculation();

        if (tempRowText && calculation && calculation.isValid) {
            const totalFormat = formatRunningTotal(
                calculation.previousStitches,
                calculation.totalStitches,
                calculation.stitchChange
            );
            return (
                <div className="text-sm mt-1 text-wool-600">
                    {totalFormat.baseText}
                    {totalFormat.changeText && (
                        <span className={`ml-1 ${totalFormat.changeColor}`}>
                            {totalFormat.changeText}
                        </span>
                    )}
                </div>
            );
        } else {
            const baseline = calculation?.previousStitches || 10;
            return (
                <div className="text-sm mt-1 text-wool-500">
                    {baseline} sts → {baseline} sts
                </div>
            );
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdrop}>
            {/* FIXED: Using new responsive modal sizing + no padding/gaps */}
            <div className="modal-content-light max-h-[95vh] overflow-y-auto">

                {/* FIXED: Connected header - no gaps, proper visual flow */}
                <div className="bg-sage-200 text-sage-800 px-6 py-4 rounded-t-2xl border-b-2 border-sage-300">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-sage-800 mb-1">
                                {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                <span className="text-sm font-normal text-sage-600 ml-2">
                                    ({getRowSide(currentRowNumber)})
                                </span>
                            </h3>
                            <div className="text-sage-700">
                                {renderRunningTotal()}
                            </div>
                        </div>

                        {/* FIXED: Clean, standardized close button */}
                        <button
                            onClick={onClose}
                            className="modal-close-md modal-close-light ml-4 flex-shrink-0"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* FIXED: Connected content - flows directly from header */}
                <div className="bg-white px-6 py-6">
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

                    <div className="mb-4">
                        {keyboardComponent}
                    </div>

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
                </div>
            </div>
        </div>
    );
};

export default RowEntryModal;