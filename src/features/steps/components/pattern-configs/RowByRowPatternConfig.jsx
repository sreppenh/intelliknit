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
    supportsManualNumbers,
    getButtonStyles,
    supportsMultipleLayers,
    getCustomActions
} from '../../../../shared/utils/patternKeyboardUtils';
import {
    handleQuickActionEnhanced,
    shouldMultiplyAction,
    isBracketAction,
    isNumberAction,
    handleSmartDelete
} from '../../../../shared/utils/patternInputUtils';
import { calculateRowStitchesLive, calculateRowStitches, formatRunningTotal, getPreviousRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';
import RowEntryModal from './RowEntryModal';
import NumberKeyboard from './NumberKeyboard';
import CustomActionManager from './CustomActionManager';

const RowByRowPatternConfig = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches,

    // NEW: Mode-aware props
    mode = 'wizard',           // 'wizard' | 'edit' | 'notepad'
    onSave,                    // Called when save button is clicked (edit mode)
    onCancel,                  // Called when cancel button is clicked (edit mode)
    readOnlyFields = [],       // Array of field names that should be read-only
    showSaveActions = false    // Whether to show save/cancel buttons
}) => {

    // ===== ROW-BY-ROW STATE MANAGEMENT =====
    const [showRowEntryModal, setshowRowEntryModal] = useState(false);
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

    const [currentNumber, setCurrentNumber] = useState('');

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

    const [newActionStitches, setNewActionStitches] = useState('1'); // Default to 1

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
            if (event.key === 'Escape' && showRowEntryModal) {
                setshowRowEntryModal(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showRowEntryModal]);

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
        setshowRowEntryModal(true);
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
        setshowRowEntryModal(true);
    };

    // In RowByRowPatternConfig.jsx - find the handleSaveRow function and replace it with this:

    const handleSaveRow = () => {
        if (!tempRowText.trim()) return;

        // NEW: Validate that row consumes all available stitches
        const calculation = getStitchCalculation();
        if (calculation && calculation.isValid) {
            const startingStitches = calculation.previousStitches;
            const consumedStitches = calculation.stitchesConsumed;

            // Only allow save if all stitches are consumed
            if (consumedStitches !== startingStitches) {
                return; // Block save - row is incomplete
            }
        }

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

        setshowRowEntryModal(false);
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

        if (!currentProject) return null;  // ← Only return null if no project

        const baselineStitches = currentStitches || 80;

        // If no text yet, return baseline calculation
        if (!tempRowText || !tempRowText.trim()) {
            return {
                isValid: true,
                previousStitches: baselineStitches,
                totalStitches: baselineStitches,
                stitchChange: 0
            };
        }
        const previousStitches = getPreviousRowStitches(
            rowInstructions,
            editingRowIndex === null ? rowInstructions.length : editingRowIndex,
            baselineStitches
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

        return calculateRowStitchesLive(tempRowText, previousStitches, customActionsLookup);
    };


    /**
     * Find the matching opening bracket for a closing bracket at the end of text
     * @param {string} text - The full text
     * @param {string} closingBracket - Either ']' or ')'
     * @returns {number} - Index of matching opening bracket, or -1 if not found
     */
    const findMatchingOpeningBracket = (text, closingBracket) => {
        const openBracket = closingBracket === ']' ? '[' : '(';
        let depth = 0;

        // Walk backwards from the end
        for (let i = text.length - 1; i >= 0; i--) {
            const char = text[i];

            if (char === closingBracket) {
                depth++;
            } else if (char === openBracket) {
                depth--;
                if (depth === 0) {
                    // Found the matching opening bracket
                    return i;
                }
            }
        }

        return -1; // No matching bracket found
    };


    // ===== UPDATED handleQuickAction FUNCTION =====
    // This needs to be updated in the main component to handle accumulated actions like "K36"

    // CORRECTED SOLUTION: Update handleQuickAction in RowByRowPatternConfig.jsx
    // This properly handles both K2tog and simple actions

    const handleQuickAction = (action) => {

        // Handle accumulated actions from hold operations
        const simpleAccumulatedMatch = action.match(/^(K|P|YO)(\d+)$/);  // K36, P12, YO4
        const complexAccumulatedMatch = action.match(/^(.+?)\s*×\s*(\d+)$/); // K2tog × 6, SSK × 3

        if (simpleAccumulatedMatch || complexAccumulatedMatch) {

            let baseAction, count;

            if (complexAccumulatedMatch) {
                // Handle "K2tog × 6" format from hold-down
                [, baseAction, count] = complexAccumulatedMatch;
                baseAction = baseAction.trim();

            } else if (simpleAccumulatedMatch) {
                // Handle "K36" format from hold-down of simple actions
                [, baseAction, count] = simpleAccumulatedMatch;
            }

            // Determine if this is ACTUALLY a simple action
            const isSimpleAction = ['K', 'P', 'YO'].includes(baseAction);
            const formattedAction = isSimpleAction
                ? `${baseAction}${count}`
                : `${baseAction} × ${count}`;

            // Add the properly formatted action with smart comma logic AND merging
            setTempRowText(prev => {
                const actions = prev.split(', ').filter(a => a.trim() !== '');

                // Check if the last action is the same base action
                if (actions.length > 0) {
                    const lastAction = actions[actions.length - 1];

                    // Extract base from last action (handle both formats)
                    let lastBase = lastAction;
                    let lastCount = 1;

                    // Check for simple format first (more specific)
                    const lastSimpleMatch = lastAction.match(/^(K|P|YO)(\d*)$/);
                    const lastComplexMatch = lastAction.match(/^(.+?)\s*×\s*(\d+)$/);

                    if (lastComplexMatch) {
                        lastBase = lastComplexMatch[1].trim();
                        lastCount = parseInt(lastComplexMatch[2]);
                    } else if (lastSimpleMatch) {
                        lastBase = lastSimpleMatch[1];
                        lastCount = parseInt(lastSimpleMatch[2] || '1');
                    } else if (lastAction === baseAction) {
                        // Plain action with no count
                        lastBase = lastAction;
                        lastCount = 1;
                    }

                    if (lastBase === baseAction) {
                        const newCount = lastCount + parseInt(count);
                        const mergedAction = isSimpleAction
                            ? `${baseAction}${newCount}`
                            : `${baseAction} × ${newCount}`;

                        actions[actions.length - 1] = mergedAction;

                        // CRITICAL: Update state SYNCHRONOUSLY here with the FINAL merged count
                        setLastQuickAction(baseAction);
                        setConsecutiveCount(newCount);  // Use the MERGED count, not the original

                        return actions.join(', ');
                    }
                }

                // Not mergeable, use comma logic
                const shouldAddComma = prev &&
                    !prev.endsWith('[') &&
                    !prev.endsWith('(') &&
                    !prev.endsWith(', ');

                const newText = shouldAddComma ? `${prev}, ${formattedAction}` : `${prev}${formattedAction}`;

                // CRITICAL: Update state SYNCHRONOUSLY here with the original count
                setLastQuickAction(baseAction);
                setConsecutiveCount(parseInt(count));

                return newText;
            });

            // CRITICAL FIX: Keep auto-increment state ALIVE for continued clicking!
            // Extract the base action and set it as the last action
            const finalBaseAction = complexAccumulatedMatch ?
                complexAccumulatedMatch[1].trim() :
                simpleAccumulatedMatch[1];

            // Calculate what the consecutive count should be based on the accumulated action
            const finalCount = parseInt(complexAccumulatedMatch ?
                complexAccumulatedMatch[2] :
                simpleAccumulatedMatch[2]);

            return;
        }

        // Helper function to reset auto-increment 
        const resetAutoIncrement = () => {
            setLastQuickAction(null);
            setConsecutiveCount(1);
        };

        // Row locking check
        const isRowLocked = tempRowText === 'K to end' || tempRowText === 'P to end' ||
            tempRowText === 'K all' || tempRowText === 'P all';

        if (isRowLocked && !['⌫', 'Enter', '✓'].includes(action)) {
            return; // Block all input except delete and enter
        }

        // Number mode handling
        if (keyboardMode === 'numbers') {
            handleNumberInput(action);
            return;
        }

        // Keyboard layer switching
        if (action === '⇧') {
            if (supportsMultipleLayers(patternType)) {
                const nextLayer = getNextKeyboardLayer(currentKeyboardLayer, patternType);
                setCurrentKeyboardLayer(nextLayer);

                // Manual number mode: ⇧⇧ (secondary back to primary) - only for supported patterns
                if (supportsManualNumbers(patternType) && nextLayer === KEYBOARD_LAYERS.PRIMARY && currentKeyboardLayer === KEYBOARD_LAYERS.SECONDARY) {
                    setKeyboardMode('numbers');
                    setPendingRepeatText(''); // Manual mode - no brackets
                    return;
                }
            }
            return;
        }

        // Closing brackets (Trigger Number Mode)
        if (action === ']') {
            setBracketState(prev => ({ ...prev, hasOpenBracket: false }));

            // Add ] to main display
            const textWithClosingBracket = tempRowText + ']';
            setTempRowText(textWithClosingBracket);

            // Set up mini display for multiplier
            const matchingIndex = findMatchingOpeningBracket(textWithClosingBracket, ']');
            if (matchingIndex !== -1) {
                const bracketContent = textWithClosingBracket.substring(matchingIndex);
                setPendingRepeatText(bracketContent);
            } else {
                setPendingRepeatText(textWithClosingBracket);
            }

            setKeyboardMode('numbers');
            setIsCreatingRepeat(false);
            return;
        }

        if (action === ')') {
            setBracketState(prev => ({ ...prev, hasOpenParen: false }));

            // Add ) to main display
            const textWithClosingParen = tempRowText + ')';
            setTempRowText(textWithClosingParen);

            // Set up mini display for multiplier
            const matchingIndex = findMatchingOpeningBracket(textWithClosingParen, ')');
            if (matchingIndex !== -1) {
                const parenContent = textWithClosingParen.substring(matchingIndex);
                setPendingRepeatText(parenContent);
                setKeyboardMode('numbers');
                setIsCreatingRepeat(false);
            }
            return;
        }

        // Opening brackets (With Smart Commas)
        if (action === '[') {
            setBracketState(prev => ({ ...prev, hasOpenBracket: true }));

            // Smart comma logic
            const shouldAddComma = tempRowText &&
                !tempRowText.endsWith('[') &&
                !tempRowText.endsWith('(') &&
                !tempRowText.endsWith(', ');

            const newText = shouldAddComma ? `${tempRowText}, [` : `${tempRowText}[`;
            setTempRowText(newText);
            return;
        }

        if (action === '(') {
            setBracketState(prev => ({ ...prev, hasOpenParen: true }));

            // Smart comma logic
            const shouldAddComma = tempRowText &&
                !tempRowText.endsWith('[') &&
                !tempRowText.endsWith('(') &&
                !tempRowText.endsWith(', ');

            const newText = shouldAddComma ? `${tempRowText}, (` : `${tempRowText}(`;
            setTempRowText(newText);
            return;
        }

        // Delete with bracket reset
        if (action === '⌫') {
            const handleBracketReset = (newText, info) => {
                if (info?.deletedBracket) {
                    // Reset bracket state based on what was deleted
                    if (info.deletedBracket === '[') {
                        setBracketState(prev => ({ ...prev, hasOpenBracket: false }));
                    } else if (info.deletedBracket === ']') {
                        setBracketState(prev => ({ ...prev, hasOpenBracket: true }));
                        setKeyboardMode('pattern');
                        setPendingRepeatText('');
                    } else if (info.deletedBracket === '(') {
                        setBracketState(prev => ({ ...prev, hasOpenParen: false }));
                    } else if (info.deletedBracket === ')') {
                        setBracketState(prev => ({ ...prev, hasOpenParen: true }));
                    }
                }
            };

            return handleSmartDelete(tempRowText, setTempRowText, resetAutoIncrement, false, handleBracketReset);
        }

        // All other actions get processed by the enhanced handler
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
            if (!pendingRepeatText || pendingRepeatText === '') {
                // Manual mode: Just add the accumulated number to text
                const numberDisplay = currentNumber || '';
                if (numberDisplay) {
                    setTempRowText(prev => prev ? `${prev}, ${currentNumber}` : currentNumber);
                }
            } else {
                // BRACKET MODE: Just append the multiplier to existing text
                const multiplier = pendingRepeatText.match(/×\s*(\d+)$/)?.[1];
                if (multiplier) {
                    setTempRowText(prev => `${prev} × ${multiplier}`);
                }
            }
            setKeyboardMode('pattern');
            setPendingRepeatText('');
            setCurrentNumber('');
            return;
        }
        if (action === 'Cancel' || action === '✗') {
            // Cancel and return to pattern mode
            setKeyboardMode('pattern');
            setPendingRepeatText('');
            setCurrentNumber('');
            return;
        }

        if (isNumberAction(action)) {
            if (!pendingRepeatText || pendingRepeatText === '') {
                // MANUAL MODE: Build up a number like "20"
                setCurrentNumber(prev => (prev || '') + action);
            } else {
                // BRACKET MODE: Add multiplier to existing bracket - ONLY update mini display
                const currentText = pendingRepeatText.replace(/\s*×\s*\d*$/, ''); // Remove just the multiplier part
                const existingMultiplier = pendingRepeatText.match(/×\s*(\d+)$/)?.[1] || '';
                const newMultiplier = existingMultiplier + action;
                const newText = `${currentText} × ${newMultiplier}`;
                setPendingRepeatText(newText);
                // DON'T update setTempRowText here - only update mini display!
            }
            return;
        }
    };


    const handleModalBackdrop = (e) => {
        if (e.target === e.currentTarget) {
            setshowRowEntryModal(false);
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

            {/* ===== ROW ENTRY MODAL ===== */}
            <RowEntryModal
                isOpen={showRowEntryModal}
                onClose={() => setshowRowEntryModal(false)}
                editingRowIndex={editingRowIndex}
                rowInstructions={rowInstructions}
                tempRowText={tempRowText}
                setTempRowText={setTempRowText}
                placeholderText={placeholderText}
                isMobile={isMobile}
                currentRowNumber={currentRowNumber}
                getRowSide={getRowSide}
                getStitchCalculation={getStitchCalculation}
                wizardData={wizardData}
                currentProject={currentProject}
                onSave={handleSaveRow}
                keyboardComponent={
                    keyboardMode === 'numbers' ? (
                        <NumberKeyboard
                            onAction={handleQuickAction}
                            pendingText={pendingRepeatText}
                            currentNumber={currentNumber}
                        />
                    ) : (
                        <>
                            {currentKeyboardLayer === KEYBOARD_LAYERS.TERTIARY && (
                                <CustomActionManager
                                    patternType={patternType}
                                    onActionSelect={handleQuickAction}
                                    currentProject={currentProject}
                                    updateProject={updateProject}
                                    newActionStitches={newActionStitches}
                                    setNewActionStitches={setNewActionStitches}
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
                                tempRowText={tempRowText}  // ← ADD THIS LINE
                                isLocked={tempRowText === 'K to end' || tempRowText === 'P to end' ||
                                    tempRowText === 'K all' || tempRowText === 'P all'} />
                        </>
                    )
                }
            />
        </div>

    );
};

// ===== CLEAN HANDLE QUICK ACTION FUNCTION =====
// Enhanced Hold-Down System Fix

const HoldableButton = ({ action, className, children, disabled, onClick, tempRowText }) => {
    const [holdState, setHoldState] = useState({
        isHolding: false,
        count: 0,
        timer: null,
        intervalTimer: null,
        pointerDown: false
    });

    const canHold = shouldMultiplyAction(action) && !disabled;

    const getDisplayCount = () => {
        const currentText = tempRowText || '';
        const actions = currentText.split(', ').filter(a => a.trim() !== '');
        if (actions.length > 0) {
            const lastAction = actions[actions.length - 1];

            // FIXED: Handle both simple (K2) and complex (K2tog × 3) formats
            const simpleMatch = lastAction.match(/^([A-Za-z]+)(\d*)$/);
            const complexMatch = lastAction.match(/^(.+?)\s*×\s*(\d+)$/);

            if (complexMatch && complexMatch[1].trim() === action) {
                // Handle "K2tog × 3" format
                const existingCount = parseInt(complexMatch[2]);
                return existingCount + holdState.count;
            } else if (simpleMatch && simpleMatch[1] === action) {
                // Handle "K2" format  
                const existingCount = parseInt(simpleMatch[2] || '1');
                return existingCount + holdState.count;
            } else if (lastAction === action) {
                // Handle plain action "K2tog" → should show count + 1
                return 1 + holdState.count;
            }
        }
        return holdState.count;
    };

    const startHoldAction = (e) => {
        e.preventDefault();
        if (!canHold) {
            onClick(action);
            return;
        }

        setHoldState(prev => ({ ...prev, isHolding: true, pointerDown: true, count: 1 }));

        const initialTimer = setTimeout(() => {
            let currentCount = 1;
            const intervalTimer = setInterval(() => {
                currentCount++;
                setHoldState(prev => ({ ...prev, count: currentCount }));
            }, 150);

            setHoldState(prev => ({ ...prev, intervalTimer }));
        }, 500);

        setHoldState(prev => ({ ...prev, timer: initialTimer }));
    };

    const stopHoldAction = (e) => {
        e.preventDefault();
        if (!holdState.pointerDown) return;

        if (holdState.timer) clearTimeout(holdState.timer);
        if (holdState.intervalTimer) clearInterval(holdState.intervalTimer);

        if (holdState.isHolding) {
            if (holdState.count > 1) {
                const isSimpleAction = ['K', 'P', 'YO'].includes(action);
                const accumulatedAction = isSimpleAction
                    ? `${action}${holdState.count}`
                    : `${action} × ${holdState.count}`;
                onClick(accumulatedAction);
            } else {
                onClick(action);
            }
        }

        setHoldState({ isHolding: false, count: 0, timer: null, intervalTimer: null, pointerDown: false });
    };

    return (
        <button
            className={`${className} ${holdState.isHolding ? 'ring-2 ring-sage-400 bg-sage-200' : ''}`}
            onPointerDown={startHoldAction}
            onPointerUp={stopHoldAction}
            onPointerLeave={stopHoldAction}
            onContextMenu={(e) => e.preventDefault()}
            disabled={disabled}
            style={{ userSelect: 'none', touchAction: 'manipulation' }}
        >
            <span className="flex items-center justify-center">
                {children}
                {holdState.isHolding && holdState.count > 1 && (
                    <span className="ml-1 text-xs bg-sage-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                        {getDisplayCount()}
                    </span>
                )}
            </span>
        </button>
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
    tempRowText,
    isLocked = false,
}) => {
    const keyboardLayout = getKeyboardLayout(patternType, layer, context);

    // Enhanced Keyboard with Hold-Down Functionality
    // Replace the input section in EnhancedKeyboard component

    const [editingCustomIndex, setEditingCustomIndex] = useState(null);
    const [customForm, setCustomForm] = useState({
        name: '',
        consumed: 1,
        stitches: 1
    });

    // Get custom actions for current pattern type
    const customActions = ((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
        (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) ?
        getCustomActions(patternType, context?.project) : [];

    // Handle custom action click
    const handleCustomAction = (action, index) => {
        if (action === 'Custom') {
            setEditingCustomIndex(index);
            setCustomForm({ name: '', consumed: 1, stitches: 1 });
        } else {
            const actionName = typeof action === 'object' ? action.name : action;
            onAction(actionName);
        }
    };

    const handleSaveCustomAction = () => {
        if (!customForm.name.trim()) {
            alert('Please enter a name for the custom action');
            return;
        }

        const trimmedAction = customForm.name.trim().substring(0, 8);
        const customActionData = {
            name: trimmedAction,
            consumed: customForm.consumed,
            stitches: customForm.stitches
        };

        const key = patternType === 'Lace Pattern' ? 'lace' : patternType === 'Cable Pattern' ? 'cable' : 'general';
        const currentCustomActions = context?.project?.customKeyboardActions || {};
        const patternActions = [...(currentCustomActions[key] || [])];

        while (patternActions.length < 4) {
            patternActions.push('Custom');
        }

        patternActions[editingCustomIndex] = customActionData;

        const updatedCustomActions = {
            ...currentCustomActions,
            [key]: patternActions
        };

        if (context?.updateProject) {
            context.updateProject({ customKeyboardActions: updatedCustomActions });
        }

        setEditingCustomIndex(null);
        setCustomForm({ name: '', consumed: 1, stitches: 1 });
    };

    const handleCancelCustomAction = () => {
        setEditingCustomIndex(null);
        setCustomForm({ name: '', consumed: 1, stitches: 1 });
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
                {keyboardLayout.fullRow.map((action, index) => {
                    const isDisabled = isLocked && !['⌫'].includes(action);
                    return (
                        <HoldableButton
                            key={`fullrow-${action}-${index}`}
                            action={action}
                            className={`${getButtonStyles('fullRow', isMobile)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDisabled}
                            tempRowText={tempRowText}
                            onClick={onAction} >
                            {action}
                        </HoldableButton>
                    );
                })}
            </div>

            {/* Input Actions (Light Sage - main keyboard) */}
            <div className="grid gap-2 grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
                {keyboardLayout.input.map((action, index) => {
                    const buttonType = action === '★' ? 'special' :
                        action.startsWith('Custom ') ? 'special' :
                            'input';

                    const isDisabled = isLocked && !['⌫'].includes(action);
                    const buttonClass = isDisabled ?
                        `${getButtonStyles(buttonType, isMobile)} opacity-50 cursor-not-allowed` :
                        getButtonStyles(buttonType, isMobile);

                    return (
                        <HoldableButton
                            key={`input-${action}-${index}`}
                            action={action}
                            buttonType={buttonType}
                            className={buttonClass}
                            disabled={isDisabled}
                            tempRowText={tempRowText}
                            onClick={onAction} >
                            {action}
                        </HoldableButton>
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

                    // BRACKET MATCHING ENFORCEMENT
                    let isDisabledByBracketRules = false;
                    if (displayAction === ']' && bracketState.hasOpenParen) {
                        isDisabledByBracketRules = true;
                    } else if (displayAction === ')' && bracketState.hasOpenBracket && !bracketState.hasOpenParen) {
                        isDisabledByBracketRules = true;
                    }

                    const isDisabled = isLocked || isDisabledByBracketRules;

                    return (
                        <HoldableButton
                            key={`action-${action}-${index}`}
                            action={displayAction}
                            className={`${getButtonStyles('action', isMobile)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDisabled}
                            tempRowText={tempRowText}
                            onClick={onAction}  >
                            {displayAction}
                        </HoldableButton>
                    );
                })}
            </div>

            {/* Custom Actions Row (Secondary for Lace, Tertiary for Cable) */}
            {((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
                (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) && (
                    <>
                        {/* Original 4-button grid - completely normal */}
                        <div className="grid grid-cols-4 gap-3">
                            {customActions.map((action, index) => {
                                let pressTimer;

                                return (
                                    <button
                                        key={`custom-${index}`}
                                        onClick={() => handleCustomAction(action, index)}
                                        onMouseLeave={() => clearTimeout(pressTimer)}
                                        className={`h-10 rounded-lg text-sm font-medium border-2 transition-colors ${action === 'Custom'
                                            ? 'bg-yarn-50 text-yarn-600 border-yarn-300 border-dashed hover:bg-yarn-100'
                                            : 'bg-yarn-100 text-yarn-700 border-yarn-300 hover:bg-yarn-200'
                                            }`}
                                    >
                                        {action === 'Custom' ? (
                                            <span className="italic">+ Custom</span>
                                        ) : (
                                            typeof action === 'object' ? action.name : action
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* YARN-THEMED OVERLAY - minimal and clean */}
                        {editingCustomIndex !== null && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* No backdrop - direct overlay */}
                                <div className="bg-white rounded-2xl shadow-xl border-2 border-yarn-200 w-full max-w-sm max-h-[80vh] overflow-y-auto">
                                    {/* Minimal header */}
                                    <div className="bg-yarn-200 text-yarn-800 px-6 py-4 rounded-t-2xl border-b-2 border-yarn-300">
                                        <h2 className="text-lg font-semibold text-center">
                                            Create Custom Stitch
                                        </h2>
                                    </div>

                                    {/* Clean form content */}
                                    <div className="bg-white px-6 py-6">
                                        <div className="space-y-5">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-wool-700 mb-2">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customForm.name}
                                                    onChange={(e) => setCustomForm(prev => ({
                                                        ...prev,
                                                        name: e.target.value.substring(0, 8)
                                                    }))}
                                                    maxLength={8}
                                                    placeholder="8 char limit"
                                                    className="w-full px-4 py-3 border-2 border-wool-300 rounded-lg text-base font-mono focus:border-yarn-500 focus:outline-none transition-colors"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Consumed Stitches */}
                                            <div>
                                                <label className="block text-sm font-medium text-wool-700 mb-2">
                                                    Consumed Stitches
                                                </label>
                                                <IncrementInput
                                                    value={customForm.consumed}
                                                    onChange={(value) => setCustomForm(prev => ({
                                                        ...prev,
                                                        consumed: value
                                                    }))}
                                                    min={0}
                                                    max={10}
                                                    unit="stitches"
                                                    size="default"
                                                />
                                            </div>

                                            {/* Resulting Stitches */}
                                            <div>
                                                <label className="block text-sm font-medium text-wool-700 mb-2">
                                                    Resulting Stitches
                                                </label>
                                                <IncrementInput
                                                    value={customForm.stitches}
                                                    onChange={(value) => setCustomForm(prev => ({
                                                        ...prev,
                                                        stitches: value
                                                    }))}
                                                    min={0}
                                                    max={10}
                                                    unit="stitches"
                                                    size="default"
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={handleCancelCustomAction}
                                                className="flex-1 btn-tertiary"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveCustomAction}
                                                disabled={!customForm.name.trim()}
                                                className="flex-1 btn-secondary"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
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