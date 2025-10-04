// src/features/steps/components/pattern-configs/SimpleRowBuilder.jsx
import React, { useState } from 'react';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import IncrementInput from '../../../../shared/components/IncrementInput';
import StandardModal from '../../../../shared/components/modals/StandardModal'

const SimpleRowBuilder = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches
}) => {
    const terms = getConstructionTerms(construction);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempInstruction, setTempInstruction] = useState('');
    const [tempStitchChange, setTempStitchChange] = useState(0);

    const customSequence = wizardData.stitchPattern?.customSequence || { rows: [] };
    const rows = customSequence.rows || [];

    // ===== MODAL HANDLERS =====
    const handleOpenModal = (index = null) => {
        if (index !== null) {
            // Editing existing row
            setEditingRowIndex(index);
            setTempInstruction(rows[index].instruction || '');
            setTempStitchChange(rows[index].stitchChange || 0);
        } else {
            // Adding new row
            setEditingRowIndex(null);
            setTempInstruction('');
            setTempStitchChange(0);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRowIndex(null);
        setTempInstruction('');
        setTempStitchChange(0);
    };

    const handleSaveRow = () => {
        const newRows = [...rows];

        if (editingRowIndex !== null) {
            // Update existing row
            newRows[editingRowIndex] = {
                instruction: tempInstruction,
                stitchChange: tempStitchChange
            };
        } else {
            // Add new row
            newRows.push({
                instruction: tempInstruction,
                stitchChange: tempStitchChange
            });
        }

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows }
        });

        handleCloseModal();
    };

    // ===== ROW MANAGEMENT =====
    const handleCopyRow = (index) => {
        const rowToCopy = rows[index];
        // ✅ FIX: Append to END of array
        const newRows = [...rows, { ...rowToCopy }];

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows },
            // ✅ FIX: Update rowsInPattern for Pattern Repeats to work
            rowsInPattern: String(newRows.length)
        });
    };

    const handleDeleteRow = (index) => {
        if (rows.length <= 1) return;

        const newRows = rows.filter((_, i) => i !== index);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows }
        });
    };

    // ===== UTILITIES =====
    const getRowSide = (rowNumber) => {
        if (construction === 'round') return 'Round';
        return rowNumber % 2 === 1 ? 'RS' : 'WS';
    };

    const calculateNetChange = () => {
        return rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
    };

    const canSave = () => {
        return tempInstruction.trim() !== '';
    };

    // ===== INITIALIZATION =====
    if (rows.length === 0) {
        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: [{ instruction: '', stitchChange: 0 }] }
        });
        return null;
    }

    return (
        <div>
            <label className="form-label">Pattern {terms.Rows}</label>

            {/* Compact Row Display */}
            {rows.length > 0 && (
                <div className="space-y-2 mb-4">
                    {rows.map((row, index) => {
                        const rowNumber = index + 1;
                        const rowSide = getRowSide(rowNumber);

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-white border-2 border-wool-200 rounded-lg"
                            >
                                <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[100px]">
                                    {terms.Row} {rowNumber} ({rowSide}):
                                </div>
                                <div className="flex-1 text-sm text-wool-700 font-mono">
                                    {row.instruction || <span className="text-wool-400 italic">No instruction</span>}
                                </div>
                                {row.stitchChange !== 0 && (
                                    <div className="text-sm font-medium text-sage-600">
                                        {row.stitchChange > 0 ? '+' : ''}{row.stitchChange}
                                    </div>
                                )}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenModal(index)}
                                        className="p-1 text-sage-600 hover:text-sage-700 hover:bg-sage-100 rounded transition-colors"
                                        title="Edit row"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleCopyRow(index)}
                                        className="p-1 text-sage-600 hover:text-sage-700 hover:bg-sage-100 rounded transition-colors"
                                        title="Copy row"
                                    >
                                        📋
                                    </button>
                                    {rows.length > 1 && (
                                        <button
                                            onClick={() => handleDeleteRow(index)}
                                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                            title="Delete row"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Row Button */}
            <button
                onClick={() => handleOpenModal()}
                className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
            >
                + Add {terms.Row} {rows.length + 1}
            </button>

            {/* Net Change Summary */}
            {rows.length > 0 && calculateNetChange() !== 0 && (
                <div className="help-block mt-4">
                    <div className="text-sm text-sage-700">
                        <span className="font-medium">Net change per sequence:</span> {calculateNetChange() > 0 ? '+' : ''}{calculateNetChange()} stitches
                    </div>
                </div>
            )}

            {/* Row Entry Modal */}
            <StandardModal
                isOpen={showModal}
                onClose={handleCloseModal}
                category="simple"
                colorScheme="sage"
                title={editingRowIndex !== null ? `Edit ${terms.Row} ${editingRowIndex + 1}` : `Add ${terms.Row} ${rows.length + 1}`}
                showButtons={false}
            >
                <div className="space-y-4">
                    {/* Row Instruction Input */}
                    <div>
                        <label className="form-label">
                            {terms.Row} Instruction
                        </label>
                        <input
                            type="text"
                            value={tempInstruction}
                            onChange={(e) => setTempInstruction(e.target.value)}
                            placeholder="e.g., K1, m1, k to last st, m1, k1"
                            className="input-field-lg"
                            autoFocus
                        />
                        <div className="form-help">
                            Enter your custom instruction for this {terms.row}
                        </div>
                    </div>

                    {/* Stitch Change Input */}
                    <div>
                        <label className="form-label">
                            Net Stitch Change
                        </label>
                        <IncrementInput
                            value={tempStitchChange}
                            onChange={(value) => setTempStitchChange(value)}
                            label="stitch change"
                            unit="stitches"
                            size="sm"
                            min={-999}
                            max={999}
                            allowNegative={true}
                        />
                        <div className="form-help">
                            Stitches gained (+) or lost (-) in this {terms.row}. Use 0 for no change.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleCloseModal}
                            className="flex-1 btn-tertiary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRow}
                            disabled={!canSave()}
                            className="flex-1 btn-primary"
                        >
                            {editingRowIndex !== null ? `Save ${terms.Row}` : `Add ${terms.Row}`}
                        </button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
};

export default SimpleRowBuilder;