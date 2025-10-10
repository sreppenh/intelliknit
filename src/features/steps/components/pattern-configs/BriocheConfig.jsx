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
    const initialLetters = colorwork.letters || [];

    // ✅ FIXED: Track letter order in local state so swap works
    const [letters, setLetters] = useState(initialLetters);

    // Get yarn colors for display - now uses state
    const colorA = letters[0] ? getYarnByLetter(yarns, letters[0]) : null;
    const colorB = letters[1] ? getYarnByLetter(yarns, letters[1]) : null;

    // Handle color swap
    const handleSwapColors = () => {
        if (letters.length !== 2) return;

        // Swap the letters array
        const swappedLetters = [letters[1], letters[0]];

        // Update local state (triggers re-render)
        setLetters(swappedLetters);

        // Update wizardData with swapped colors
        updateWizardData('colorwork', {
            ...colorwork,
            letters: swappedLetters
        });
    };

    // ✅ CHANGED: Read from stitchPattern.customSequence.rows instead of colorwork.rows
    const getInitialRows = () => {
        // Start with NO default rows - completely empty
        return wizardData.stitchPattern?.customSequence?.rows || {};
    };
    const [rows, setRows] = useState(getInitialRows());

    // Modal state - need to track both rows in the pair
    const [showModal, setShowModal] = useState(false);
    const [editingRowKey, setEditingRowKey] = useState(null);
    const [tempInstructionA, setTempInstructionA] = useState('');
    const [tempInstructionB, setTempInstructionB] = useState('');
    const [tempStitchChange, setTempStitchChange] = useState(0);

    // Get color display name
    const getColorDisplay = (yarn) => {
        if (!yarn) return '';
        return yarn.color && yarn.color !== `Color ${yarn.letter}`
            ? `${yarn.letter} (${yarn.color})`
            : yarn.letter;
    };

    // Define row structure dynamically based on what rows exist
    const getRowStructure = () => {
        const structure = [];

        // Get all row numbers that exist
        const rowNumbers = Object.keys(rows)
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
        // Get the row number from the key (e.g., '1a' -> '1')
        const rowNum = parseInt(rowKey.charAt(0));
        setEditingRowKey(rowNum);

        // Load both rows in the pair
        setTempInstructionA(rows[`${rowNum}a`]?.instruction || '');
        setTempInstructionB(rows[`${rowNum}b`]?.instruction || '');
        setTempStitchChange(rows[`${rowNum}a`]?.stitchChange || 0);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRowKey(null);
        setTempInstructionA('');
        setTempInstructionB('');
        setTempStitchChange(0);
    };

    const handleSaveRow = () => {
        if (!tempInstructionA.trim() || !tempInstructionB.trim()) return;

        const updatedRows = {
            ...rows,
            [`${editingRowKey}a`]: {
                instruction: tempInstructionA,
                stitchChange: tempStitchChange // Only row A stores the change
            },
            [`${editingRowKey}b`]: {
                instruction: tempInstructionB,
                stitchChange: 0 // Row B has 0 change
            }
        };

        setRows(updatedRows);

        updateWizardData('stitchPattern', {
            pattern: 'Brioche',
            customSequence: { rows: updatedRows },
            rowsInPattern: String(Object.keys(updatedRows).length) / 2
        });

        handleCloseModal();
    };

    // ===== ROW MANAGEMENT =====
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

        // ✅ CHANGED: Save to stitchPattern.customSequence
        updateWizardData('stitchPattern', {
            pattern: 'Brioche',
            customSequence: { rows: updatedRows },
            rowsInPattern: String(Object.keys(updatedRows).length) / 2
        });
    };

    const handleDeleteRow = (rowKey) => {
        // Get the row number
        const rowNum = parseInt(rowKey.charAt(0));

        // Remove both a and b rows for this number
        const updatedRows = { ...rows };
        delete updatedRows[`${rowNum}a`];
        delete updatedRows[`${rowNum}b`];

        setRows(updatedRows);

        // ✅ CHANGED: Save to stitchPattern.customSequence
        updateWizardData('stitchPattern', {
            pattern: 'Brioche',
            customSequence: { rows: updatedRows },
            rowsInPattern: String(Object.keys(updatedRows).length) / 2
        });
    };

    const getNextRowNumber = () => {
        const existingRowNumbers = Object.keys(rows)
            .map(k => parseInt(k.charAt(0)))
            .filter(n => !isNaN(n));
        return existingRowNumbers.length > 0 ? Math.max(...existingRowNumbers) + 1 : 1;
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

        // ✅ CHANGED: Save to stitchPattern.customSequence
        updateWizardData('stitchPattern', {
            pattern: 'Brioche',
            customSequence: { rows: updatedRows },
            rowsInPattern: String(Object.keys(updatedRows).length) / 2
        });

        // Open modal for the first new row
        handleOpenModal(`${nextNum}a`);
    };

    // ===== UTILITIES =====
    const canSave = () => {
        return tempInstructionA.trim() !== '' && tempInstructionB.trim() !== '';
    };

    // Get current editing row info for modal
    const currentRowNum = editingRowKey;
    const rowDef1a = rowStructure.find(r => r.key === `${currentRowNum}a`);
    const rowDef1b = rowStructure.find(r => r.key === `${currentRowNum}b`);


    const calculateNetChange = () => {
        const rowNumbers = [...new Set(Object.keys(rows).map(k => parseInt(k.charAt(0))))].filter(n => !isNaN(n));
        return rowNumbers.reduce((sum, num) => {
            return sum + (rows[`${num}a`]?.stitchChange || 0);
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
            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-yarn-700">Your Colors</h3>
                    {colorA && colorB && (
                        <button
                            onClick={handleSwapColors}
                            className="text-xs text-yarn-600 hover:text-yarn-800 hover:bg-yarn-200 rounded-lg px-2 py-1 transition-colors font-medium"
                            aria-label="Swap color order"
                            title="Swap Color A ↔ Color B"
                        >
                            Swap A ↔ B
                        </button>
                    )}
                </div>
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
                    {/* Group rows by pairs */}
                    {(() => {
                        const rowNumbers = [...new Set(rowStructure.map(r => parseInt(r.key.charAt(0))))];

                        return rowNumbers.map(rowNum => {
                            const rowA = rows[`${rowNum}a`];
                            const rowB = rows[`${rowNum}b`];
                            const rowDefA = rowStructure.find(r => r.key === `${rowNum}a`);
                            const rowDefB = rowStructure.find(r => r.key === `${rowNum}b`);
                            const stitchChange = rowA?.stitchChange || 0;

                            return (
                                <div
                                    key={rowNum}
                                    className="p-3 bg-white border-2 border-wool-200 rounded-lg space-y-2"
                                >
                                    {/* Header: Row number, side, stitch change, and actions */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-wool-600">
                                                Row {rowNum} ({rowDefA?.side || 'RS'})
                                            </div>
                                            {/* Stitch change badge - only show if non-zero */}
                                            {stitchChange !== 0 && (
                                                <div className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${stitchChange > 0 ? 'bg-green-100 text-green-700 border border-green-300' :
                                                    'bg-red-100 text-red-700 border border-red-300'
                                                    }`}>
                                                    {stitchChange > 0 ? '+' : ''}{stitchChange} sts
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(`${rowNum}a`)}
                                                className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                                aria-label={`Edit Row ${rowNum}`}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleCopyRow(`${rowNum}a`)}
                                                className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                                aria-label={`Copy Row ${rowNum}`}
                                            >
                                                📋
                                            </button>
                                            {/* Only show delete for rows beyond row 2 */}
                                            {rowNum > 2 && (
                                                <button
                                                    onClick={() => handleDeleteRow(`${rowNum}a`)}
                                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                    aria-label={`Delete Row ${rowNum}`}
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row A instruction with color indicator */}
                                    <div className="flex items-start gap-2 pl-2 text-left">
                                        <div
                                            className="w-3 h-3 rounded-full border border-gray-300 mt-1 flex-shrink-0"
                                            style={{ backgroundColor: colorA?.colorHex || colorA?.hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-wool-500 mb-1 text-left">Color {colorA?.letter}:</div>
                                            <div className="text-sm text-wool-700 font-mono break-words text-left">
                                                {rowA?.instruction || <span className="text-wool-400 italic">Not set</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row B instruction with color indicator */}
                                    <div className="flex items-start gap-2 pl-2 text-left">
                                        <div
                                            className="w-3 h-3 rounded-full border border-gray-300 mt-1 flex-shrink-0"
                                            style={{ backgroundColor: colorB?.colorHex || colorB?.hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-wool-500 mb-1 text-left">Color {colorB?.letter}:</div>
                                            <div className="text-sm text-wool-700 font-mono break-words text-left">
                                                {rowB?.instruction || <span className="text-wool-400 italic">Not set</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
                {/* Add Row Button */}
                <button
                    onClick={handleAddNewRow}
                    className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
                >
                    + Add {terms.Row} Pair {getNextRowNumber()}
                </button>

                {/* Pattern Summary */}
                <div className="mt-3 p-3 bg-sage-50 border border-sage-200 rounded-lg">
                    <div className="text-sm text-center">
                        <span className="text-wool-700 font-medium">
                            {rowStructure.length / 2} {rowStructure.length === 2 ? terms.row : terms.rows} in pattern
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
                title={`Edit Row ${currentRowNum}`}
                category="complex"
                colorScheme="sage"
            >
                <div className="space-y-4">
                    {/* Row A Instruction */}
                    <div>
                        <label className="form-label">
                            Row {currentRowNum}a ({rowDef1a?.side || 'RS'}, Color {colorA?.letter})
                        </label>
                        {rowDef1a?.color && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-yarn-600">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: rowDef1a.color.colorHex || rowDef1a.color.hex }}
                                />
                                Using Color {getColorDisplay(rowDef1a.color)}
                            </div>
                        )}
                        <input
                            type="text"
                            value={tempInstructionA}
                            onChange={(e) => setTempInstructionA(e.target.value)}
                            placeholder="e.g., [brk1, sl1yo] to end"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                            autoFocus
                        />
                    </div>

                    {/* Row B Instruction */}
                    <div>
                        <label className="form-label">
                            Row {currentRowNum}b ({rowDef1b?.side || 'RS'}, Color {colorB?.letter})
                        </label>
                        {rowDef1b?.color && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-yarn-600">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: rowDef1b.color.colorHex || rowDef1b.color.hex }}
                                />
                                Using Color {getColorDisplay(rowDef1b.color)}
                            </div>
                        )}
                        <input
                            type="text"
                            value={tempInstructionB}
                            onChange={(e) => setTempInstructionB(e.target.value)}
                            placeholder="e.g., [brk1, sl1yo] to end"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                        />
                    </div>

                    {/* Net Stitch Change - Single input for the pair */}
                    <div>
                        <label className="form-label">
                            Net Stitch Change (for both rows)
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
                            Stitches gained (+) or lost (-) across both rows of this pair. Use 0 for no change.
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
                            Save Row Pair
                        </button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
};

export default BriocheConfig;