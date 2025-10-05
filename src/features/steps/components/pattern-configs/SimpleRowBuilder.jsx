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
            customSequence: { rows: newRows },
            rowsInPattern: String(newRows.length)
        });

        handleCloseModal();
    };

    // ===== ROW MANAGEMENT =====
    const handleCopyRow = (index) => {
        const rowToCopy = rows[index];
        const newRows = [...rows, { ...rowToCopy }];

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows },
            rowsInPattern: String(newRows.length)
        });
    };

    const handleDeleteRow = (index) => {
        if (rows.length <= 1) return;

        const newRows = rows.filter((_, i) => i !== index);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows },
            rowsInPattern: String(newRows.length)
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

                                {/* Always show stitch change with prominent color-coded badge */}
                                <div className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${row.stitchChange > 0 ? 'bg-green-100 text-green-700 border border-green-300' :
                                        row.stitchChange < 0 ? 'bg-red-100 text-red-700 border border-red-300' :
                                            'bg-gray-100 text-gray-600 border border-gray-300'
                                    }`}>
                                    {row.stitchChange > 0 ? '+' : ''}{row.stitchChange} sts
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(index)}
                                        className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                        aria-label={`Edit row ${index + 1}`}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleCopyRow(index)}
                                        className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                        aria-label={`Copy row ${index + 1}`}
                                    >
                                        📋
                                    </button>
                                    {rows.length > 1 && (
                                        <button
                                            onClick={() => handleDeleteRow(index)}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            aria-label={`Delete row ${index + 1}`}
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

            {/* Enhanced Pattern Summary */}
            {rows.length > 0 && (
                <div className="mt-3 p-3 bg-sage-50 border border-sage-200 rounded-lg">
                    <div className="text-sm text-center">
                        <span className="text-wool-700 font-medium">
                            {rows.length} {rows.length === 1 ? terms.row : terms.rows} in pattern
                        </span>
                        {calculateNetChange() !== 0 && (
                            <span className={`ml-2 font-semibold ${calculateNetChange() > 0 ? 'text-green-700' : 'text-red-700'
                                }`}>
                                • {calculateNetChange() > 0 ? '+' : ''}{calculateNetChange()} stitches per repeat
                            </span>
                        )}
                        {calculateNetChange() === 0 && (
                            <span className="ml-2 text-gray-600">
                                • No net change
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Row Entry Modal */}
            <StandardModal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingRowIndex !== null ? `Edit ${terms.Row} ${editingRowIndex + 1}` : `Add ${terms.Row} ${rows.length + 1}`}
                category="complex"
                colorScheme="sage"
            >
                <div className="space-y-4">
                    {/* Row Instruction */}
                    <div>
                        <label className="form-label">
                            {terms.Row} Instruction
                        </label>
                        <input
                            type="text"
                            value={tempInstruction}
                            onChange={(e) => setTempInstruction(e.target.value)}
                            placeholder="e.g., K1, m1, k to last st, m1, k1"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                            autoFocus
                        />
                        <p className="text-xs text-wool-500 mt-1">
                            Enter your custom instruction for this {terms.row}
                        </p>
                    </div>

                    {/* Net Stitch Change */}
                    <div>
                        <label className="form-label">
                            Net Stitch Change
                        </label>
                        <IncrementInput
                            value={tempStitchChange}
                            onChange={setTempStitchChange}
                            label="stitch change"
                            unit="stitches"
                            min={-20}
                            max={20}
                            allowNegative={true}
                        />
                        <p className="text-xs text-wool-500 mt-1">
                            Stitches gained (+) or lost (-) in this {terms.row}. Use 0 for no change.
                        </p>
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