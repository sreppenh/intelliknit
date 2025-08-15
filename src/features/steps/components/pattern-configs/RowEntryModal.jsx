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
            <div className={`modal-content-light w-full max-h-[95vh] overflow-y-auto max-w-lg md:max-w-3xl`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div>
                                <h3 className="text-lg font-semibold text-wool-700">
                                    {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                    <span className="text-sm font-normal text-wool-500 ml-2">
                                        ({getRowSide(currentRowNumber)})
                                    </span>
                                </h3>
                                {renderRunningTotal()}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-sage-600 hover:text-sage-800 hover:bg-sage-200 rounded-full w-12 h-12 flex items-center justify-center transition-colors font-bold"
                            style={{ fontSize: '2rem' }}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

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