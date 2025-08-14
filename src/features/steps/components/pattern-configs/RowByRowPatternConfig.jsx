// src/features/steps/components/pattern-configs/RowByRowPatternConfig.jsx
import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getPatternQuickActions, getPatternPlaceholderText } from '../../../../shared/utils/stepDisplayUtils';
import {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getNextKeyboardLayer,
    getLayerDisplayName,
    getButtonStyles,
    supportsMultipleLayers
} from '../../../../shared/utils/laceKeyboardUtils'
import {
    handleQuickActionEnhanced
} from '../../../../shared/utils/laceInputUtils'


const RowByRowPatternConfig = ({
    wizardData,
    updateWizardData,
    construction,

    // NEW: Mode-aware props
    mode = 'wizard',           // 'wizard' | 'edit' | 'notepad'
    onSave,                    // Called when save button is clicked (edit mode)
    onCancel,                  // Called when cancel button is clicked (edit mode)
    readOnlyFields = [],       // Array of field names that should be read-only
    showSaveActions = false    // Whether to show save/cancel buttons
}) => {
    // ===== ROW-BY-ROW STATE MANAGEMENT =====
    const [showRowEntryOverlay, setShowRowEntryOverlay] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempRowText, setTempRowText] = useState('');

    // ===== NEW: AUTO-INCREMENT STATE =====
    const [lastQuickAction, setLastQuickAction] = useState(null);
    const [consecutiveCount, setConsecutiveCount] = useState(1);

    // ADD these new state variables (add to your existing useState declarations):
    const [currentKeyboardLayer, setCurrentKeyboardLayer] = useState(KEYBOARD_LAYERS.PRIMARY);
    const [isCreatingRepeat, setIsCreatingRepeat] = useState(false);
    const [undoHistory, setUndoHistory] = useState([]);




    // Initialize entryMode if not set (backwards compatibility)
    const currentEntryMode = wizardData.stitchPattern.entryMode || 'description';
    const rowInstructions = wizardData.stitchPattern.rowInstructions || [];

    // ===== MODE-AWARE HELPERS =====
    const isEditMode = mode === 'edit';
    const isNotepadMode = mode === 'notepad';
    const isWizardMode = mode === 'wizard';

    // Check if a field is read-only
    const isReadOnly = (fieldName) => readOnlyFields.includes(fieldName);

    // Determine if we should show save/cancel actions
    const shouldShowActions = showSaveActions || isEditMode;

    // ===== NEW: MOBILE DETECTION =====
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ESC key handling
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showRowEntryOverlay) {
                setShowRowEntryOverlay(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showRowEntryOverlay]);

    // Get pattern-specific data
    const patternType = wizardData.stitchPattern.pattern;
    const placeholderText = getPatternPlaceholderText(patternType);

    // ===== NEW: ENHANCED PATTERN KEYBOARD =====
    const getEnhancedPatternKeyboard = (patternType, context = {}) => {
        const { rowNumber, construction } = context;

        switch (patternType) {
            case 'Lace Pattern':
                const laceActions = ['K all', 'P all', 'K', 'P', 'YO', 'K2tog', 'SSK', 'CDD'];

                // Smart context awareness for lace
                if (construction === 'flat' && rowNumber % 2 === 0) {
                    // Move P all to front for WS rows
                    return ['P all', ...laceActions.filter(a => a !== 'P all')];
                }
                return laceActions;

            case 'Cable Pattern':
                return ['K all', 'P all', 'K', 'P', 'C4F', 'C4B', 'C6F', 'C6B'];

            case 'Custom pattern':
                return ['K all', 'P all', 'K', 'P'];

            default:
                // Fallback to existing centralized version
                return getPatternQuickActions(patternType);
        }
    };

    // Get current enhanced keyboard
    const currentRowNumber = editingRowIndex === null ? rowInstructions.length + 1 : editingRowIndex + 1;
    const enhancedKeyboard = getEnhancedPatternKeyboard(patternType, {
        rowNumber: currentRowNumber,
        construction
    });

    // ===== MODE TOGGLE HANDLING =====
    const handleModeToggle = (newMode) => {
        if (isReadOnly('entryMode')) return; // Prevent toggle if read-only

        updateWizardData('stitchPattern', {
            entryMode: newMode,
            rowInstructions: newMode === 'row_by_row' ? rowInstructions : wizardData.stitchPattern.rowInstructions
        });
    };

    // ===== ROW MANAGEMENT =====
    // ALSO UPDATE your handleAddRow and handleEditRow functions to reset keyboard layer:
    const handleAddRow = () => {
        if (isReadOnly('rowInstructions')) return;

        setEditingRowIndex(null);
        setTempRowText('');
        setLastQuickAction(null);
        setConsecutiveCount(1);
        setCurrentKeyboardLayer(KEYBOARD_LAYERS.PRIMARY); // Reset to primary layer
        setIsCreatingRepeat(false); // Reset repeat state
        setShowRowEntryOverlay(true);
    };

    const handleEditRow = (index) => {
        if (isReadOnly('rowInstructions')) return;

        setEditingRowIndex(index);
        setTempRowText(rowInstructions[index] || '');
        setLastQuickAction(null);
        setConsecutiveCount(1);
        setCurrentKeyboardLayer(KEYBOARD_LAYERS.PRIMARY); // Reset to primary layer
        setIsCreatingRepeat(false); // Reset repeat state
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
        setLastQuickAction(null); // Reset auto-increment
        setConsecutiveCount(1);
    };

    const handleDeleteRow = (index) => {
        if (isReadOnly('rowInstructions')) return; // Prevent if read-only

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

    // ===== NEW: ENHANCED QUICK ACTION WITH AUTO-INCREMENT =====
    // REPLACE your existing handleQuickAction function with this enhanced version:
    const handleQuickAction = (action) => {
        // Handle keyboard layer shifting
        if (action === '⇧') {
            if (supportsMultipleLayers(patternType)) {
                setCurrentKeyboardLayer(prev => getNextKeyboardLayer(prev, patternType));
            }
            return;
        }

        // Use the enhanced handler from utilities
        handleQuickActionEnhanced(
            action,
            tempRowText,
            setTempRowText,
            lastQuickAction,
            setLastQuickAction,
            consecutiveCount,
            setConsecutiveCount,
            undoHistory,
            setUndoHistory,
            isCreatingRepeat,
            setIsCreatingRepeat,
            rowInstructions
        );
    };
    // ADD this new function after your existing handleQuickAction function:
    const handleSmartDelete = (isLongPress = false) => {
        // Save to undo history first
        if (tempRowText.trim()) {
            setUndoHistory(prev => [...prev, tempRowText]);
        }

        const actions = tempRowText.split(', ').filter(a => a.trim() !== '');
        if (actions.length === 0) return;

        const lastAction = actions[actions.length - 1];

        // Check if it's a numbered action like K3, P2, etc.
        const numberedMatch = lastAction.match(/^([KP])(\d+)$/);

        if (numberedMatch && !isLongPress) {
            // Tap delete: decrement the number
            const [, letter, number] = numberedMatch;
            const currentNum = parseInt(number);

            if (currentNum > 2) {
                // K3 → K2
                actions[actions.length - 1] = `${letter}${currentNum - 1}`;
            } else {
                // K2 → K (remove number)
                actions[actions.length - 1] = letter;
            }
        } else {
            // Hold delete OR non-numbered action: remove completely
            actions.pop();
        }

        setTempRowText(actions.join(', '));

        // Reset auto-increment when deleting
        setLastQuickAction(null);
        setConsecutiveCount(1);
    };

    // ADD this undo function:
    const handleUndo = () => {
        if (undoHistory.length > 0) {
            const previousState = undoHistory[undoHistory.length - 1];
            setTempRowText(previousState);
            setUndoHistory(prev => prev.slice(0, -1));
        }
    };

    const handleOverlayBackdrop = (e) => {
        if (e.target === e.currentTarget) {
            setShowRowEntryOverlay(false);
        }
    };

    // ===== VALIDATION =====
    const canSave = () => {
        if (currentEntryMode === 'description') {
            return wizardData.stitchPattern.customText?.trim() && wizardData.stitchPattern.rowsInPattern;
        } else {
            return rowInstructions.length > 0;
        }
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

    // ===== NEW: ENHANCED MOBILE OVERLAY (Standard IntelliKnit Style) =====
    const EnhancedMobileOverlay = () => (
        <div className="modal-overlay" onClick={handleOverlayBackdrop}>
            <div className="modal-content-light max-w-lg w-full max-h-[95vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-wool-700">
                            {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                            <span className="text-sm font-normal text-wool-500 ml-2">
                                ({getRowSide(currentRowNumber)})
                            </span>
                        </h3>
                        <button
                            onClick={() => setShowRowEntryOverlay(false)}
                            className="text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    {/* Row Input */}
                    <div className="mb-4">
                        <textarea
                            value={tempRowText}
                            onChange={(e) => setTempRowText(e.target.value)}
                            placeholder={placeholderText}
                            rows={3}
                            className="w-full border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                            autoFocus
                        />
                    </div>


                    {/* Smart Color-Coded Keyboard */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-wool-600">
                                Pattern Keyboard
                            </div>
                            {supportsMultipleLayers(patternType) && (
                                <div className="text-xs text-wool-500">
                                    {getLayerDisplayName(currentKeyboardLayer)} Layer
                                </div>
                            )}
                        </div>

                        <EnhancedKeyboard
                            patternType={patternType}
                            layer={currentKeyboardLayer}
                            context={{
                                rowNumber: currentRowNumber,
                                construction
                            }}
                            isMobile={isMobile}
                            isCreatingRepeat={isCreatingRepeat}
                            rowInstructions={rowInstructions}
                            onAction={handleQuickAction}
                        />
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
    );

    // ===== DESKTOP OVERLAY (Enhanced but keeping familiar structure) =====
    const DesktopOverlay = () => (
        <div className="modal-overlay" onClick={handleOverlayBackdrop}>
            <div className="modal-content-light max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-wool-700">
                            {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                            {editingRowIndex === null && (
                                <span className="text-sm font-normal text-wool-500 ml-2">
                                    ({getRowSide(currentRowNumber)})
                                </span>
                            )}
                        </h3>
                        <button
                            onClick={() => setShowRowEntryOverlay(false)}
                            className="text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    {/* Row Input */}
                    <div className="mb-4">
                        <textarea
                            value={tempRowText}
                            onChange={(e) => setTempRowText(e.target.value)}
                            placeholder={placeholderText}
                            rows={3}
                            className="w-full border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                            autoFocus
                        />
                    </div>

                    {/* Enhanced Quick Actions */}
                    <div className="mb-4">
                        <div className="text-sm font-medium text-wool-600 mb-2">Quick Actions:</div>
                        <div className="flex flex-wrap gap-2">
                            {enhancedKeyboard.map((action, index) => (
                                <button
                                    key={`${action}-${index}`}
                                    onClick={() => handleQuickAction(action)}
                                    className="px-3 py-1 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                            {rowInstructions.map((instruction, index) => (
                                <button
                                    key={`copy_${index}`}
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
    );

    return (
        <div className="stack-lg">
            {/* Mode indicator for edit mode */}
            {isEditMode && (
                <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yarn-600 font-medium">
                        🔧 Edit Mode - Row-by-Row Pattern Configuration
                    </p>
                    <p className="text-xs text-yarn-500 mt-1">
                        Make changes to your pattern entry method and row details
                    </p>
                </div>
            )}

            {/* Notepad mode indicator */}
            {isNotepadMode && (
                <div className="bg-lavender-100 border-2 border-lavender-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-lavender-600 font-medium">
                        📝 Notepad Mode - Pattern Designer
                    </p>
                    <p className="text-xs text-lavender-500 mt-1">
                        Design your pattern for future use in projects
                    </p>
                </div>
            )}

            {/* Entry Mode Toggle */}
            <div>
                <label className="form-label">Pattern Entry Method</label>
                {isReadOnly('entryMode') && (
                    <p className="text-xs text-yarn-600 mb-2">
                        Entry method is locked to preserve existing row data
                    </p>
                )}
                <div className="flex gap-3">
                    <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${currentEntryMode === 'description'
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                        } ${isReadOnly('entryMode') ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <input
                            type="radio"
                            name="entry_mode"
                            value="description"
                            checked={currentEntryMode === 'description'}
                            onChange={() => handleModeToggle('description')}
                            disabled={isReadOnly('entryMode')}
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
                        } ${isReadOnly('entryMode') ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <input
                            type="radio"
                            name="entry_mode"
                            value="row_by_row"
                            checked={currentEntryMode === 'row_by_row'}
                            onChange={() => handleModeToggle('row_by_row')}
                            disabled={isReadOnly('entryMode')}
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
                        readOnly={isReadOnly('customText')}
                    />
                    <div className="form-help">
                        Describe your pattern in your own words
                    </div>
                    {isReadOnly('customText') && (
                        <p className="text-xs text-yarn-600 mt-1">
                            Pattern description is read-only in edit mode
                        </p>
                    )}
                </div>
            )}

            {/* Row-by-Row Mode */}
            {currentEntryMode === 'row_by_row' && (
                <div>
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
                                            Row {rowNumber} ({rowSide}):
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
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                                    title="Delete row"
                                                >
                                                    🗑️
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
                            + Add Row {rowInstructions.length + 1}
                        </button>
                    )}

                    {/* Pattern Summary */}
                    {rowInstructions.length > 0 && (
                        <div className="mt-3 text-sm text-wool-600 text-center">
                            {rowInstructions.length} {rowInstructions.length === 1 ? 'row' : 'rows'} in pattern
                        </div>
                    )}

                    {/* Helper text for new users */}
                    {rowInstructions.length === 0 && !isReadOnly('rowInstructions') && (
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
                        disabled={isReadOnly('rowsInPattern')}
                    />
                    <div className="form-help">
                        Number of {construction === 'round' ? 'rounds' : 'rows'} in one complete pattern repeat
                    </div>
                    {isReadOnly('rowsInPattern') && (
                        <p className="text-xs text-yarn-600 mt-1">
                            Row count is locked to preserve calculations
                        </p>
                    )}
                </div>
            )}

            {/* Mode-aware save/cancel actions */}
            {shouldShowActions && (
                <div className="pt-4 border-t border-wool-200">
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 btn-tertiary"
                        >
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

            {/* ===== RESPONSIVE ROW ENTRY ===== */}
            {showRowEntryOverlay && (isMobile ? <EnhancedMobileOverlay /> : <DesktopOverlay />)}
        </div>
    );
};

const EnhancedKeyboard = ({
    patternType,
    layer,
    context,
    isMobile,
    isCreatingRepeat,
    rowInstructions,
    onAction
}) => {
    const keyboardLayout = getKeyboardLayout(patternType, layer, context);

    return (
        <div className="space-y-3">
            {/* Full-Row Actions (Dark Sage - top row) */}
            <div className={`grid gap-3 ${keyboardLayout.fullRow.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {keyboardLayout.fullRow.map((action, index) => (
                    <button
                        key={`fullrow-${action}-${index}`}
                        onClick={() => onAction(action)}
                        className={getButtonStyles('fullRow', isMobile)}
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Input Actions (Light Sage - main keyboard) */}
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'flex flex-wrap'}`}>
                {keyboardLayout.input.map((action, index) => {
                    // Special styling for custom actions and special symbol
                    const buttonType = action === '★' ? 'special' :
                        action.startsWith('Custom ') ? 'special' :
                            'input';

                    return (
                        <button
                            key={`input-${action}-${index}`}
                            onClick={() => onAction(action)}
                            className={getButtonStyles(buttonType, isMobile)}
                        >
                            {action}
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons (Lavender - bottom row) */}
            <div className="grid grid-cols-3 gap-3">
                {keyboardLayout.actions.map((action, index) => {
                    // Show current bracket state for repeat button
                    const displayAction = action === '[' && isCreatingRepeat ? ']' : action;

                    return (
                        <button
                            key={`action-${action}-${index}`}
                            onClick={() => onAction(displayAction)}
                            className={getButtonStyles('action', isMobile)}
                        >
                            {displayAction}
                        </button>
                    );
                })}
            </div>

            {/* Copy Row Actions (if any) */}
            {rowInstructions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {rowInstructions.map((_, index) => (
                        <button
                            key={`copy_${index}`}
                            onClick={() => onAction(`copy_${index}`)}
                            className={getButtonStyles('copy')}
                        >
                            Copy Row {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RowByRowPatternConfig;