// src/features/steps/components/pattern-configs/RowByRowPatternConfig.jsx
import React, { useState, useRef } from 'react'; // Add useRef
import { getPatternPlaceholderText } from '../../../../shared/utils/stepDisplayUtils';
import { calculateRowStitchesLive, getPreviousRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import SimpleRowBuilder from './SimpleRowBuilder';
import StandardModal from '../../../../shared/components/modals/StandardModal';
import KnittingAbbreviationBar from '../../../../shared/components/KnittingAbbreviationBar';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext'; // ✨ NEW


/**
 * RowByRowPatternConfig - SIMPLIFIED VERSION
 * 
 * Keyboards removed! Now just simple text input.
 * Much cleaner, easier to understand, and faster to use.
 */
const RowByRowPatternConfig = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches,
    project,
    mode = 'create',
    onSave,
    onCancel,
    readOnlyFields = [],
    showSaveActions = false
}) => {

    // ===== STATE =====
    const [showModal, setShowModal] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempRowText, setTempRowText] = useState('');

    // ✨ NEW: Add refs and context
    const textareaRef = useRef(null);
    const { currentProject, dispatch } = useProjectsContext();

    // ✨ NEW: Handler for updating recently used abbreviations
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

    const rowInstructions = wizardData.stitchPattern.rowInstructions || [];
    const terms = getConstructionTerms(construction);

    // ===== MODE HELPERS =====
    const isEditMode = mode === 'edit';
    const isNotepadMode = mode === 'notepad';
    const isReadOnly = (fieldName) => readOnlyFields.includes(fieldName);
    const shouldShowActions = showSaveActions || isEditMode;

    // ===== ROW MANAGEMENT =====
    const handleAddRow = () => {
        if (isReadOnly('rowInstructions')) return;
        setEditingRowIndex(null);
        setTempRowText('');
        setShowModal(true);
    };

    const handleEditRow = (index) => {
        if (isReadOnly('rowInstructions')) return;
        setEditingRowIndex(index);
        setTempRowText(rowInstructions[index] || '');
        setShowModal(true);
    };

    const handleSaveRow = () => {
        if (!tempRowText.trim()) return;

        // Validate row consumes all stitches
        const calculation = getStitchCalculation();
        if (calculation && calculation.isValid) {
            const startingStitches = calculation.previousStitches;
            const consumedStitches = calculation.stitchesConsumed;

            if (consumedStitches !== startingStitches) {
                alert(`This row consumes ${consumedStitches} stitches but you have ${startingStitches} available. Please adjust your instruction.`);
                return;
            }
        }

        let updatedInstructions = [...rowInstructions];

        if (editingRowIndex === null) {
            updatedInstructions.push(tempRowText.trim());
        } else {
            updatedInstructions[editingRowIndex] = tempRowText.trim();
        }

        updateWizardData('stitchPattern', {
            rowInstructions: updatedInstructions,
            rowsInPattern: updatedInstructions.length.toString()
        });

        setShowModal(false);
        setTempRowText('');
        setEditingRowIndex(null);
    };

    const handleDeleteRow = (index) => {
        if (isReadOnly('rowInstructions')) return;
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

    const getStitchCalculation = () => {
        const baselineStitches = currentStitches || 0;

        if (!tempRowText || !tempRowText.trim()) {
            const previousStitches = getPreviousRowStitches(
                rowInstructions,
                editingRowIndex === null ? rowInstructions.length : editingRowIndex,
                baselineStitches,
                {}
            );
            return {
                isValid: true,
                previousStitches: previousStitches,
                totalStitches: previousStitches,
                stitchChange: 0,
                stitchesConsumed: 0
            };
        }

        const previousStitches = getPreviousRowStitches(
            rowInstructions,
            editingRowIndex === null ? rowInstructions.length : editingRowIndex,
            baselineStitches,
            {}
        );

        return calculateRowStitchesLive(tempRowText, previousStitches, {});
    };

    const canSave = () => {
        const currentRows = wizardData.stitchPattern.rowInstructions || [];
        return currentRows.length > 0;
    };

    // ===== SAVE HANDLERS =====
    const handleSave = () => {
        if (onSave && canSave()) {
            onSave(wizardData.stitchPattern);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    // Get pattern-specific placeholder
    const patternType = wizardData.stitchPattern.pattern;
    const placeholderText = getPatternPlaceholderText(patternType);
    const currentRowNumber = editingRowIndex === null ? rowInstructions.length + 1 : editingRowIndex + 1;

    return (
        <div className="stack-lg">
            {/* Mode indicators */}
            {isEditMode && (
                <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yarn-600 font-medium">
                        🔧 Edit Mode - Row-by-Row Pattern Configuration
                    </p>
                </div>
            )}

            {isNotepadMode && (
                <div className="bg-lavender-100 border-2 border-lavender-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-lavender-600 font-medium">
                        📝 Notepad Mode - Pattern Designer
                    </p>
                </div>
            )}

            {/* Pattern Entry */}
            <div>
                {patternType === 'Custom' ? (
                    <SimpleRowBuilder
                        wizardData={wizardData}
                        updateWizardData={updateWizardData}
                        construction={construction}
                        currentStitches={currentStitches}
                    />
                ) : (
                    <>
                        <label className="form-label">Pattern Rows</label>
                        {isReadOnly('rowInstructions') && (
                            <p className="text-xs text-yarn-600 mb-2">
                                Row instructions are read-only to preserve step calculations
                            </p>
                        )}

                        {/* Row List */}
                        {rowInstructions.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {rowInstructions.map((instruction, index) => {
                                    const rowNumber = index + 1;
                                    const rowSide = getRowSide(rowNumber);

                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-white border-2 border-wool-200 rounded-lg">
                                            <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[80px]">
                                                {terms.Row} {rowNumber} ({rowSide}):
                                            </div>
                                            <div className="flex-1 text-sm text-wool-700 font-mono">
                                                {instruction}
                                            </div>
                                            {!isReadOnly('rowInstructions') && (
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
                                                        className="delete-icon-sm"
                                                        title="Delete row"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add Row Button */}
                        {!isReadOnly('rowInstructions') && (
                            <button
                                onClick={handleAddRow}
                                className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
                            >
                                + Add {terms.Row} {rowInstructions.length + 1}
                            </button>
                        )}

                        {/* Pattern Summary */}
                        {rowInstructions.length > 0 && (
                            <div className="mt-3 text-sm text-wool-600 text-center">
                                {rowInstructions.length} {rowInstructions.length === 1 ? terms.row : terms.rows} in pattern
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Save/Cancel Actions */}
            {shouldShowActions && (
                <div className="pt-4 border-t border-wool-200">
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="flex-1 btn-tertiary">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave()}
                            className="flex-1 btn-primary"
                        >
                            {isEditMode ? 'Save Changes' : isNotepadMode ? 'Save to Notepad' : 'Save Pattern'}
                        </button>
                    </div>
                </div>
            )}

            {/* ===== SIMPLE TEXT INPUT MODAL ===== */}
            <StandardModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingRowIndex !== null ?
                    `Edit ${terms.Row} ${editingRowIndex + 1}` :
                    `Add ${terms.Row} ${currentRowNumber}`}
                category="complex"
                colorScheme="sage"
            >
                <div className="space-y-4">
                    {/* Row Side Indicator */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-wool-600">
                            {terms.Row} {currentRowNumber}:
                        </span>
                        <span className={`px-2 py-1 rounded ${getRowSide(currentRowNumber) === 'RS'
                            ? 'bg-sage-100 text-sage-700'
                            : 'bg-lavender-100 text-lavender-700'
                            }`}>
                            {getRowSide(currentRowNumber)}
                        </span>
                    </div>

                    {/* Text Input */}
                    <div>
                        <label className="form-label">
                            {terms.Row} Instruction
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={tempRowText}
                            onChange={(e) => setTempRowText(e.target.value)}
                            placeholder={placeholderText}
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base font-mono focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                            rows="3"
                            autoFocus
                        />
                        <p className="text-xs text-wool-500 mt-1">
                            Enter knitting abbreviations separated by commas
                        </p>

                        {/* ✨ NEW: Abbreviation Bar */}
                        <KnittingAbbreviationBar
                            textareaRef={textareaRef}
                            value={tempRowText}
                            onChange={setTempRowText}
                            recentlyUsed={currentProject?.customAbbreviations?.recentlyUsed || []}
                            onUpdateRecentlyUsed={handleUpdateRecentlyUsed}
                        />
                    </div>

                    {/* Real-time Stitch Calculation */}
                    {tempRowText && (() => {
                        const calc = getStitchCalculation();
                        return (
                            <div className={`p-3 rounded-lg ${calc.stitchesConsumed === calc.previousStitches
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                <div className="text-sm">
                                    <span className="font-medium text-wool-700">
                                        {calc.previousStitches} sts available
                                    </span>
                                    <span className="mx-2">→</span>
                                    <span className="font-medium text-wool-700">
                                        {calc.stitchesConsumed} sts used
                                    </span>
                                    {calc.stitchesConsumed !== calc.previousStitches && (
                                        <span className="ml-2 text-yellow-700">
                                            ({calc.previousStitches - calc.stitchesConsumed} remaining)
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 btn-tertiary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRow}
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

export default RowByRowPatternConfig;