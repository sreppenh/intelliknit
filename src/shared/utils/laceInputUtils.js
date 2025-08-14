// src/shared/utils/laceInputUtils.js

/**
 * Lace Input Utilities
 * 
 * Handles auto-increment, delete logic, undo management, and special actions
 * for the enhanced lace pattern entry system.
 */

// ===== ADDITIVE ACTIONS CONFIGURATION =====

/**
 * Actions that support auto-increment/multiplication when repeated
 */
export const ADDITIVE_ACTIONS = [
    // Basic stitches
    'K', 'P',
    // Lace actions  
    'YO', 'K2tog', 'SSK', 'CDD',
    // Advanced lace
    'K3tog', 'P2tog', 'S2KP', 'SK2P', 'SSP',
    'K2tog tbl', 'SSK tbl', 'Sl1', 'M1L', 'M1R',
    // Future cable actions
    'C4F', 'C4B', 'C6F', 'C6B', 'T2F', 'T2B'
];

/**
 * Actions that reset completely (no decremental behavior) 
 */
export const COMPLETE_RESET_ACTIONS = [
    'K all', 'P all', 'YO', 'K2tog', 'SSK', 'CDD',
    'K3tog', 'P2tog', 'S2KP', 'SK2P', 'SSP',
    'K2tog tbl', 'SSK tbl', 'Sl1', 'M1L', 'M1R'
];

// ===== AUTO-INCREMENT LOGIC =====

/**
 * Handle auto-increment for additive actions
 */
export const handleAutoIncrement = (action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount) => {
    if (ADDITIVE_ACTIONS.includes(action) && action === lastQuickAction) {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);

        // Replace the last occurrence with numbered version
        const actions = tempRowText.split(', ').filter(a => a.trim() !== '');
        if (actions.length > 0) {
            const lastIndex = actions.length - 1;
            const lastAction = actions[lastIndex];

            // Check if it's the same action or already numbered
            if (lastAction === action || lastAction.startsWith(action)) {
                actions[lastIndex] = `${action}${newCount}`;
                setTempRowText(actions.join(', '));
                return true; // Handled
            }
        }
    }
    return false; // Not handled, continue with normal flow
};

// ===== SMART DELETE LOGIC =====

/**
 * Handle smart delete with tap/hold behavior
 */
export const handleSmartDelete = (tempRowText, setTempRowText, resetAutoIncrement, isLongPress = false) => {
    const actions = tempRowText.split(', ').filter(a => a.trim() !== '');
    if (actions.length === 0) return false;

    const lastAction = actions[actions.length - 1];

    // Check if it's a numbered action like K3, P2, YO4, etc.
    const numberedMatch = lastAction.match(/^([A-Za-z\d\s]+?)(\d+)$/);

    if (numberedMatch && !isLongPress) {
        // Tap delete: decrement the number
        const [, actionPart, number] = numberedMatch;
        const currentNum = parseInt(number);

        if (currentNum > 2) {
            // K3 → K2, YO4 → YO3
            actions[actions.length - 1] = `${actionPart}${currentNum - 1}`;
        } else {
            // K2 → K, YO2 → YO (remove number)
            actions[actions.length - 1] = actionPart;
        }
    } else {
        // Hold delete OR non-numbered action: remove completely
        actions.pop();
    }

    setTempRowText(actions.join(', '));
    resetAutoIncrement();
    return true;
};

// ===== UNDO MANAGEMENT =====

/**
 * Save current state to undo history
 */
export const saveToUndoHistory = (currentText, undoHistory, setUndoHistory, maxHistory = 50) => {
    if (currentText.trim()) {
        setUndoHistory(prev => {
            const newHistory = [...prev, currentText];
            // Keep only last N entries to prevent memory issues
            return newHistory.slice(-maxHistory);
        });
    }
};

/**
 * Handle undo operation
 */
export const handleUndo = (undoHistory, setUndoHistory, setTempRowText, resetAutoIncrement) => {
    if (undoHistory.length > 0) {
        const previousState = undoHistory[undoHistory.length - 1];
        setTempRowText(previousState);
        setUndoHistory(prev => prev.slice(0, -1));
        resetAutoIncrement();
        return true;
    }
    return false;
};

// ===== REPEAT BRACKET LOGIC =====

/**
 * Handle repeat bracket insertion
 */
export const handleRepeatBracket = (action, tempRowText, setTempRowText, isCreatingRepeat, setIsCreatingRepeat) => {
    if (action === '[') {
        setIsCreatingRepeat(true);
        // No comma before opening bracket
        setTempRowText(prev => prev ? `${prev}[` : '[');
        return true;
    }

    if (action === ']') {
        setIsCreatingRepeat(false);
        // TODO: Transform keyboard to numbers for repeat count
        setTempRowText(prev => prev ? `${prev}]` : ']');
        return true;
    }

    return false;
};

// ===== SPECIAL ACTION HANDLERS =====

/**
 * Handle special symbol (★) for custom input
 */
export const handleSpecialSymbol = (setTempRowText) => {
    // Simple prompt for now - could be enhanced to modal later
    const customAction = prompt('Enter custom stitch or instruction:');
    if (customAction && customAction.trim()) {
        setTempRowText(prev => prev ? `${prev}, ${customAction.trim()}` : customAction.trim());
        return true;
    }
    return false;
};

/**
 * Handle copy row action
 */
export const handleCopyRow = (action, rowInstructions, setTempRowText, resetAutoIncrement) => {
    if (action.startsWith('copy_')) {
        const rowIndex = parseInt(action.split('_')[1]);
        const copiedRow = rowInstructions[rowIndex] || '';
        setTempRowText(copiedRow);
        resetAutoIncrement();
        return true;
    }
    return false;
};

/**
 * Handle complete row actions (K all, P all)
 */
export const handleCompleteRowAction = (action, setTempRowText, resetAutoIncrement) => {
    if (action === 'K all') {
        setTempRowText('K all');
        resetAutoIncrement();
        return true;
    }

    if (action === 'P all') {
        setTempRowText('P all');
        resetAutoIncrement();
        return true;
    }

    return false;
};

// ===== MAIN ACTION HANDLER =====

/**
 * Main handler for all quick actions - coordinates all the specialized handlers
 */
export const handleQuickActionEnhanced = (
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
) => {
    // Helper to reset auto-increment state
    const resetAutoIncrement = () => {
        setLastQuickAction(null);
        setConsecutiveCount(1);
    };

    // Save to undo history before making changes (except for undo itself)
    if (action !== 'Undo') {
        saveToUndoHistory(tempRowText, undoHistory, setUndoHistory);
    }

    // Handle special actions first
    if (action === '⌫') {
        return handleSmartDelete(tempRowText, setTempRowText, resetAutoIncrement, false);
    }

    if (action === 'Undo') {
        return handleUndo(undoHistory, setUndoHistory, setTempRowText, resetAutoIncrement);
    }

    if (handleRepeatBracket(action, tempRowText, setTempRowText, isCreatingRepeat, setIsCreatingRepeat)) {
        return true;
    }

    if (action === '★') {
        return handleSpecialSymbol(setTempRowText);
    }

    if (handleCopyRow(action, rowInstructions, setTempRowText, resetAutoIncrement)) {
        return true;
    }

    if (handleCompleteRowAction(action, setTempRowText, resetAutoIncrement)) {
        return true;
    }

    // Handle auto-increment for additive actions
    if (handleAutoIncrement(action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount)) {
        return true;
    }

    // Regular action - add to sequence
    setLastQuickAction(ADDITIVE_ACTIONS.includes(action) ? action : null);
    setConsecutiveCount(1);
    setTempRowText(prev => prev ? `${prev}, ${action}` : action);

    return true;
};

// ===== VALIDATION HELPERS =====

/**
 * Check if action should show numbered state
 */
export const shouldShowNumberedState = (action, count) => {
    return ADDITIVE_ACTIONS.includes(action) && count > 1;
};

/**
 * Get formatted action display (with numbers if applicable)
 */
export const getFormattedActionDisplay = (action, count) => {
    if (shouldShowNumberedState(action, count)) {
        return `${action}${count}`;
    }
    return action;
};

export default {
    ADDITIVE_ACTIONS,
    COMPLETE_RESET_ACTIONS,
    handleAutoIncrement,
    handleSmartDelete,
    saveToUndoHistory,
    handleUndo,
    handleRepeatBracket,
    handleSpecialSymbol,
    handleCopyRow,
    handleCompleteRowAction,
    handleQuickActionEnhanced,
    shouldShowNumberedState,
    getFormattedActionDisplay
};