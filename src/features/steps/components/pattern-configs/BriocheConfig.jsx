// src/features/steps/components/pattern-configs/BriocheConfig.jsx

import React, { useState } from 'react';
import { getYarnByLetter } from '../../../../shared/utils/colorworkDisplayUtils';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import IncrementInput from '../../../../shared/components/IncrementInput';
import StandardModal from '../../../../shared/components/modals/StandardModal';

const BriocheConfig = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches
}) => {
    const { yarns } = useYarnManager();
    const terms = getConstructionTerms(construction);
    const colorwork = wizardData.colorwork || {};
    const letters = colorwork.letters || [];
    const hasSetupRow = colorwork.hasSetupRow || false;

    // Get yarn colors for display
    const colorA = letters[0] ? getYarnByLetter(yarns, letters[0]) : null;
    const colorB = letters[1] ? getYarnByLetter(yarns, letters[1]) : null;

    // Initialize rows from colorwork or defaults
    const getInitialRows = () => {
        const defaults = {
            setup: { instruction: 'sl1yo across all stitches', stitchChange: 0 },
            '1a': { instruction: '[brk1, sl1yo] to end', stitchChange: 0 },
            '1b': { instruction: '[brk1, sl1yo] to end', stitchChange: 0 },
            '2a': { instruction: '[brp1, sl1yo] to end', stitchChange: 0 },
            '2b': { instruction: '[brp1, sl1yo] to end', stitchChange: 0 }
        };
        return colorwork.rows || defaults;
    };

    const [rows, setRows] = useState(getInitialRows());

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingRowKey, setEditingRowKey] = useState(null);
    const [tempInstruction, setTempInstruction] = useState('');
    const [tempStitchChange, setTempStitchChange] = useState(0);

    // Get color display name
    const getColorDisplay = (yarn) => {
        if (!yarn) return '';
        return yarn.color && yarn.color !== `Color ${yarn.letter}`
            ? `${yarn.letter} (${yarn.color})`
            : yarn.letter;
    };

    // Define row structure
    const getRowStructure = () => {
        const structure = [];

        if (hasSetupRow && rows.setup) {
            structure.push({
                key: 'setup',
                label: 'Setup Row',
                side: 'RS',
                color: null
            });
        }

        // Get all row numbers that exist
        const rowNumbers = Object.keys(rows)
            .filter(k => k !== 'setup')
            .map(k => parseInt(k.charAt(0)))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);

        // Remove duplicates
        const uniqueRowNumbers = [...new Set(rowNumbers)];

        // Generate structure for each row pair
        uniqueRowNumbers.forEach(num => {
            structure.push(
                { key: `${num}a`, label: `Row ${num}a`, side: num % 2 === 1 ? 'RS' : 'WS', color: colorA },
                { key: `${num}b`, label: `Row ${num}b`, side: num % 2 === 1 ? 'RS' : 'WS', color: colorB }
            );
        });

        return structure;
    };

    const rowStructure = getRowStructure();

    // ===== MODAL HANDLERS =====
    const handleOpenModal = (rowKey) => {
        setEditingRowKey(rowKey);
        setTempInstruction(rows[rowKey]?.instruction || '');
        setTempStitchChange(rows[rowKey]?.stitchChange || 0);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRowKey(null);
        setTempInstruction('');
        setTempStitchChange(0);
    };

    const handleSaveRow = () => {
        const updatedRows = {
            ...rows,
            [editingRowKey]: {
                instruction: tempInstruction,
                stitchChange: tempStitchChange
            }
        };

        setRows(updatedRows);

        // Save to wizardData
        updateWizardData('colorwork', {
            ...colorwork,
            rows: updatedRows
        });

        // Also update rowsInPattern
        updateWizardData('stitchPattern', {
            rowsInPattern: String(rowStructure.length)
        });

        handleCloseModal();
    };

    const handleDeleteRow = (rowKey) => {
        // Get the row number
        const rowNum = parseInt(rowKey.charAt(0));

        // Remove both a and b rows for this number
        const updatedRows = { ...rows };
        delete updatedRows[`${rowNum}a`];
        delete updatedRows[`${rowNum}b`];

        setRows(updatedRows);
        updateWizardData('colorwork', {
            ...colorwork,
            rows: updatedRows
        });
        updateWizardData('stitchPattern', {
            rowsInPattern: String(Object.keys(updatedRows).length)
        });
    };

    const getNextRowNumber = () => {
        const existingRowNumbers = Object.keys(rows)
            .filter(k => k !== 'setup')
            .map(k => parseInt(k.charAt(0)))
            .filter(n => !isNaN(n));
        return existingRowNumbers.length > 0 ? Math.max(...existingRowNumbers) + 1 : 3;
    };

    const handleAddNewRow = () => {
        const nextNum = getNextRowNumber();

        // Add both rows of the new pair with empty instructions
        const updatedRows = {
            ...rows,
            [`${nextNum}a`]: { instruction: '', stitchChange: 0 },
            [`${nextNum}b`]: { instruction: '', stitchChange: 0 }
        };

        setRows(updatedRows);
        updateWizardData('colorwork', {
            ...colorwork,
            rows: updatedRows
        });
        updateWizardData('stitchPattern', {
            rowsInPattern: String(Object.keys(updatedRows).length)
        });

        // Open modal for the first new row
        handleOpenModal(`${nextNum}a`);
    };

    const handleCopyRow = (rowKey) => {
        const sourceRow = rows[rowKey];
        if (!sourceRow) return;

        // Determine the pair - if copying 1a, also copy 1b; if copying 2a, also copy 2b
        let pairKey;
        if (rowKey.endsWith('a')) {
            pairKey = rowKey.replace('a', 'b');
        } else {
            pairKey = rowKey.replace('b', 'a');
        }

        const pairRow = rows[pairKey];
        if (!pairRow) return;

        // Find the next row number
        const existingRowNumbers = Object.keys(rows)
            .filter(k => k !== 'setup')
            .map(k => parseInt(k.charAt(0)))
            .filter(n => !isNaN(n));
        const nextRowNum = Math.max(...existingRowNumbers, 0) + 1;

        // Add both rows of the pair
        const updatedRows = {
            ...rows,
            [`${nextRowNum}a`]: { ...sourceRow },
            [`${nextRowNum}b`]: { ...pairRow }
        };

        setRows(updatedRows);
        updateWizardData('colorwork', {
            ...colorwork,
            rows: updatedRows
        });
        updateWizardData('stitchPattern', {
            rowsInPattern: String(Object.keys(updatedRows).length)
        });
    };

    // ===== UTILITIES =====
    const canSave = () => {
        return tempInstruction.trim() !== '';
    };

    const calculateNetChange = () => {
        return rowStructure.reduce((sum, rowDef) => {
            return sum + (rows[rowDef.key]?.stitchChange || 0);
        }, 0);
    };

    const getRowSide = (side) => {
        if (construction === 'round') return 'Round';
        return side;
    };

    // Get current editing row definition for modal title
    const currentRowDef = rowStructure.find(r => r.key === editingRowKey);

    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Configure Two-Color Brioche</h2>
                <p className="content-subheader">
                    Edit the row instructions for your brioche pattern
                </p>
            </div>

            {/* Color Reference */}
            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-yarn-700 mb-3">Your Colors</h3>
                <div className="flex gap-4">
                    {colorA && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: colorA.colorHex || colorA.hex }}
                            />
                            <span className="text-sm font-medium text-yarn-700">
                                Color {getColorDisplay(colorA)}
                            </span>
                        </div>
                    )}
                    {colorB && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: colorB.colorHex || colorB.hex }}
                            />
                            <span className="text-sm font-medium text-yarn-700">
                                Color {getColorDisplay(colorB)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Row List */}
            <div>
                <label className="form-label">Pattern {terms.Rows}</label>

                <div className="space-y-2 mb-4">
                    {rowStructure.map((rowDef) => {
                        const row = rows[rowDef.key];
                        const instruction = row?.instruction || '';
                        const stitchChange = row?.stitchChange || 0;

                        return (
                            <div
                                key={rowDef.key}
                                className="p-3 bg-white border-2 border-wool-200 rounded-lg space-y-2"
                            >
                                {/* First line: Row label, color, stitch badge, and edit button */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-medium text-wool-600">
                                            {rowDef.label} ({getRowSide(rowDef.side)})
                                            {rowDef.color && (
                                                <span className="text-xs text-wool-500 ml-1">
                                                    - Color {rowDef.color.letter}
                                                </span>
                                            )}
                                        </div>
                                        {/* Stitch change badge */}
                                        <div className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${stitchChange > 0 ? 'bg-green-100 text-green-700 border border-green-300' :
                                            stitchChange < 0 ? 'bg-red-100 text-red-700 border border-red-300' :
                                                'bg-gray-100 text-gray-600 border border-gray-300'
                                            }`}>
                                            {stitchChange > 0 ? '+' : ''}{stitchChange} sts
                                        </div>
                                    </div>

                                    {/* Edit, Copy, and Delete buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(rowDef.key)}
                                            className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                            aria-label={`Edit ${rowDef.label}`}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleCopyRow(rowDef.key)}
                                            className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                            aria-label={`Copy ${rowDef.label}`}
                                        >
                                            📋
                                        </button>
                                        {/* Only show delete for rows beyond the base 4 rows */}
                                        {rowDef.key !== 'setup' && parseInt(rowDef.key.charAt(0)) > 2 && (
                                            <button
                                                onClick={() => handleDeleteRow(rowDef.key)}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                aria-label={`Delete ${rowDef.label}`}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Second line: Instruction */}
                                <div className="text-sm text-wool-700 font-mono pl-2">
                                    {instruction || <span className="text-wool-400 italic">Not set</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pattern Summary */}
                <div className="p-3 bg-sage-50 border border-sage-200 rounded-lg">
                    <div className="text-sm text-center">
                        <span className="text-wool-700 font-medium">
                            {rowStructure.length} {rowStructure.length === 1 ? terms.row : terms.rows} in pattern
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
            </div>

            {/* Add Row Button */}
            <button
                onClick={() => handleAddNewRow()}
                className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
            >
                + Add {terms.Row} Pair {getNextRowNumber()}
            </button>

            {/* Helper Tip */}
            <div className="bg-lavender-50 border-2 border-lavender-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-lavender-700 mb-2">💡 Brioche Tips</h4>
                <div className="text-sm text-lavender-600 space-y-1">
                    <div>• brk1 = brioche knit (consumes 2 sts, makes 1)</div>
                    <div>• brp1 = brioche purl (consumes 2 sts, makes 1)</div>
                    <div>• sl1yo = slip 1 with yarn over (consumes 1 st, makes 2)</div>
                    <div>• Each row alternates between the two colors</div>
                </div>
            </div>



            {/* Row Entry Modal */}
            <StandardModal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={currentRowDef ? `Edit ${currentRowDef.label}` : 'Edit Row'}
                category="complex"
                colorScheme="sage"
            >
                <div className="space-y-4">
                    {/* Show color context in modal */}
                    {currentRowDef?.color && (
                        <div className="flex items-center gap-2 p-3 bg-yarn-50 border border-yarn-200 rounded-lg">
                            <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: currentRowDef.color.colorHex || currentRowDef.color.hex }}
                            />
                            <span className="text-sm font-medium text-yarn-700">
                                Using Color {getColorDisplay(currentRowDef.color)}
                            </span>
                        </div>
                    )}

                    {/* Row Instruction */}
                    <div>
                        <label className="form-label">
                            {terms.Row} Instruction
                        </label>
                        <input
                            type="text"
                            value={tempInstruction}
                            onChange={(e) => setTempInstruction(e.target.value)}
                            placeholder="e.g., [brk1, sl1yo] to end"
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
                            Save {terms.Row}
                        </button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
};

export default BriocheConfig;