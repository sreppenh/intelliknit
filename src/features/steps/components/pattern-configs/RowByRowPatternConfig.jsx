import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

const CustomPatternConfig = ({ wizardData, updateWizardData, construction }) => {
    // ===== ROW-BY-ROW STATE MANAGEMENT =====
    const [showRowEntryOverlay, setShowRowEntryOverlay] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempRowText, setTempRowText] = useState('');

    // Initialize entryMode if not set (backwards compatibility)
    const currentEntryMode = wizardData.stitchPattern.entryMode || 'description';
    const rowInstructions = wizardData.stitchPattern.rowInstructions || [];

    // ===== MODE TOGGLE HANDLING =====
    const handleModeToggle = (newMode) => {
        updateWizardData('stitchPattern', {
            entryMode: newMode,
            // Initialize rowInstructions array if switching to row-by-row
            rowInstructions: newMode === 'row_by_row' ? rowInstructions : wizardData.stitchPattern.rowInstructions
        });
    };

    // ===== ROW MANAGEMENT =====
    const handleAddRow = () => {
        setEditingRowIndex(null); // null means new row
        setTempRowText('');
        setShowRowEntryOverlay(true);
    };

    const handleEditRow = (index) => {
        setEditingRowIndex(index);
        setTempRowText(rowInstructions[index] || '');
        setShowRowEntryOverlay(true);
    };

    const handleSaveRow = () => {
        if (!tempRowText.trim()) return;

        let updatedInstructions = [...rowInstructions];

        if (editingRowIndex === null) {
            // Adding new row
            updatedInstructions.push(tempRowText.trim());
        } else {
            // Editing existing row
            updatedInstructions[editingRowIndex] = tempRowText.trim();
        }

        updateWizardData('stitchPattern', {
            rowInstructions: updatedInstructions,
            rowsInPattern: updatedInstructions.length.toString() // Auto-update count
        });

        setShowRowEntryOverlay(false);
        setTempRowText('');
        setEditingRowIndex(null);
    };

    const handleDeleteRow = (index) => {
        const updatedInstructions = rowInstructions.filter((_, i) => i !== index);
        updateWizardData('stitchPattern', {
            rowInstructions: updatedInstructions,
            rowsInPattern: updatedInstructions.length.toString()
        });
    };

    // ===== UTILITY FUNCTIONS =====
    const getRowSide = (rowNumber) => {
        if (construction === 'round') return 'RS';
        return rowNumber % 2 === 1 ? 'RS' : 'WS';
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'k_all':
                setTempRowText('Knit all stitches');
                break;
            case 'p_all':
                setTempRowText('Purl all stitches');
                break;
            default:
                if (action.startsWith('copy_')) {
                    const rowIndex = parseInt(action.split('_')[1]);
                    setTempRowText(rowInstructions[rowIndex] || '');
                }
        }
    };

    const handleOverlayBackdrop = (e) => {
        if (e.target === e.currentTarget) {
            setShowRowEntryOverlay(false);
        }
    };

    return (
        <div className="stack-lg">
            {/* Entry Mode Toggle */}
            <div>
                <label className="form-label">Pattern Entry Method</label>
                <div className="flex gap-3">
                    <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${currentEntryMode === 'description'
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                        }`}>
                        <input
                            type="radio"
                            name="entry_mode"
                            value="description"
                            checked={currentEntryMode === 'description'}
                            onChange={() => handleModeToggle('description')}
                            className="sr-only"
                        />
                        <div className="text-center">
                            <div className="text-2xl mb-2">📝</div>
                            <div className="font-semibold">Description</div>
                            <div className="text-sm opacity-75">Traditional text description</div>
                        </div>
                    </label>

                    <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${currentEntryMode === 'row_by_row'
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                        }`}>
                        <input
                            type="radio"
                            name="entry_mode"
                            value="row_by_row"
                            checked={currentEntryMode === 'row_by_row'}
                            onChange={() => handleModeToggle('row_by_row')}
                            className="sr-only"
                        />
                        <div className="text-center">
                            <div className="text-2xl mb-2">📋</div>
                            <div className="font-semibold">Row-by-Row</div>
                            <div className="text-sm opacity-75">Enter each row individually</div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Description Mode */}
            {currentEntryMode === 'description' && (
                <div>
                    <label className="form-label">Pattern Description</label>
                    <textarea
                        value={wizardData.stitchPattern.customText || ''}
                        onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
                        placeholder="e.g., '5 rows stockinette, 1 bobble row'"
                        rows={3}
                        className="input-field-lg resize-none"
                    />
                    <div className="form-help">
                        Describe your pattern in your own words
                    </div>
                </div>
            )}

            {/* Row-by-Row Mode */}
            {currentEntryMode === 'row_by_row' && (
                <div>
                    <label className="form-label">Pattern Rows</label>

                    {/* Row List */}
                    {rowInstructions.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {rowInstructions.map((instruction, index) => {
                                const rowNumber = index + 1;
                                const rowSide = getRowSide(rowNumber);

                                return (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white border-2 border-wool-200 rounded-lg">
                                        <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[80px]">
                                            Row {rowNumber} ({rowSide}):
                                        </div>
                                        <div className="flex-1 text-sm text-wool-700 font-mono">
                                            {instruction}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEditRow(index)}
                                                className="p-1 text-sage-600 hover:text-sage-700 hover:bg-sage-100 rounded transition-colors"
                                                title="Edit row"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRow(index)}
                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                                title="Delete row"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Add Row Button */}
                    <button
                        onClick={handleAddRow}
                        className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
                    >
                        + Add Row {rowInstructions.length + 1}
                    </button>

                    {/* Pattern Summary */}
                    {rowInstructions.length > 0 && (
                        <div className="mt-3 text-sm text-wool-600 text-center">
                            {rowInstructions.length} {rowInstructions.length === 1 ? 'row' : 'rows'} in pattern
                        </div>
                    )}

                    {/* Helper text for new users */}
                    {rowInstructions.length === 0 && (
                        <div className="mt-3 text-sm text-wool-500 text-center italic">
                            Add your first row to get started
                        </div>
                    )}
                </div>
            )}

            {/* Rows in Pattern (Traditional Input for Description Mode) */}
            {currentEntryMode === 'description' && (
                <div>
                    <label className="form-label">Rows in Pattern</label>
                    <IncrementInput
                        value={wizardData.stitchPattern.rowsInPattern}
                        onChange={(value) => updateWizardData('stitchPattern', { rowsInPattern: value })}
                        label="rows in pattern"
                        construction={construction}
                    />
                    <div className="form-help">
                        Number of {construction === 'round' ? 'rounds' : 'rows'} in one complete pattern repeat
                    </div>
                </div>
            )}

            {/* ===== ROW ENTRY OVERLAY ===== */}
            {showRowEntryOverlay && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleOverlayBackdrop}
                >
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-wool-700">
                                    {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                    {editingRowIndex === null && (
                                        <span className="text-sm font-normal text-wool-500 ml-2">
                                            ({getRowSide(rowInstructions.length + 1)})
                                        </span>
                                    )}
                                </h3>
                                <button
                                    onClick={() => setShowRowEntryOverlay(false)}
                                    className="text-wool-400 hover:text-wool-600 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Row Input */}
                            <div className="mb-4">
                                <textarea
                                    value={tempRowText}
                                    onChange={(e) => setTempRowText(e.target.value)}
                                    placeholder="Enter row instruction..."
                                    rows={3}
                                    className="w-full border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                                    autoFocus
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-4">
                                <div className="text-sm font-medium text-wool-600 mb-2">Quick Actions:</div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleQuickAction('k_all')}
                                        className="px-3 py-1 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                                    >
                                        K all
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('p_all')}
                                        className="px-3 py-1 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                                    >
                                        P all
                                    </button>
                                    {rowInstructions.map((instruction, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickAction(`copy_${index}`)}
                                            className="px-3 py-1 bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 transition-colors"
                                        >
                                            Copy Row {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRowEntryOverlay(false)}
                                    className="flex-1 py-3 px-4 border-2 border-wool-200 rounded-lg text-wool-600 hover:bg-wool-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveRow}
                                    disabled={!tempRowText.trim()}
                                    className="flex-1 py-3 px-4 bg-sage-500 text-white rounded-lg hover:bg-sage-600 disabled:bg-wool-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {editingRowIndex === null ? 'Add Row' : 'Save Row'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomPatternConfig;