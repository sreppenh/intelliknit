// src/features/steps/components/pattern-configs/SimpleRowBuilder.jsx
import React, { useState, useRef } from 'react';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import IncrementInput from '../../../../shared/components/IncrementInput';
import StandardModal from '../../../../shared/components/modals/StandardModal';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import KnittingAbbreviationBar from '../../../../shared/components/KnittingAbbreviationBar';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import { handleSmartKeyDown } from '../../../../shared/hooks/useKnittingAbbreviations';
import { getCurrentSide } from '../../../../shared/utils/sideIntelligence'; // ✅ NEW IMPORT

const SimpleRowBuilder = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches,
    startingSide = 'RS' // ✅ NEW PROP with default
}) => {
    const terms = getConstructionTerms(construction);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempInstruction, setTempInstruction] = useState('');
    const [tempStitchChange, setTempStitchChange] = useState(0);
    const [stitchTrackingMode, setStitchTrackingMode] = useState('change');
    const [tempStitchesRemaining, setTempStitchesRemaining] = useState(null);
    const [isTextMode, setIsTextMode] = useState(false);
    const [activeNumberEdit, setActiveNumberEdit] = useState(null);

    const textareaRef = useRef(null);
    const { currentProject, dispatch } = useProjectsContext();

    const handleUpdateRecentlyUsed = (updatedArray) => {
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...currentProject,
                customAbbreviations: {
                    ...currentProject.customAbbreviations,
                    recentlyUsed: updatedArray
                }
            }
        });
    };

    const customSequence = wizardData.stitchPattern?.customSequence || { rows: [] };
    const rows = customSequence.rows || [];

    // Calculate current stitch count up to a given row index
    const getCurrentStitchCount = (upToIndex) => {
        let count = currentStitches || 0;
        for (let i = 0; i < upToIndex; i++) {
            const row = rows[i];
            if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
                count = row.stitchesRemaining;
            } else {
                count += (row.stitchChange || 0);
            }
        }
        return count;
    };

    // ===== MODAL HANDLERS =====
    const handleOpenModal = (index = null) => {
        if (index !== null) {
            setEditingRowIndex(index);
            setTempInstruction(rows[index].instruction || '');

            if (rows[index].stitchesRemaining !== null && rows[index].stitchesRemaining !== undefined) {
                setStitchTrackingMode('remaining');
                setTempStitchesRemaining(rows[index].stitchesRemaining);
                setTempStitchChange(0);
            } else {
                setStitchTrackingMode('change');
                setTempStitchChange(rows[index].stitchChange || 0);
                setTempStitchesRemaining(null);
            }
        } else {
            setEditingRowIndex(null);
            setTempInstruction('');
            setStitchTrackingMode('change');
            setTempStitchChange(0);
            setTempStitchesRemaining(null);
        }
        setIsTextMode(index === null);
        setActiveNumberEdit(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRowIndex(null);
        setTempInstruction('');
        setStitchTrackingMode('change');
        setTempStitchChange(0);
        setTempStitchesRemaining(null);
        setIsTextMode(false);
        setActiveNumberEdit(null);
    };

    const handleSaveRow = () => {
        const newRows = [...rows];

        const rowData = {
            instruction: tempInstruction,
        };

        if (stitchTrackingMode === 'remaining') {
            rowData.stitchesRemaining = tempStitchesRemaining;
            rowData.stitchChange = null;
        } else {
            rowData.stitchChange = tempStitchChange;
            rowData.stitchesRemaining = null;
        }

        if (editingRowIndex !== null) {
            newRows[editingRowIndex] = rowData;
        } else {
            newRows.push(rowData);
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
    // ✅ FIXED: Now respects the actual starting side
    const getRowSide = (rowNumber) => {
        if (construction === 'round') return 'Round';

        // Use sideIntelligence to calculate the correct side
        return getCurrentSide(construction, rowNumber, startingSide);
    };

    const calculateNetChange = () => {
        // Calculate actual net change by walking through rows
        // This respects manual "stitches remaining" entries
        if (rows.length === 0 || !currentStitches) return 0;

        let runningStitches = currentStitches;

        for (const row of rows) {
            // PRIORITY: Use stitchesRemaining if provided (manual entry)
            if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
                runningStitches = row.stitchesRemaining;
            } else {
                // Otherwise use stitchChange
                runningStitches += (row.stitchChange || 0);
            }
        }

        return runningStitches - currentStitches;
    };

    const canSave = () => {
        return tempInstruction.trim() !== '';
    };

    // Get display value for stitch count badge
    const getStitchDisplayForRow = (row, index) => {
        if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
            return `→ ${row.stitchesRemaining} sts`;
        }
        return `${row.stitchChange > 0 ? '+' : ''}${row.stitchChange} sts`;
    };

    // Get badge color class
    const getBadgeColorClass = (row, index) => {
        if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
            const currentCount = getCurrentStitchCount(index);
            if (row.stitchesRemaining > currentCount) {
                return 'bg-green-100 text-green-700 border border-green-300';
            } else if (row.stitchesRemaining < currentCount) {
                return 'bg-red-100 text-red-700 border border-red-300';
            }
            return 'bg-gray-100 text-gray-600 border border-gray-300';
        }

        if (row.stitchChange > 0) {
            return 'bg-green-100 text-green-700 border border-green-300';
        } else if (row.stitchChange < 0) {
            return 'bg-red-100 text-red-700 border border-red-300';
        }
        return 'bg-gray-100 text-gray-600 border border-gray-300';
    };

    const parseInstructionSegments = (text) => {
        const segments = [];
        const regex = /\d+/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            segments.push({ type: 'number', value: match[0], startIndex: match.index, endIndex: match.index + match[0].length });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            segments.push({ type: 'text', value: text.slice(lastIndex) });
        }
        return segments;
    };

    const handleDoneNumberEdit = () => {
        const { currentValue, startIndex, endIndex } = activeNumberEdit;
        const newInstruction = tempInstruction.slice(0, startIndex) + String(currentValue) + tempInstruction.slice(endIndex);
        setTempInstruction(newInstruction);
        setActiveNumberEdit(null);
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
                                className="p-3 bg-white border-2 border-wool-200 rounded-lg space-y-2"
                            >
                                {/* First line: Row label, stitch badge, and action buttons */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-medium text-wool-600">
                                            {terms.Row} {rowNumber} ({rowSide}):
                                        </div>
                                        {/* Stitch change badge */}
                                        <div className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${getBadgeColorClass(row, index)}`}>
                                            {getStitchDisplayForRow(row, index)}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
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

                                {/* Second line: Instruction gets full width */}
                                <div className="text-sm text-wool-700 font-mono pl-2">
                                    {row.instruction || <span className="text-wool-400 italic">No instruction</span>}
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
                            <span className={`ml-2 font-semibold ${calculateNetChange() > 0 ? 'text-green-700' : 'text-red-700'}`}>
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

                        {isTextMode ? (
                            <>
                                <textarea
                                    ref={textareaRef}
                                    value={tempInstruction}
                                    onChange={(e) => setTempInstruction(e.target.value)}
                                    onKeyDown={(e) => handleSmartKeyDown(e, tempInstruction, setTempInstruction, textareaRef)}
                                    placeholder="e.g., K1, m1, k to last st, m1, k1"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 resize-none"
                                    rows="3"
                                    autoFocus
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-wool-500">
                                        Enter your custom instruction for this {terms.row}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsTextMode(false)}
                                        className="text-xs text-wool-500 hover:text-sage-600 ml-2 whitespace-nowrap"
                                    >
                                        ← Formatted view
                                    </button>
                                </div>
                                <KnittingAbbreviationBar
                                    textareaRef={textareaRef}
                                    value={tempInstruction}
                                    onChange={setTempInstruction}
                                    recentlyUsed={currentProject?.customAbbreviations?.recentlyUsed || []}
                                    onUpdateRecentlyUsed={handleUpdateRecentlyUsed}
                                />
                            </>
                        ) : (
                            <>
                                <div className="min-h-[80px] border-2 border-wool-200 rounded-xl px-4 py-3 bg-white">
                                    {tempInstruction ? (
                                        <p className="text-base text-wool-800 font-mono leading-relaxed">
                                            {parseInstructionSegments(tempInstruction).map((seg, i) =>
                                                seg.type === 'number' ? (
                                                    <button
                                                        type="button"
                                                        key={i}
                                                        onClick={() => setActiveNumberEdit({ currentValue: parseInt(seg.value, 10), startIndex: seg.startIndex, endIndex: seg.endIndex })}
                                                        className="text-sage-600 font-semibold"
                                                    >
                                                        {seg.value}
                                                    </button>
                                                ) : (
                                                    <span key={i}>{seg.value}</span>
                                                )
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-wool-400 italic text-sm">
                                            Tap "Edit text ✏️" below to add an instruction
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsTextMode(true)}
                                        className="text-xs text-wool-500 hover:text-sage-600"
                                    >
                                        Edit text ✏️
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stitch Tracking Mode Toggle */}
                    <SegmentedControl
                        label="Stitch Tracking"
                        value={stitchTrackingMode}
                        onChange={(value) => {
                            setStitchTrackingMode(value);
                            if (value === 'remaining') {
                                const currentCount = editingRowIndex !== null
                                    ? getCurrentStitchCount(editingRowIndex)
                                    : getCurrentStitchCount(rows.length);
                                setTempStitchesRemaining(currentCount + (tempStitchChange || 0));
                            } else {
                                setTempStitchesRemaining(null);
                            }
                        }}
                        options={[
                            { value: 'change', label: 'Stitch Change' },
                            { value: 'remaining', label: 'Stitches Remaining' }
                        ]}
                    />

                    {/* Conditional input based on mode */}
                    {stitchTrackingMode === 'change' ? (
                        <div>
                            <label className="form-label">
                                Net Stitch Change
                            </label>
                            <IncrementInput
                                value={tempStitchChange}
                                onChange={setTempStitchChange}
                                label="stitch change"
                                unit="stitches"
                                min={-10000}
                                max={10000}
                                allowNegative={true}
                            />
                            <p className="text-xs text-wool-500 mt-1">
                                Stitches gained (+) or lost (-) in this {terms.row}. Use 0 for no change.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="form-label">
                                Stitches Remaining
                            </label>
                            <IncrementInput
                                value={tempStitchesRemaining}
                                onChange={setTempStitchesRemaining}
                                label="stitches remaining"
                                unit="stitches"
                                min={0}
                                max={10000}
                            />
                            <p className="text-xs text-wool-500 mt-1">
                                Total stitches after completing this {terms.row}.
                                {editingRowIndex !== null && (
                                    <span className="font-medium"> Currently: {getCurrentStitchCount(editingRowIndex)} sts</span>
                                )}
                            </p>
                        </div>
                    )}

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

            {activeNumberEdit && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30"
                    onClick={() => setActiveNumberEdit(null)}
                >
                    <div
                        className="bg-white rounded-t-2xl p-6 w-full max-w-sm shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveNumberEdit(prev => ({ ...prev, currentValue: Math.max(0, prev.currentValue - 1) }))}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-sage-100 text-sage-700 text-2xl font-bold hover:bg-sage-200 active:bg-sage-300 transition-colors"
                            >
                                −
                            </button>
                            <span className="text-3xl font-bold text-wool-800 min-w-[4ch] text-center">
                                {activeNumberEdit.currentValue}
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveNumberEdit(prev => ({ ...prev, currentValue: prev.currentValue + 1 }))}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-sage-100 text-sage-700 text-2xl font-bold hover:bg-sage-200 active:bg-sage-300 transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleDoneNumberEdit}
                            className="btn-primary w-full"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleRowBuilder;