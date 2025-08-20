// src/features/steps/components/pattern-configs/EnhancedKeyboard.jsx
import React, { useState } from 'react';
import HoldableButton from './HoldableButton';
import {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getButtonStyles,
    getCustomActions,
    isWorkToEndAction
} from '../../../../shared/utils/patternKeyboardUtils';
import { isRowComplete, getMaxSafeMultiplier } from '../../../../shared/utils/stitchCalculatorUtils';


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
    getStitchCalculation, // Added back
    isLocked = false,
    directStateAccess  // ← ADD THIS
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

    // Validation Function
    // Simplified validation using shared function:
    const getRowStatus = () => {
        if (!getStitchCalculation) return { isComplete: false, reason: 'no_calculation' };

        const currentCalc = getStitchCalculation();
        if (!currentCalc || !currentCalc.isValid) return { isComplete: false, reason: 'invalid' };

        // Get custom actions
        const customActionsLookup = {};
        const patternKey = patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
        const customActions = context?.project?.customKeyboardActions?.[patternKey] || [];

        customActions.forEach(customAction => {
            if (typeof customAction === 'object' && customAction.name) {
                customActionsLookup[customAction.name] = customAction;
            }
        });

        return isRowComplete(tempRowText, currentCalc.previousStitches, customActionsLookup);
    };


    // validation function
    const getActionMaxMultiplier = (action) => {
        if (!getStitchCalculation) return 999;

        const currentCalc = getStitchCalculation();
        if (!currentCalc || !currentCalc.isValid) return 999;

        const remainingStitches = currentCalc.previousStitches - currentCalc.stitchesConsumed;

        // Get custom actions for current pattern
        const customActionsLookup = {};
        const patternKey = patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
        const customActions = context?.project?.customKeyboardActions?.[patternKey] || [];

        customActions.forEach(customAction => {
            if (typeof customAction === 'object' && customAction.name) {
                customActionsLookup[customAction.name] = customAction;
            }
        });

        return getMaxSafeMultiplier(action, remainingStitches, customActionsLookup);
    };


    // NEW: Check if we have open brackets/parens that would make "to end" invalid
    const hasOpenStructure = () => {
        if (!tempRowText) return false;

        let openBrackets = 0;
        let openParens = 0;

        for (const char of tempRowText) {
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
            if (char === '(') openParens++;
            if (char === ')') openParens--;
        }

        return openBrackets > 0 || openParens > 0;
    };


    // Get custom actions for current pattern type
    const customActions = ((layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern') ||
        (layer === KEYBOARD_LAYERS.TERTIARY && patternType === 'Cable Pattern')) ?
        getCustomActions(patternType, context?.project) : [];


    const handleCustomAction = (action, index) => {
        if (action === 'Custom') {
            // Empty slot - create new action
            if (directStateAccess) {
                directStateAccess.setKeyboardMode('button_edit');
                directStateAccess.setEditingAction(null);
                directStateAccess.setEditingIndex(index);
            }
        } else {
            // Existing action - use it
            const actionName = typeof action === 'object' ? action.name : action;
            onAction(actionName);
        }
    };

    const handleCustomLongPress = (action, index) => {
        if (action !== 'Custom') {
            // Long press on existing action - edit it
            if (directStateAccess) {
                directStateAccess.setKeyboardMode('button_edit');
                directStateAccess.setEditingAction(action);
                directStateAccess.setEditingIndex(index);
            }
        }
    };

    return (
        <div className="space-y-3">
            {/* Full-Row Actions (Dark Sage - top row) */}
            <div className={`grid gap-3 ${keyboardLayout.fullRow.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {keyboardLayout.fullRow.map((action, index) => {
                    // NEW: Check if this is a "to end" action that should be disabled
                    const isToEndAction = isWorkToEndAction(action);
                    const shouldDisableToEnd = isToEndAction && hasOpenStructure();
                    const isDisabled = shouldDisableToEnd;

                    return (
                        <HoldableButton
                            key={`fullrow-${action}-${index}`}
                            action={action}
                            className={`${getButtonStyles('fullRow', isMobile)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDisabled}
                            tempRowText={tempRowText}
                            onClick={onAction}
                            maxMultiplier={getActionMaxMultiplier(action)}
                        >
                            {action}
                        </HoldableButton>
                    );
                })}
            </div>

            {/* Input Actions (Light Sage - main keyboard) */}
            <div className="grid gap-2 grid-cols-3">
                {keyboardLayout.input.map((action, index) => {
                    const buttonType = action === '★' ? 'special' :
                        action.startsWith('Custom ') ? 'special' : 'input';

                    const buttonClass = getButtonStyles(buttonType, isMobile);

                    return (
                        <HoldableButton
                            key={`input-${action}-${index}`}
                            action={action}
                            buttonType={buttonType}
                            className={buttonClass}
                            tempRowText={tempRowText}
                            onClick={onAction}
                            maxMultiplier={getActionMaxMultiplier(action)}
                        >
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

                            {customActions.map((action, index) => (
                                <div key={`custom-${index}`} className="relative">
                                    <button
                                        onClick={() => handleCustomAction(action, index)}
                                        className={`w-full h-10 rounded-lg text-sm font-medium border-2 transition-colors ${action === 'Custom'
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

                                    {/* Edit icon for existing actions */}
                                    {action !== 'Custom' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCustomLongPress(action, index);
                                            }}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-yarn-200 hover:bg-yarn-300 text-yarn-700 rounded-full text-xs flex items-center justify-center border border-yarn-300"
                                            title="Edit custom action"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
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

export default EnhancedKeyboard;