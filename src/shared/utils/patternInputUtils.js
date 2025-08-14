// src/shared/utils/patternInputUtils.js
/**
 * Pattern Input Utilities
 * 
 * Handles auto-increment, delete logic, undo management, and special actions
 * for enhanced pattern entry (Lace, Cable, Custom, etc.)
 */

// ===== ADDITIVE ACTIONS CONFIGURATION =====

export const ADDITIVE_ACTIONS = [
    // Basic stitches
    'K', 'P',
    // Lace actions  
    'YO', 'K2tog', 'SSK', 'CDD',
    // Advanced lace
    'K3tog', 'P2tog', 'S2KP', 'SK2P', 'SSP',
    'K2tog tbl', 'SSK tbl', 'Sl1', 'M1L', 'M1R',
    // Cable actions
    'C4F', 'C4B', 'C6F', 'C6B', 'T2F', 'T2B',
    'C8F', 'C8B', 'C10F', 'C10B', 'T4F', 'T4B'
];

// ===== COMMA LOGIC HELPERS =====

/**
 * Check if we should add comma before this action
 */
const shouldAddCommaBefore = (action, currentText) => {
    if (!currentText) return false; // No comma at start
    if (['[', '('].includes(action)) return false; // No comma before opening brackets
    if (currentText.endsWith('[') || currentText.endsWith('(')) return false; // No comma after opening brackets
    return true;
};

/**
 * Check if we should add comma after this action  
 */
const shouldAddCommaAfter = (action, nextAction = null) => {
    if ([']', ')'].includes(action)) return false; // No comma after closing brackets
    if (nextAction && [']', ')'].includes(nextAction)) return false; // No comma before closing brackets
    return true;
};

/**
 * Smart text appending with proper comma logic
 */
const appendWithCommaLogic = (currentText, newAction) => {
    if (!currentText) return newAction;

    if (shouldAddCommaBefore(newAction, currentText)) {
        return `${currentText}, ${newAction}`;
    } else {
        return `${currentText}${newAction}`;
    }
};

// ===== AUTO-INCREMENT LOGIC =====

export const handleAutoIncrement = (action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount) => {
    if (ADDITIVE_ACTIONS.includes(action) && action === lastQuickAction) {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);

        // Split by comma but preserve bracket structure
        const actions = tempRowText.split(', ').filter(a => a.trim() !== '');
        if (actions.length > 0) {
            const lastIndex = actions.length - 1;
            const lastAction = actions[lastIndex];

            if (lastAction === action || lastAction.startsWith(action)) {
                actions[lastIndex] = `${action}${newCount}`;
                setTempRowText(actions.join(', '));
                return true;
            }
        }
    }
    return false;
};

// ===== SMART DELETE LOGIC =====

export const handleSmartDelete = (tempRowText, setTempRowText, resetAutoIncrement, isLongPress = false) => {
    const actions = tempRowText.split(', ').filter(a => a.trim() !== '');
    if (actions.length === 0) return false;

    const lastAction = actions[actions.length - 1];
    const numberedMatch = lastAction.match(/^([A-Za-z\d\s]+?)(\d+)$/);

    if (numberedMatch && !isLongPress) {
        const [, actionPart, number] = numberedMatch;
        const currentNum = parseInt(number);

        if (currentNum > 2) {
            actions[actions.length - 1] = `${actionPart}${currentNum - 1}`;
        } else {
            actions[actions.length - 1] = actionPart;
        }
    } else {
        actions.pop();
    }

    setTempRowText(actions.join(', '));
    resetAutoIncrement();
    return true;
};

// ===== UNDO MANAGEMENT =====

export const saveToUndoHistory = (currentText, undoHistory, setUndoHistory, maxHistory = 50) => {
    if (currentText.trim()) {
        setUndoHistory(prev => {
            const newHistory = [...prev, currentText];
            return newHistory.slice(-maxHistory);
        });
    }
};

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

// ===== BRACKET VALIDATION =====

export const validateBracketClosure = (text) => {
    const stack = [];
    const pairs = { '[': ']', '(': ')' };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (['[', '('].includes(char)) {
            stack.push({ char, index: i });
        } else if ([']', ')'].includes(char)) {
            const lastOpen = stack.pop();

            if (!lastOpen || pairs[lastOpen.char] !== char) {
                return {
                    isValid: false,
                    error: `Mismatched ${char} at position ${i + 1}`,
                    position: i
                };
            }
        }
    }

    if (stack.length > 0) {
        const unclosed = stack[stack.length - 1];
        return {
            isValid: false,
            error: `Unclosed ${unclosed.char} at position ${unclosed.index + 1}`,
            position: unclosed.index
        };
    }

    return { isValid: true };
};

// ===== BRACKET & PARENTHESIS HANDLERS =====

export const handleBracketAndParens = (action, tempRowText, setTempRowText) => {
    if (['[', '(', ']', ')'].includes(action)) {
        // Use smart comma logic for brackets
        setTempRowText(prev => appendWithCommaLogic(prev, action));
        return true;
    }
    return false;
};

// ===== SPECIAL ACTION HANDLERS =====

export const handleSpecialSymbol = (setTempRowText) => {
    const customAction = prompt('Enter custom stitch or instruction:');
    if (customAction && customAction.trim()) {
        setTempRowText(prev => appendWithCommaLogic(prev, customAction.trim()));
        return true;
    }
    return false;
};

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
    rowInstructions
) => {
    const resetAutoIncrement = () => {
        setLastQuickAction(null);
        setConsecutiveCount(1);
    };

    // Save to undo history (except for undo itself)
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

    if (handleBracketAndParens(action, tempRowText, setTempRowText)) {
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

    // Handle auto-increment
    if (handleAutoIncrement(action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount)) {
        return true;
    }

    // Regular action - add with smart comma logic
    setLastQuickAction(ADDITIVE_ACTIONS.includes(action) ? action : null);
    setConsecutiveCount(1);
    setTempRowText(prev => appendWithCommaLogic(prev, action));

    return true;
};

export default {
    ADDITIVE_ACTIONS,
    handleAutoIncrement,
    handleSmartDelete,
    saveToUndoHistory,
    handleUndo,
    validateBracketClosure,
    handleBracketAndParens,
    handleSpecialSymbol,
    handleCopyRow,
    handleCompleteRowAction,
    handleQuickActionEnhanced
};