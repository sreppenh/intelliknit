// src/features/steps/components/pattern-configs/EnhancedKeyboard.jsx
import React, { useState } from 'react';
import HoldableButton from './HoldableButton';
import IncrementInput from '../../../../shared/components/IncrementInput';
import {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getButtonStyles,
    getCustomActions
} from '../../../../shared/utils/patternKeyboardUtils';

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

export default EnhancedKeyboard;