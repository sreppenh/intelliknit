// src/shared/utils/patternInputUtils.js
/**
 * Pattern Input Utilities
 * 
 * Handles auto-increment, delete logic, undo management, and special actions
 * for enhanced pattern entry (Lace, Cable, Custom, etc.)
 */

// ===== NON MULTIPLICABLE ACTIONS CONFIGURATION =====

export const NON_MULTIPLICABLE_ACTIONS = [
    // Structural elements
    '[', ']', '(', ')',

    // Numbers (they build, don't multiply)
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    // Control actions
    '⌫',        // Backspace
    '⇧',        // Shift layers  
    '★',        // Special symbol prompt
    'Undo',     // Undo action

    // Complete row actions (these replace, don't multiply)
    'K all', 'P all',

    // Copy actions (these replace, don't multiply)  
    // Note: copy actions start with 'copy_' so we check with startsWith
];

/**
 * Check if an action should multiply on repeat hits
 * @param {string} action - The action to check
 * @returns {boolean} - True if action should multiply, false otherwise
 */
export const shouldMultiplyAction = (action) => {
    // Check static non-multiplicable list
    if (NON_MULTIPLICABLE_ACTIONS.includes(action)) {
        return false;
    }

    // Check copy actions (dynamic)
    if (action.startsWith('copy_')) {
        return false;
    }

    // Everything else CAN multiply (including custom actions like [bobble]5)
    return true;
};

/**
 * Check if an action is a number
 * @param {string} action - The action to check  
 * @returns {boolean} - True if action is a number
 */
export const isNumberAction = (action) => {
    return /^[0-9]$/.test(action);
};

/**
 * Check if an action is a bracket/paren
 * @param {string} action - The action to check
 * @returns {boolean} - True if action is bracket or paren
 */
export const isBracketAction = (action) => {
    return ['[', ']', '(', ')'].includes(action);
};


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

// REPLACE THE ENTIRE handleAutoIncrement FUNCTION:
export const handleAutoIncrement = (action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount) => {
    // Only multiply if:
    // 1. Action can be multiplied 
    // 2. Same action as last time  
    // 3. Have a consecutive count building
    if (shouldMultiplyAction(action) && action === lastQuickAction) {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);

        // FIXED: Better parsing that understands the actual last element
        if (tempRowText.endsWith(`, ${action}`) || tempRowText === action) {
            // Replace the last occurrence of the action
            const lastCommaIndex = tempRowText.lastIndexOf(`, ${action}`);
            if (lastCommaIndex !== -1) {
                // Case: "K, P, K" → "K, P, K2"
                const beforeLast = tempRowText.substring(0, lastCommaIndex);
                setTempRowText(`${beforeLast}, ${action}${newCount}`);
            } else if (tempRowText === action) {
                // Case: "K" → "K2"
                setTempRowText(`${action}${newCount}`);
            }
            return true;
        } else if (tempRowText.endsWith(action)) {
            // Case: "[K" → "[K2" (no comma)
            const beforeAction = tempRowText.substring(0, tempRowText.length - action.length);
            setTempRowText(`${beforeAction}${action}${newCount}`);
            return true;
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
    if (isBracketAction(action)) {
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

export const handleCompleteRowAction = (action, setTempRowText, resetAutoIncrement, onComplete = null) => {
    if (action === 'K all') {
        setTempRowText('K all');
        resetAutoIncrement();
        // If completion callback provided, call it (for auto-saving)
        if (onComplete) {
            setTimeout(() => onComplete(), 100); // Small delay to ensure state updates
        }
        return true;
    }

    if (action === 'P all') {
        setTempRowText('P all');
        resetAutoIncrement();
        // If completion callback provided, call it (for auto-saving)
        if (onComplete) {
            setTimeout(() => onComplete(), 100);
        }
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
    rowInstructions,
    onCompleteAction = null
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

    if (handleCompleteRowAction(action, setTempRowText, resetAutoIncrement, onCompleteAction)) {
        return true;
    }

    // Handle auto-increment
    if (handleAutoIncrement(action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount)) {
        return true;
    }

    // Regular action - add with smart comma logic
    setLastQuickAction(shouldMultiplyAction(action) ? action : null);
    setConsecutiveCount(1);
    setTempRowText(prev => appendWithCommaLogic(prev, action));

    return true;
};

export default {
    NON_MULTIPLICABLE_ACTIONS,
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