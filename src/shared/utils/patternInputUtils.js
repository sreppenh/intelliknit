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
    'K to end', 'P to end',  // NEW
    'K all', 'P all',        // Legacy support

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

/**
 * Check if we're currently inside brackets/parentheses
 */
const isInsideBrackets = (text) => {
    let openBrackets = 0;
    let openParens = 0;

    for (const char of text) {
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
    }

    return openBrackets > 0 || openParens > 0;
};

/**
 * Get the current bracket context - what's inside the most recent unclosed bracket
 */
const getCurrentBracketContext = (text) => {
    let lastBracketStart = -1;
    let lastParenStart = -1;
    let bracketDepth = 0;
    let parenDepth = 0;

    // Find the most recent unclosed bracket or paren
    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '[') {
            if (bracketDepth === 0) lastBracketStart = i;
            bracketDepth++;
        } else if (char === ']') {
            bracketDepth--;
            if (bracketDepth === 0) lastBracketStart = -1;
        } else if (char === '(') {
            if (parenDepth === 0) lastParenStart = i;
            parenDepth++;
        } else if (char === ')') {
            parenDepth--;
            if (parenDepth === 0) lastParenStart = -1;
        }
    }

    // Return the context of the most recently opened bracket/paren
    const contextStart = Math.max(lastBracketStart, lastParenStart);

    if (contextStart === -1) {
        return { isInside: false, context: text, startIndex: 0 };
    }

    return {
        isInside: true,
        context: text.substring(contextStart + 1), // Everything after the opening bracket
        startIndex: contextStart + 1
    };
};

// ===== AUTO-INCREMENT LOGIC =====

export const handleAutoIncrement = (action, lastQuickAction, consecutiveCount, tempRowText, setTempRowText, setConsecutiveCount) => {
    // Only multiply if:
    // 1. Action can be multiplied 
    // 2. Same action as last time  
    // 3. Have a consecutive count building
    if (shouldMultiplyAction(action) && action === lastQuickAction) {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);

        // Get current bracket context
        const bracketContext = getCurrentBracketContext(tempRowText);

        if (bracketContext.isInside) {
            // INSIDE BRACKETS: Work within current bracket context only
            const contextText = bracketContext.context;
            const lastActionIndex = contextText.lastIndexOf(action);

            if (lastActionIndex !== -1) {
                const beforeAction = tempRowText.substring(0, bracketContext.startIndex + lastActionIndex);
                const afterActionInContext = contextText.substring(lastActionIndex + action.length);
                const afterContext = tempRowText.substring(bracketContext.startIndex + contextText.length);

                // Check if it's already numbered within this context
                const numberedMatch = contextText.substring(lastActionIndex).match(/^([A-Za-z]+)(\d+)/);
                if (numberedMatch) {
                    // Replace existing number: "[P2" → "[P3" (within bracket context)
                    const actionPart = numberedMatch[1];
                    const restOfContext = contextText.substring(lastActionIndex + numberedMatch[0].length);
                    setTempRowText(`${beforeAction}${actionPart}${newCount}${restOfContext}${afterContext}`);
                } else {
                    // Add number to simple action: "[P" → "[P2" (within bracket context)
                    setTempRowText(`${beforeAction}${action}${newCount}${afterActionInContext}${afterContext}`);
                }
                return true;
            }
        } else {
            // OUTSIDE BRACKETS: Use comma-separated logic
            const actions = tempRowText.split(', ').filter(a => a.trim() !== '');

            if (actions.length > 0) {
                const lastIndex = actions.length - 1;
                const lastAction = actions[lastIndex];

                // Check if the last action matches what we're trying to increment
                if (lastAction === action) {
                    // Simple case: "K" becomes "K2"
                    actions[lastIndex] = `${action}${newCount}`;
                    setTempRowText(actions.join(', '));
                    return true;
                } else if (lastAction.match(/^([A-Za-z]+)(\d+)$/) && lastAction.startsWith(action)) {
                    // Already numbered case: "K2" becomes "K3"
                    actions[lastIndex] = `${action}${newCount}`;
                    setTempRowText(actions.join(', '));
                    return true;
                }
            }
        }
    }
    return false;
};

// ===== SMART DELETE LOGIC =====

export const handleSmartDelete = (tempRowText, setTempRowText, resetAutoIncrement, isLongPress = false, onBracketChange = null) => {
    if (!tempRowText) return false;

    // Check if we're about to delete a bracket/paren character
    const lastChar = tempRowText[tempRowText.length - 1];
    const isDeletingBracket = ['[', ']', '(', ')'].includes(lastChar);

    // FIRST: Check if the ENTIRE string ends with a numbered action (like "[K2" or "YO5")
    const directNumberMatch = tempRowText.match(/^(.+?)([A-Za-z]+)(\d+)$/);

    if (directNumberMatch && !isLongPress) {
        const [, prefix, actionPart, number] = directNumberMatch;
        const currentNum = parseInt(number);

        if (currentNum > 2) {
            // Decrement: "[K3" → "[K2"
            const newText = `${prefix}${actionPart}${currentNum - 1}`;
            setTempRowText(newText);
        } else {
            // Remove number: "[K2" → "[K"
            const newText = `${prefix}${actionPart}`;
            setTempRowText(newText);
        }

        resetAutoIncrement();
        return true;
    }

    // SECOND: Fall back to comma-separated action logic
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

    const newText = actions.join(', ');
    setTempRowText(newText);
    resetAutoIncrement();

    // IMPORTANT: Reset bracket state if we deleted a bracket character
    if (onBracketChange && isDeletingBracket) {
        onBracketChange(newText, { deletedBracket: lastChar });
    }

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
        // Get stitch consumption and production values
        const consumesInput = prompt('How many stitches does this consume?', '1');
        const producesInput = prompt('How many stitches does this produce?', '1');

        const consumes = parseInt(consumesInput) || 1;
        const produces = parseInt(producesInput) || 1;

        // For now, just add the action to the text
        // TODO: Store custom action with consumes/produces values in project data
        setTempRowText(prev => appendWithCommaLogic(prev, customAction.trim()));

        // Log the values for debugging (remove in production)
        console.log(`Custom action "${customAction}": consumes ${consumes}, produces ${produces}`);

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

// FIXED: Remove auto-close behavior from "to end" actions
export const handleCompleteRowAction = (action, setTempRowText, resetAutoIncrement, onComplete = null) => {
    // "K to end" and "P to end" should NOT auto-close - they're blocking actions, not completion actions
    if (action === 'K to end' || action === 'P to end') {
        setTempRowText(prev => appendWithCommaLogic(prev, action));
        resetAutoIncrement();
        // DO NOT call onComplete() - this was causing auto-close
        return true;
    }

    // Keep legacy "K all" and "P all" with original auto-close behavior for backward compatibility
    if (action === 'K all') {
        setTempRowText('K all');
        resetAutoIncrement();
        if (onComplete) {
            setTimeout(() => onComplete(), 100);
        }
        return true;
    }

    if (action === 'P all') {
        setTempRowText('P all');
        resetAutoIncrement();
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