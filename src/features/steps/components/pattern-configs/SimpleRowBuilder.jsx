// src/features/steps/components/pattern-configs/SimpleRowBuilder.jsx
import React from 'react';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const SimpleRowBuilder = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches
}) => {
    const terms = getConstructionTerms(construction);

    const customSequence = wizardData.stitchPattern?.customSequence || { rows: [] };
    const rows = customSequence.rows || [];

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows }
        });
    };

    const handleAddRow = () => {
        const newRows = [...rows, { instruction: '', stitchChange: 0 }];

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows }
        });
    };

    const handleCopyRow = (index) => {
        const rowToCopy = rows[index];
        const newRows = [...rows];
        newRows.splice(index + 1, 0, { ...rowToCopy });

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            customSequence: { rows: newRows }
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

    const getRowSide = (rowNumber) => {
        if (construction === 'round') return 'Round';
        return rowNumber % 2 === 1 ? 'RS' : 'WS';
    };

    const calculateNetChange = () => {
        return rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
    };

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

            <div className="space-y-2 mb-4">
                {rows.map((row, index) => {
                    const rowNumber = index + 1;
                    const rowSide = getRowSide(rowNumber);

                    return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white border-2 border-wool-200 rounded-lg">
                            <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[80px]">
                                {terms.Row} {rowNumber} ({rowSide}):
                            </div>
                            <input
                                type="text"
                                value={row.instruction || ''}
                                onChange={(e) => handleRowChange(index, 'instruction', e.target.value)}
                                placeholder="e.g., K1, m1, k to last st, m1, k1"
                                className="flex-1 border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                            />
                            <input
                                type="number"
                                value={row.stitchChange || 0}
                                onChange={(e) => handleRowChange(index, 'stitchChange', parseInt(e.target.value) || 0)}
                                className="w-16 border-2 border-wool-200 rounded-lg px-2 py-2 text-sm text-center focus:border-sage-500 focus:ring-0 transition-colors"
                                title="Stitch change"
                            />
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleCopyRow(index)}
                                    className="p-1 text-sage-600 hover:text-sage-700 transition-colors"
                                    title="Copy row"
                                >
                                    📋
                                </button>
                                {rows.length > 1 && (
                                    <button
                                        onClick={() => handleDeleteRow(index)}
                                        className="delete-icon-sm"
                                        title="Delete row"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleAddRow}
                className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
            >
                + Add {terms.Row} {rows.length + 1}
            </button>

            {rows.length > 0 && calculateNetChange() !== 0 && (
                <div className="help-block mt-4">
                    <div className="text-sm text-sage-700">
                        <span className="font-medium">Net change per sequence:</span> {calculateNetChange() > 0 ? '+' : ''}{calculateNetChange()} stitches
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleRowBuilder;