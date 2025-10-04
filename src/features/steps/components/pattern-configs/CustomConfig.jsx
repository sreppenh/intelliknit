// src/features/steps/components/pattern-configs/CustomConfig.jsx
import React, { useState } from 'react';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const CustomConfig = ({ wizardData, updateWizardData, construction, currentStitches, mode }) => {
    const terms = getConstructionTerms(construction);

    // Get current sub-type selection
    const subType = wizardData.stitchPattern?.subType;

    // For row-by-row mode
    const customSequence = wizardData.stitchPattern?.customSequence || { rows: [] };
    const rows = customSequence.rows || [];

    const handleSubTypeSelect = (type) => {
        IntelliKnitLogger.debug('CustomConfig', `Selected sub-type: ${type}`);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            subType: type,
            // Initialize customSequence for row-by-row
            customSequence: type === 'row_by_row' ? { rows: [{ instruction: '', stitchChange: 0 }] } : undefined
        });
    };

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
        if (rows.length <= 1) return; // Keep at least one row

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

    // Calculate net change per sequence
    const calculateNetChange = () => {
        return rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
    };

    // If no subtype selected, show the choice screen
    if (!subType) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="content-header-secondary mb-2">Pattern Entry Method</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Row-by-Row Option */}
                    <label className="block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50">
                        <div className="flex items-start gap-4">
                            <input
                                type="radio"
                                name="custom_type"
                                value="row_by_row"
                                checked={false}
                                onChange={() => handleSubTypeSelect('row_by_row')}
                                className="w-4 h-4 text-sage-600 mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-2xl">📋</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-base">{terms.Row}-by-{terms.Row}</div>
                                        <div className="text-sm opacity-75">Enter each {terms.row} individually</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Description Option */}
                    <label className="block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50">
                        <div className="flex items-start gap-4">
                            <input
                                type="radio"
                                name="custom_type"
                                value="description"
                                checked={false}
                                onChange={() => handleSubTypeSelect('description')}
                                className="w-4 h-4 text-sage-600 mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-2xl">📝</div>
                                    <div className="text-left">
                                        <div className="font-semibold text-base">Description</div>
                                        <div className="text-sm opacity-75">Traditional text description</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                </div>

                <div className="help-block">
                    <div className="text-xs text-sage-600 text-center">
                        💡 Choose how you want to define your custom pattern
                    </div>
                </div>
            </div>
        );
    }

    // Description mode
    if (subType === 'description') {
        return (
            <div className="space-y-6">
                <div>
                    <label className="form-label">Pattern Description</label>
                    <textarea
                        value={wizardData.stitchPattern.customText || ''}
                        onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
                        placeholder="Describe your pattern..."
                        rows={4}
                        className="input-field-lg resize-none"
                    />
                    <div className="form-help">
                        Enter a free-form description of your pattern
                    </div>
                </div>

                <div>
                    <label className="form-label">{terms.Rows} in Pattern</label>
                    <IncrementInput
                        value={wizardData.stitchPattern.rowsInPattern || ''}
                        onChange={(value) => updateWizardData('stitchPattern', { rowsInPattern: value })}
                        label={`${terms.rows} in pattern`}
                        min={1}
                        size="md"
                    />
                </div>
            </div>
        );
    }

    // Row-by-Row mode
    return (
        <div className="space-y-6">
            <div>
                <label className="form-label">Pattern {terms.Rows}</label>

                {/* Starting stitches display */}
                {currentStitches > 0 && (
                    <div className="text-sm text-wool-600 mb-3">
                        Starting stitches: {currentStitches}
                    </div>
                )}

                {/* Row list */}
                <div className="space-y-3">
                    {rows.map((row, index) => {
                        const rowNumber = index + 1;
                        const rowSide = getRowSide(rowNumber);

                        return (
                            <div key={index} className="bg-white border-2 border-wool-200 rounded-lg p-3">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[100px]">
                                        {terms.Row} {rowNumber} ({rowSide}):
                                    </div>
                                    <div className="flex gap-2 ml-auto">
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
                                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                                title="Delete row"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={row.instruction || ''}
                                    onChange={(e) => handleRowChange(index, 'instruction', e.target.value)}
                                    placeholder={`e.g., K1, m1, k to last st, m1, k1`}
                                    className="input-field-lg w-full mb-2"
                                />

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-wool-600">Δ:</span>
                                    <IncrementInput
                                        value={row.stitchChange || 0}
                                        onChange={(value) => handleRowChange(index, 'stitchChange', parseInt(value) || 0)}
                                        label="stitch change"
                                        min={-999}
                                        max={999}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Row button */}
                <button
                    onClick={handleAddRow}
                    className="btn-secondary w-full mt-3"
                >
                    + Add {terms.Row} {rows.length + 1}
                </button>

                {/* Net change summary */}
                {rows.length > 0 && (
                    <div className="card-info mt-4">
                        <div className="text-sm text-sage-700">
                            <span className="font-medium">Net change per sequence:</span> {calculateNetChange() > 0 ? '+' : ''}{calculateNetChange()} stitches
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomConfig;