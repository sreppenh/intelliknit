// src/features/steps/components/pattern-configs/PatternInputContainer.jsx
import React from 'react';
import NumberKeyboard from './NumberKeyboard';
import EnhancedKeyboard from './EnhancedKeyboard';
import CustomActionManager from './CustomActionManager';
import { KEYBOARD_LAYERS } from '../../../../shared/utils/patternKeyboardUtils';

/**
 * PatternInputContainer - Smart input orchestrator for pattern entry
 * 
 * This container intelligently renders the appropriate input method based on:
 * - Current keyboard mode (pattern vs numbers)
 * - Pattern type (Cable, Lace, etc.)
 * - Current keyboard layer
 * 
 * Future: Will also handle increment controls, custom button creator, Fair Isle tools
 */
const PatternInputContainer = ({
    // Keyboard mode state
    keyboardMode,

    // Pattern context
    patternType,
    currentKeyboardLayer,

    // UI state
    isMobile,
    isCreatingRepeat,
    bracketState,
    tempRowText,
    isLocked,

    // Data
    rowInstructions,
    pendingRepeatText,
    currentNumber,

    // Project context
    currentProject,
    updateProject,
    newActionStitches,
    setNewActionStitches,

    // Row context
    currentRowNumber,
    construction,

    // Handlers
    onAction
}) => {

    // Render NumberKeyboard for number input mode
    if (keyboardMode === 'numbers') {
        return (
            <NumberKeyboard
                onAction={onAction}
                pendingText={pendingRepeatText}
                currentNumber={currentNumber}
            />
        );
    }

    // Render pattern keyboards for normal mode
    return (
        <>
            {/* Custom Action Manager for tertiary layer */}
            {currentKeyboardLayer === KEYBOARD_LAYERS.TERTIARY && (
                <CustomActionManager
                    patternType={patternType}
                    onActionSelect={onAction}
                    currentProject={currentProject}
                    updateProject={updateProject}
                    newActionStitches={newActionStitches}
                    setNewActionStitches={setNewActionStitches}
                />
            )}

            {/* Enhanced Keyboard - main pattern input */}
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
                onAction={onAction}
                bracketState={bracketState}
                tempRowText={tempRowText}
                isLocked={isLocked}
            />
        </>
    );
};

export default PatternInputContainer;