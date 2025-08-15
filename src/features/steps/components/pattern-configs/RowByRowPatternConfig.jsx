// src/features/steps/components/pattern-configs/RowByRowPatternConfig.jsx
import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getPatternQuickActions, getPatternPlaceholderText } from '../../../../shared/utils/stepDisplayUtils';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getNextKeyboardLayer,
    getLayerDisplayName,
    getButtonStyles,
    supportsMultipleLayers,
    getCustomActions
} from '../../../../shared/utils/patternKeyboardUtils';
import {
    handleQuickActionEnhanced,
    shouldMultiplyAction,
    isBracketAction,
    isNumberAction
} from '../../../../shared/utils/patternInputUtils';
import { calculateRowStitches, formatRunningTotal, getPreviousRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';
import RowEntryModal from './RowEntryModal';

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


    const [keyboardMode, setKeyboardMode] = useState('pattern'); // 'pattern' | 'numbers'
    const [pendingRepeatText, setPendingRepeatText] = useState('');

    const [bracketState, setBracketState] = useState({
        hasOpenBracket: false,
        hasOpenParen: false
    });

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

    const { currentProject, dispatch } = useProjectsContext();

    // Helper function to update project data
    const updateProject = (updates) => {
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: { ...currentProject, ...updates }
        });
    };

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

    // Get current enhanced keyboard
    const currentRowNumber = editingRowIndex === null ? rowInstructions.length + 1 : editingRowIndex + 1;

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
        setCurrentKeyboardLayer(KEYBOARD_LAYERS.PRIMARY);
        setIsCreatingRepeat(false);
        setKeyboardMode('pattern');
        setPendingRepeatText('');
        setBracketState({ hasOpenBracket: false, hasOpenParen: false }); // ← ADD THIS
        setShowRowEntryOverlay(true);
    };

    const handleEditRow = (index) => {
        if (isReadOnly('rowInstructions')) return;

        setEditingRowIndex(index);
        setTempRowText(rowInstructions[index] || '');
        setLastQuickAction(null);
        setConsecutiveCount(1);
        setCurrentKeyboardLayer(KEYBOARD_LAYERS.PRIMARY);
        setIsCreatingRepeat(false);
        setKeyboardMode('pattern');
        setPendingRepeatText('');
        setBracketState({ hasOpenBracket: false, hasOpenParen: false }); // ← ADD THIS
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

    const getStitchCalculation = () => {
        if (!tempRowText || !currentProject) return null;

        const previousStitches = getPreviousRowStitches(
            rowInstructions,
            editingRowIndex === null ? rowInstructions.length : editingRowIndex,
            currentProject.startingStitches || 80
        );

        // Build custom actions lookup from project data
        const customActionsLookup = {};
        const patternKey = patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
        const customActions = currentProject?.customKeyboardActions?.[patternKey] || [];

        customActions.forEach(action => {
            if (typeof action === 'object' && action.name) {
                customActionsLookup[action.name] = action.stitches;
            }
        });

        return calculateRowStitches(tempRowText, previousStitches, customActionsLookup);
    };


    // ===== NEW: ENHANCED QUICK ACTION WITH AUTO-INCREMENT =====
    const handleQuickAction = (action) => {
        // NEW: Block input if row is completed (except delete and enter)
        if ((tempRowText === 'K all' || tempRowText === 'P all') &&
            !['⌫', 'Enter', '✓'].includes(action)) {
            return; // Do nothing - input blocked
        }

        // Handle keyboard mode switching
        if (keyboardMode === 'numbers') {
            handleNumberInput(action);
            return;
        }

        // Handle keyboard layer shifting (only in pattern mode)
        if (action === '⇧') {
            if (supportsMultipleLayers(patternType)) {
                setCurrentKeyboardLayer(prev => getNextKeyboardLayer(prev, patternType));
            }
            return;
        }

        // Track bracket state
        if (isBracketAction(action)) {
            if (action === '[') {
                setBracketState(prev => ({ ...prev, hasOpenBracket: true }));
            } else if (action === ']') {
                setBracketState(prev => ({ ...prev, hasOpenBracket: false }));
                // Trigger number mode
                setPendingRepeatText(tempRowText + ']');
                setKeyboardMode('numbers');
                setIsCreatingRepeat(false);
                return;
            } else if (action === '(') {
                setBracketState(prev => ({ ...prev, hasOpenParen: true }));
            } else if (action === ')') {
                setBracketState(prev => ({ ...prev, hasOpenParen: false }));
            }
        }

        // Use the enhanced handler from utilities for everything else
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
            rowInstructions,
            handleSaveRow
        );
    };

    // ADD this new function for number input handling:
    const handleNumberInput = (action) => {
        if (action === 'Enter' || action === '✓') {
            // Complete the repeat with multiplier
            setTempRowText(pendingRepeatText);
            setKeyboardMode('pattern');
            setPendingRepeatText('');
            return;
        }

        if (action === 'Cancel' || action === '✗') {
            // Cancel repeat creation
            setTempRowText(prev => prev.replace(/\]$/, '')); // Remove the ]
            setKeyboardMode('pattern');
            setPendingRepeatText('');
            setIsCreatingRepeat(true);
            return;
        }

        if (isNumberAction(action)) {
            // FIXED: Append numbers instead of replacing
            const currentText = pendingRepeatText.replace(/\]\s*×?\s*\d*$/, ''); // Remove existing multiplier
            const existingMultiplier = pendingRepeatText.match(/×\s*(\d+)$/)?.[1] || '';
            const newMultiplier = existingMultiplier + action; // ← APPEND, don't replace
            const newText = `${currentText}] × ${newMultiplier}`;
            setPendingRepeatText(newText);
            setTempRowText(newText);
            return;
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
                        <div>
                            <h3 className="text-lg font-semibold text-wool-700">
                                {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                <span className="text-sm font-normal text-wool-500 ml-2">
                                    ({getRowSide(currentRowNumber)})
                                </span>
                            </h3>
                            {/* Running Total Display */}
                            {(() => {
                                const calculation = getStitchCalculation();
                                const previousStitches = getPreviousRowStitches(
                                    rowInstructions,
                                    editingRowIndex === null ? rowInstructions.length : editingRowIndex,
                                    wizardData.currentStitches || currentProject?.startingStitches || 80
                                );

                                if (tempRowText && calculation && calculation.isValid) {
                                    // Show calculated result
                                    const totalFormat = formatRunningTotal(
                                        previousStitches,
                                        calculation.totalStitches,
                                        calculation.stitchChange
                                    );
                                    return (
                                        <div className="text-sm mt-1 text-wool-600">
                                            {totalFormat.baseText}
                                            {totalFormat.changeText && (
                                                <span className={`ml-1 ${totalFormat.changeColor}`}>
                                                    {totalFormat.changeText}
                                                </span>
                                            )}
                                        </div>
                                    );
                                } else {
                                    // Show default (no change expected)
                                    return (
                                        <div className="text-sm mt-1 text-wool-500">
                                            {previousStitches} sts → {previousStitches} sts
                                        </div>
                                    );
                                }
                            })()}
                        </div>
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
                            readOnly={isMobile}  // Prevent mobile keyboard on mobile
                            inputMode={isMobile ? "none" : "text"}  // No input method on mobile
                            onTouchStart={(e) => {
                                if (isMobile) {
                                    e.preventDefault(); // Prevent focus on mobile
                                }
                            }}

                        />
                    </div>

                    {/* Enhanced Multi-Layer Keyboard */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-wool-600">
                                {keyboardMode === 'numbers' ? 'Repeat Count' : 'Pattern Keyboard'}
                            </div>
                            {keyboardMode === 'pattern' && supportsMultipleLayers(patternType) && (
                                <div className="text-xs text-wool-500">
                                    {getLayerDisplayName(currentKeyboardLayer)} Layer
                                </div>
                            )}
                        </div>

                        {keyboardMode === 'numbers' ? (
                            <NumberKeyboard
                                onAction={handleQuickAction}
                                pendingText={pendingRepeatText}
                            />
                        ) : (
                            <>
                                {/* Show Custom Action Manager on Tertiary Layer */}
                                {currentKeyboardLayer === KEYBOARD_LAYERS.TERTIARY && (
                                    <CustomActionManager
                                        patternType={patternType}
                                        onActionSelect={handleQuickAction}
                                    />
                                )}

                                <EnhancedKeyboard
                                    patternType={patternType}
                                    layer={currentKeyboardLayer}
                                    context={{
                                        rowNumber: currentRowNumber,
                                        construction,
                                        project: currentProject,
                                        updateProject: updateProject
                                    }}
                                    isMobile={isMobile}
                                    isCreatingRepeat={isCreatingRepeat}
                                    rowInstructions={rowInstructions}
                                    onAction={handleQuickAction}
                                    bracketState={bracketState}
                                    isLocked={tempRowText === 'K all' || tempRowText === 'P all'}  // ← ADD THIS
                                />
                            </>
                        )}
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
                        <div>
                            <h3 className="text-lg font-semibold text-wool-700">
                                {editingRowIndex === null ? `Row ${rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                <span className="text-sm font-normal text-wool-500 ml-2">
                                    ({getRowSide(currentRowNumber)})
                                </span>
                            </h3>
                            {/* Running Total Display */}
                            {/* Running Total Display */}

                            {(() => {
                                const calculation = getStitchCalculation();
                                const previousStitches = getPreviousRowStitches(
                                    rowInstructions,
                                    editingRowIndex === null ? rowInstructions.length : editingRowIndex,
                                    wizardData.currentStitches || currentProject?.startingStitches || 80
                                );

                                if (tempRowText && calculation && calculation.isValid) {
                                    // Show calculated result
                                    const totalFormat = formatRunningTotal(
                                        previousStitches,
                                        calculation.totalStitches,
                                        calculation.stitchChange
                                    );
                                    return (
                                        <div className="text-sm mt-1 text-wool-600">
                                            {totalFormat.baseText}
                                            {totalFormat.changeText && (
                                                <span className={`ml-1 ${totalFormat.changeColor}`}>
                                                    {totalFormat.changeText}
                                                </span>
                                            )}
                                        </div>
                                    );
                                } else {
                                    // Show default (no change expected)
                                    return (
                                        <div className="text-sm mt-1 text-wool-500">
                                            {previousStitches} sts → {previousStitches} sts
                                        </div>
                                    );
                                }
                            })()}
                        </div>
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

                    {/* Enhanced Multi-Layer Keyboard - SAME AS MOBILE */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-wool-600">
                                {keyboardMode === 'numbers' ? 'Repeat Count' : 'Pattern Keyboard'}
                            </div>
                            {keyboardMode === 'pattern' && supportsMultipleLayers(patternType) && (
                                <div className="text-xs text-wool-500">
                                    {getLayerDisplayName(currentKeyboardLayer)} Layer
                                </div>
                            )}
                        </div>

                        {keyboardMode === 'numbers' ? (
                            <NumberKeyboard
                                onAction={handleQuickAction}
                                pendingText={pendingRepeatText}
                            />
                        ) : (
                            <>
                                {/* Show Custom Action Manager on Tertiary Layer */}
                                {currentKeyboardLayer === KEYBOARD_LAYERS.TERTIARY && (
                                    <CustomActionManager
                                        patternType={patternType}
                                        onActionSelect={handleQuickAction}
                                    />
                                )}

                                <EnhancedKeyboard
                                    patternType={patternType}
                                    layer={currentKeyboardLayer}
                                    context={{
                                        rowNumber: currentRowNumber,
                                        construction,
                                        project: currentProject,
                                        updateProject: updateProject  // ← ADD THIS LINE!
                                    }}
                                    isMobile={isMobile}
                                    isCreatingRepeat={isCreatingRepeat}
                                    rowInstructions={rowInstructions}
                                    onAction={handleQuickAction}
                                    bracketState={bracketState}
                                    isLocked={tempRowText === 'K all' || tempRowText === 'P all'}  // ← ADD THIS
                                />
                            </>
                        )}
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

    // ===== CUSTOM ACTION MANAGER COMPONENT =====
    const CustomActionManager = ({ patternType, onActionSelect }) => {
        const [newActionName, setNewActionName] = useState('');
        const [showAddForm, setShowAddForm] = useState(false);

        // Get custom actions from current project
        const customActions = currentProject?.customActions?.[
            patternType === 'Lace Pattern' ? 'lace' :
                patternType === 'Cable Pattern' ? 'cable' : 'general'
        ] || [];

        const handleAddAction = () => {
            if (newActionName.trim()) {
                const key = patternType === 'Lace Pattern' ? 'lace' :
                    patternType === 'Cable Pattern' ? 'cable' : 'general';

                const currentCustomActions = currentProject?.customActions || {};
                const updatedCustomActions = {
                    ...currentCustomActions,
                    [key]: [...(currentCustomActions[key] || []), newActionName.trim()]
                };

                updateProject({ customActions: updatedCustomActions });
                setNewActionName('');
                setShowAddForm(false);
            }
        };

        const handleRemoveAction = (actionToRemove) => {
            const key = patternType === 'Lace Pattern' ? 'lace' :
                patternType === 'Cable Pattern' ? 'cable' : 'general';

            const currentCustomActions = currentProject?.customActions || {};
            const updatedCustomActions = {
                ...currentCustomActions,
                [key]: (currentCustomActions[key] || []).filter(action => action !== actionToRemove)
            };

            updateProject({ customActions: updatedCustomActions });
        };

        if (showAddForm) {
            return (
                <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-lavender-700 mb-2">Add Custom Action</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newActionName}
                            onChange={(e) => setNewActionName(e.target.value)}
                            placeholder="e.g., Bobble, Nupps, Tree Branch"
                            className="flex-1 px-3 py-2 border border-lavender-300 rounded-lg text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddAction()}
                            autoFocus
                        />
                        <button
                            onClick={handleAddAction}
                            className="px-3 py-2 bg-lavender-500 text-white rounded-lg text-sm hover:bg-lavender-600"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-2 bg-lavender-200 text-lavender-700 rounded-lg text-sm hover:bg-lavender-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-3">
                <div className="text-sm font-medium text-wool-600 mb-2">
                    Custom {patternType.replace(' Pattern', '')} Actions
                </div>
                <div className="flex flex-wrap gap-2">
                    {customActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <button
                                onClick={() => onActionSelect(action)}
                                className="px-3 py-2 bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 border border-yarn-200"
                            >
                                {action}
                            </button>
                            <button
                                onClick={() => handleRemoveAction(action)}
                                className="w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 flex items-center justify-center"
                                title="Remove custom action"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-3 py-2 bg-lavender-100 text-lavender-700 rounded-lg text-sm hover:bg-lavender-200 border border-lavender-200 border-dashed"
                    >
                        + Add Custom
                    </button>
                </div>
            </div>
        );
    };

    // ===== ADD NUMBER KEYBOARD COMPONENT =====
    // Add this component after your CustomActionManager component:

    // Updated NumberKeyboard component with 0 validation

    const NumberKeyboard = ({ onAction, pendingText }) => {

        const handleNumberClick = (num) => {
            // Prevent starting with 0 (but allow 0 after other digits)
            if (num === '0') {
                const currentMultiplier = pendingText.match(/×\s*(\d*)$/)?.[1] || '';
                if (currentMultiplier === '') {
                    // Don't allow plain "×0" - do nothing
                    return;
                }
            }
            onAction(num);
        };

        return (
            <div className="space-y-3">
                {/* Show current repeat being built */}
                <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-lavender-700 mb-1">
                        How many times?
                    </div>
                    <div className="text-base font-mono text-wool-700">
                        {pendingText}
                    </div>
                </div>

                {/* Number grid: 1-9 */}
                <div className="grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="h-12 bg-sage-100 text-sage-700 rounded-lg text-lg font-medium hover:bg-sage-200 transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Bottom row: Backspace, 0, Enter */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onAction('⌫')}
                        className="h-12 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 border border-red-200 transition-colors"
                    >
                        ⌫
                    </button>
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="h-12 bg-sage-100 text-sage-700 rounded-lg text-lg font-medium hover:bg-sage-200 transition-colors"
                    >
                        0
                    </button>
                    <button
                        onClick={() => onAction('Enter')}
                        className="h-12 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors"
                    >
                        ✓
                    </button>
                </div>
            </div>
        );
    };

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
    bracketState,
    onAction,
    isLocked = false,
}) => {
    const keyboardLayout = getKeyboardLayout(patternType, layer, context);

    // Get custom actions for current pattern type
    const customActions = ((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
        (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) ?
        getCustomActions(patternType, context?.project) : [];

    // Handle custom action click
    const handleCustomAction = (action, index) => {
        if (action === 'Custom') {
            // Enhanced prompt for custom actions
            const newAction = prompt('Enter custom action name (max 8 characters):');
            if (newAction && newAction.trim()) {
                const stitchCount = prompt('How many stitches does this produce?', '1');
                const stitches = parseInt(stitchCount);

                // Validate stitch count
                if (isNaN(stitches) || stitches < 0) {
                    alert('Please enter a valid number of stitches (0 or higher)');
                    return;
                }

                const trimmedAction = newAction.trim().substring(0, 8);

                // Store as object with stitch count
                const customActionData = {
                    name: trimmedAction,
                    stitches: stitches
                };

                // Update storage format
                const key = patternType === 'Lace Pattern' ? 'lace' :
                    patternType === 'Cable Pattern' ? 'cable' : 'general';

                const currentCustomActions = context?.project?.customKeyboardActions || {};
                const patternActions = [...(currentCustomActions[key] || [])];

                while (patternActions.length < 4) {
                    patternActions.push('Custom');
                }

                patternActions[index] = customActionData;

                const updatedCustomActions = {
                    ...currentCustomActions,
                    [key]: patternActions
                };

                if (context?.updateProject) {
                    context.updateProject({ customKeyboardActions: updatedCustomActions });
                }
            }
        } else {
            // Use the custom action
            const actionName = typeof action === 'object' ? action.name : action;
            onAction(actionName);
        }
    };

    // Handle long press for editing existing custom actions
    const handleCustomLongPress = (action, index) => {
        if (action !== 'Custom') {
            const currentName = typeof action === 'object' ? action.name : action;
            const currentStitches = typeof action === 'object' ? action.stitches : 1;

            const newAction = prompt('Edit custom action name (max 8 characters):', currentName);
            if (newAction !== null) {
                const newStitchCount = prompt('How many stitches does this produce?', currentStitches.toString());
                const stitches = parseInt(newStitchCount);

                if (isNaN(stitches) || stitches < 0) {
                    alert('Please enter a valid number of stitches (0 or higher)');
                    return;
                }

                const trimmedAction = newAction.trim().substring(0, 8) || 'Custom';

                const customActionData = trimmedAction === 'Custom' ? 'Custom' : {
                    name: trimmedAction,
                    stitches: stitches
                };

                // Update project storage...
                const key = patternType === 'Lace Pattern' ? 'lace' :
                    patternType === 'Cable Pattern' ? 'cable' : 'general';

                const currentCustomActions = context?.project?.customKeyboardActions || {};
                const patternActions = [...(currentCustomActions[key] || [])];

                while (patternActions.length < 4) {
                    patternActions.push('Custom');
                }

                patternActions[index] = customActionData;

                const updatedCustomActions = {
                    ...currentCustomActions,
                    [key]: patternActions
                };

                if (context?.updateProject) {
                    context.updateProject({ customKeyboardActions: updatedCustomActions });
                }
            }
        }
    };

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
                    const buttonType = action === '★' ? 'special' :
                        action.startsWith('Custom ') ? 'special' :
                            'input';

                    const isDisabled = isLocked && !['⌫'].includes(action); // ← ADD THIS
                    const buttonClass = isDisabled ?
                        `${getButtonStyles(buttonType, isMobile)} opacity-50 cursor-not-allowed` :
                        getButtonStyles(buttonType, isMobile);

                    return (
                        <button
                            key={`input-${action}-${index}`}
                            onClick={() => !isDisabled && onAction(action)}  // ← ADD DISABLED CHECK
                            disabled={isDisabled}  // ← ADD THIS
                            className={buttonClass}
                        >
                            {action}
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons (Lavender - bottom row) */}
            <div className="grid grid-cols-4 gap-3">
                {keyboardLayout.actions.map((action, index) => {
                    // Dynamic button display based on current state
                    let displayAction = action;
                    if (action === '[' && bracketState.hasOpenBracket) {
                        displayAction = ']';
                    } else if (action === '(' && bracketState.hasOpenParen) {
                        displayAction = ')';
                    }

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

            {/* Custom Actions Row (Secondary for Lace, Tertiary for Cable) */}
            {((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
                (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) && (
                    <div className="grid grid-cols-4 gap-3">
                        {customActions.map((action, index) => {
                            let pressTimer;

                            return (
                                <button
                                    key={`custom-${index}`}
                                    onClick={() => handleCustomAction(action, index)}
                                    onMouseDown={() => {
                                        pressTimer = setTimeout(() => {
                                            handleCustomLongPress(action, index);
                                        }, 500);
                                    }}
                                    onMouseUp={() => clearTimeout(pressTimer)}
                                    onMouseLeave={() => clearTimeout(pressTimer)}
                                    onTouchStart={() => {
                                        pressTimer = setTimeout(() => {
                                            handleCustomLongPress(action, index);
                                        }, 500);
                                    }}
                                    onTouchEnd={() => clearTimeout(pressTimer)}
                                    className={`h-10 rounded-lg text-sm font-medium border-2 transition-colors ${action === 'Custom'
                                        ? 'bg-yarn-50 text-yarn-600 border-yarn-300 border-dashed hover:bg-yarn-100'
                                        : 'bg-yarn-100 text-yarn-700 border-yarn-300 hover:bg-yarn-200'
                                        }`}
                                >
                                    {action === 'Custom' ? (
                                        <span className="italic">Custom</span>
                                    ) : (
                                        typeof action === 'object' ? action.name : action
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            {/* Copy Row Actions (if any) */}
            {rowInstructions.length > 0 &&
                !((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
                    (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) && (
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