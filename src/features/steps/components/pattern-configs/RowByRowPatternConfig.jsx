// src/features/steps/components/pattern-configs/RowByRowPatternConfig.jsx
import React, { useState, useEffect } from 'react';
import { getPatternPlaceholderText, getKeyboardPatternKey } from '../../../../shared/utils/stepDisplayUtils';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import {
    KEYBOARD_LAYERS,
    getNextKeyboardLayer,
    supportsManualNumbers,
    supportsMultipleLayers,
} from '../../../../shared/utils/patternKeyboardUtils';
import {
    handleQuickActionEnhanced,
    isNumberAction,
    handleSmartDelete
} from '../../../../shared/utils/patternInputUtils';
import { calculateRowStitchesLive, getPreviousRowStitches } from '../../../../shared/utils/stitchCalculatorUtils';
import RowEntryModal from './RowEntryModal';
import PatternInputContainer from './Keyboards/PatternInputContainer';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import SimpleRowBuilder from './SimpleRowBuilder';


const RowByRowPatternConfig = ({
    wizardData,
    updateWizardData,
    construction,
    currentStitches,
    project,

    // NEW: Mode-aware props
    mode = 'create',           // 'create' | 'edit' | 'notepad'
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

    const [isTransitioning, setIsTransitioning] = useState(false);

    const [lastClickTime, setLastClickTime] = useState(0);

    // Add these to your existing useState declarations:
    const [editingAction, setEditingAction] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    const rowInstructions = wizardData.stitchPattern.rowInstructions || [];

    // ===== MODE-AWARE HELPERS =====
    const isEditMode = mode === 'edit';
    const isNotepadMode = mode === 'notepad';

    // Construction Awareness
    const terms = getConstructionTerms(construction);

    // Check if a field is read-only
    const isReadOnly = (fieldName) => readOnlyFields.includes(fieldName);

    // Determine if we should show save/cancel actions
    const shouldShowActions = showSaveActions || isEditMode;

    // ===== NEW: MOBILE DETECTION =====
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const projectsContext = useProjectsContext();
    const currentProject = project || projectsContext.currentProject;

    const [newActionStitches, setNewActionStitches] = useState('1');



    const updateProject = (updates) => {
        projectsContext.dispatch({
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
                setTimeout(() => {
                    setshowRowEntryModal(false);
                }, 200);
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
    const patternKey = getKeyboardPatternKey(patternType);

    // Get current enhanced keyboard
    const currentRowNumber = editingRowIndex === null ? rowInstructions.length + 1 : editingRowIndex + 1;

    // ===== ROW MANAGEMENT =====
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
        setBracketState({ hasOpenBracket: false, hasOpenParen: false });
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
        setBracketState({ hasOpenBracket: false, hasOpenParen: false });
        setshowRowEntryModal(true);
    };

    const handleSaveRow = () => {

        if (!tempRowText.trim()) {
            return;
        }

        // Validation logic...
        const calculation = getStitchCalculation();
        if (calculation && calculation.isValid) {
            const startingStitches = calculation.previousStitches;
            const consumedStitches = calculation.stitchesConsumed;

            if (consumedStitches !== startingStitches) {
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

        setTimeout(() => {
            setshowRowEntryModal(false);
        }, 200);
        setTempRowText('');
        setEditingRowIndex(null);
        setLastQuickAction(null);
        setConsecutiveCount(1);

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

        const customActionsLookup = {};
        const customActions = currentProject?.customKeyboardActions?.[patternKey] || [];
        customActions.forEach(action => {
            if (typeof action === 'object' && action.name) {
                customActionsLookup[action.name] = {
                    consumes: action.consumed,
                    produces: action.stitches
                };
            }
        });

        if (!tempRowText || !tempRowText.trim()) {
            const previousStitches = getPreviousRowStitches(
                rowInstructions,
                editingRowIndex === null ? rowInstructions.length : editingRowIndex,
                baselineStitches,
                customActionsLookup
            );
            return {
                isValid: true,
                previousStitches: previousStitches,
                totalStitches: previousStitches,
                stitchChange: 0,
                stitchesConsumed: 0
            };
        }

        // Check for open brackets/parens
        let openBrackets = 0;
        let openParens = 0;
        for (const char of tempRowText) {
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
            if (char === '(') openParens++;
            if (char === ')') openParens--;
        }

        if (openBrackets > 0 || openParens > 0) {
            const previousStitches = getPreviousRowStitches(
                rowInstructions,
                editingRowIndex === null ? rowInstructions.length : editingRowIndex,
                baselineStitches,
                customActionsLookup
            );
            return {
                isValid: false,
                isCalculating: true,
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
            customActionsLookup
        );

        return calculateRowStitchesLive(tempRowText, previousStitches, customActionsLookup);
    };

    const findMatchingOpeningBracket = (text, closingBracket) => {
        const openBracket = closingBracket === ']' ? '[' : '(';
        let depth = 0;

        for (let i = text.length - 1; i >= 0; i--) {
            const char = text[i];

            if (char === closingBracket) {
                depth++;
            } else if (char === openBracket) {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }

        return -1;
    };


    // ===== UPDATED handleQuickAction FUNCTION =====
    const handleQuickAction = (action) => {
        if (keyboardMode === 'copy_row') {
            handleNumberInput(action);
            return;
        }

        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        if (timeSinceLastClick < 400) {
            return;
        }
        setLastClickTime(now);

        if (isTransitioning) {
            return;
        }

        // Handle accumulated actions from hold operations
        const simpleAccumulatedMatch = action.match(/^(K|P|YO)(\d+)$/);
        const complexAccumulatedMatch = action.match(/^(.+?)\s*×\s*(\d+)$/);

        if (simpleAccumulatedMatch || complexAccumulatedMatch) {

            let baseAction, count;

            if (complexAccumulatedMatch) {
                [, baseAction, count] = complexAccumulatedMatch;
                baseAction = baseAction.trim();

            } else if (simpleAccumulatedMatch) {
                [, baseAction, count] = simpleAccumulatedMatch;
            }

            const isSimpleAction = ['K', 'P', 'YO'].includes(baseAction);
            const formattedAction = isSimpleAction
                ? `${baseAction}${count}`
                : `${baseAction} × ${count}`;

            setTempRowText(prev => {
                const actions = prev.split(', ').filter(a => a.trim() !== '');

                if (actions.length > 0) {
                    const lastAction = actions[actions.length - 1];

                    let lastBase = lastAction;
                    let lastCount = 1;

                    const lastSimpleMatch = lastAction.match(/^(K|P|YO)(\d*)$/);
                    const lastComplexMatch = lastAction.match(/^(.+?)\s*×\s*(\d+)$/);

                    if (lastComplexMatch) {
                        lastBase = lastComplexMatch[1].trim();
                        lastCount = parseInt(lastComplexMatch[2]);
                    } else if (lastSimpleMatch) {
                        lastBase = lastSimpleMatch[1];
                        lastCount = parseInt(lastSimpleMatch[2] || '1');
                    } else if (lastAction === baseAction) {
                        lastBase = lastAction;
                        lastCount = 1;
                    }

                    if (lastBase === baseAction) {
                        const newCount = lastCount + parseInt(count);
                        const mergedAction = isSimpleAction
                            ? `${baseAction}${newCount}`
                            : `${baseAction} × ${newCount}`;

                        actions[actions.length - 1] = mergedAction;

                        setLastQuickAction(baseAction);
                        setConsecutiveCount(newCount);

                        return actions.join(', ');
                    }
                }

                const shouldAddComma = prev &&
                    !prev.endsWith('[') &&
                    !prev.endsWith('(') &&
                    !prev.endsWith(', ');

                const newText = shouldAddComma ? `${prev}, ${formattedAction}` : `${prev}${formattedAction}`;

                setLastQuickAction(baseAction);
                setConsecutiveCount(parseInt(count));

                return newText;
            });

            return;
        }

        const resetAutoIncrement = () => {
            setLastQuickAction(null);
            setConsecutiveCount(1);
        };

        const isRowLocked = /k\s+to\s+end/gi.test(tempRowText) ||
            /p\s+to\s+end/gi.test(tempRowText) ||
            /k\/p\s+as\s+set/gi.test(tempRowText);

        if (isRowLocked && !['⌫', 'Enter', '✓'].includes(action)) {
            return;
        }

        if (keyboardMode === 'numbers') {
            handleNumberInput(action);
            return;
        }

        if (action === '⇧') {

            if (supportsMultipleLayers(patternType)) {
                const nextLayer = getNextKeyboardLayer(currentKeyboardLayer, patternType);
                setCurrentKeyboardLayer(nextLayer);

                if (supportsManualNumbers(patternType) && nextLayer === KEYBOARD_LAYERS.PRIMARY && currentKeyboardLayer === KEYBOARD_LAYERS.SECONDARY) {
                    setKeyboardMode('numbers');
                    setPendingRepeatText('');
                    return;
                }
            }
            return;
        }

        if (action === ']') {
            setBracketState(prev => ({ ...prev, hasOpenBracket: false }));

            const textWithClosingBracket = tempRowText + ']';
            setTempRowText(textWithClosingBracket);

            const matchingIndex = findMatchingOpeningBracket(textWithClosingBracket, ']');
            if (matchingIndex !== -1) {
                const bracketContent = textWithClosingBracket.substring(matchingIndex);
                setPendingRepeatText(bracketContent);
            } else {
                setPendingRepeatText(textWithClosingBracket);
            }

            setIsTransitioning(true);
            setKeyboardMode('numbers');
            setIsCreatingRepeat(false);

            setTimeout(() => {
                setIsTransitioning(false);
            }, 200);

            return;
        }

        if (action === ')') {
            setBracketState(prev => ({ ...prev, hasOpenParen: false }));

            const textWithClosingParen = tempRowText + ')';
            setTempRowText(textWithClosingParen);

            const matchingIndex = findMatchingOpeningBracket(textWithClosingParen, ')');
            if (matchingIndex !== -1) {
                const parenContent = textWithClosingParen.substring(matchingIndex);
                setPendingRepeatText(parenContent);

                setIsTransitioning(true);
                setKeyboardMode('numbers');
                setIsCreatingRepeat(false);

                setTimeout(() => {
                    setIsTransitioning(false);
                }, 200);
            }
            return;
        }

        if (action === '[') {
            setBracketState(prev => ({ ...prev, hasOpenBracket: true }));

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

            const shouldAddComma = tempRowText &&
                !tempRowText.endsWith('[') &&
                !tempRowText.endsWith('(') &&
                !tempRowText.endsWith(', ');

            const newText = shouldAddComma ? `${tempRowText}, (` : `${tempRowText}(`;
            setTempRowText(newText);
            return;
        }

        if (action === '⌫') {
            const handleBracketReset = (newText, info) => {
                if (info?.deletedBracket) {
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

    const handleNumberInput = (action) => {

        if (keyboardMode === 'copy_row') {
            if (action === 'Enter' || action === '✓') {
                const rowNum = parseInt(currentNumber);
                if (rowNum >= 1 && rowNum <= rowInstructions.length) {
                    const selectedRowContent = rowInstructions[rowNum - 1];
                    setTempRowText(selectedRowContent);

                    setKeyboardMode('pattern');
                    setPendingRepeatText('');
                    setCurrentNumber('');
                }
                return;
            }

            if (action === '⌫') {
                setCurrentNumber(prev => prev.slice(0, -1));
                return;
            }

            if (isNumberAction(action)) {
                setCurrentNumber(prev => (prev || '') + action);
                return;
            }

            return;
        }


        if (action === 'Enter' || action === '✓') {
            if (!pendingRepeatText || pendingRepeatText === '') {
                const numberDisplay = currentNumber || '';
                if (numberDisplay) {
                    setTempRowText(prev => prev ? `${prev}, ${currentNumber}` : currentNumber);
                }
            } else {
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
            setKeyboardMode('pattern');
            setPendingRepeatText('');
            setCurrentNumber('');
            return;
        }

        if (action === '⌫') {
            if (!pendingRepeatText || pendingRepeatText === '') {
                setCurrentNumber(prev => prev.slice(0, -1));
            } else {
                const currentText = pendingRepeatText.replace(/\s*×\s*\d*$/, '');
                const existingMultiplier = pendingRepeatText.match(/×\s*(\d+)$/)?.[1] || '';
                const newMultiplier = existingMultiplier.slice(0, -1);

                if (newMultiplier) {
                    setPendingRepeatText(`${currentText} × ${newMultiplier}`);
                } else {
                    setPendingRepeatText(currentText);
                }
            }
            return;
        }

        if (isNumberAction(action)) {
            if (!pendingRepeatText || pendingRepeatText === '') {
                setCurrentNumber(prev => (prev || '') + action);
            } else {
                const currentText = pendingRepeatText.replace(/\s*×\s*\d*$/, '');
                const existingMultiplier = pendingRepeatText.match(/×\s*(\d+)$/)?.[1] || '';
                const newMultiplier = existingMultiplier + action;
                const newText = `${currentText} × ${newMultiplier}`;
                setPendingRepeatText(newText);
            }
            return;
        }
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

            {/* Row-by-Row Pattern Entry */}
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
                                                        aria-label={`Delete row ${index + 1}`}
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

                        {/* Helper text for new users */}
                        {rowInstructions.length === 0 && !isReadOnly('rowInstructions') && (
                            <div className="mt-3 text-sm text-wool-500 text-center italic">
                                Add your first {terms.row} to get started
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Save/Cancel Actions */}
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
                onClose={() => {
                    setTimeout(() => {
                        setshowRowEntryModal(false);
                    }, 200);
                }}
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
                construction={construction}
                keyboardComponent={
                    <PatternInputContainer
                        keyboardMode={keyboardMode}
                        patternType={patternType}
                        currentKeyboardLayer={currentKeyboardLayer}
                        isMobile={isMobile}
                        isCreatingRepeat={isCreatingRepeat}
                        bracketState={bracketState}
                        tempRowText={tempRowText}
                        isLocked={/k\s+to\s+end/gi.test(tempRowText) ||
                            /p\s+to\s+end/gi.test(tempRowText) ||
                            /k\/p\s+as\s+set/gi.test(tempRowText)}
                        rowInstructions={rowInstructions}
                        pendingRepeatText={pendingRepeatText}
                        currentNumber={currentNumber}
                        currentProject={currentProject}
                        updateProject={updateProject}
                        newActionStitches={newActionStitches}
                        setNewActionStitches={setNewActionStitches}
                        currentRowNumber={currentRowNumber}
                        construction={construction}
                        getStitchCalculation={getStitchCalculation}
                        onAction={handleQuickAction}
                        directStateAccess={{
                            setPendingRepeatText,
                            setTempRowText,
                            setKeyboardMode,
                            setCurrentNumber,
                            setEditingAction,
                            setEditingIndex,
                            editingAction,
                            editingIndex
                        }}
                    />
                }
            />
        </div>

    );
};

export default RowByRowPatternConfig;