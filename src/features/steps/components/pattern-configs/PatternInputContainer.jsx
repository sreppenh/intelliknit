// src/features/steps/components/pattern-configs/PatternInputContainer.jsx
import React from 'react';
import NumberKeyboard from './NumberKeyboard';
import IncrementInputNumberMode from './IncrementInputNumberMode';
import EnhancedKeyboard from './EnhancedKeyboard';
import CustomActionManager from './CustomActionManager';
import { KEYBOARD_LAYERS } from '../../../../shared/utils/patternKeyboardUtils';

/**
 * PatternInputContainer - Pattern-aware input orchestrator
 * 
 * Intelligently renders appropriate tools based on pattern type and mode.
 * Only passes relevant props to each tool, not everything.
 */
const PatternInputContainer = ({
    // Core state
    keyboardMode,
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

    // Advanced features (only for patterns that need them)
    getStitchCalculation,

    // Handlers
    onAction,

    // ADVANCED: Direct state access for complex patterns
    directStateAccess
}) => {

    // Determine if this pattern type supports advanced features
    const isAdvancedPattern = () => {
        return ['Cable Pattern', 'Lace Pattern'].includes(patternType);
    };

    // Render number input mode
    if (keyboardMode === 'numbers') {
        // Advanced patterns with stitch validation get IncrementInput  
        if (isAdvancedPattern() && pendingRepeatText && pendingRepeatText !== '') {
            return (
                <IncrementInputNumberMode
                    // Core props
                    pendingText={pendingRepeatText}
                    currentNumber={currentNumber}
                    tempRowText={tempRowText}

                    // Advanced pattern features
                    getStitchCalculation={getStitchCalculation}
                    currentProject={currentProject}
                    patternType={patternType}

                    // Direct state access for advanced patterns
                    directStateAccess={directStateAccess}
                />
            );
        } else {
            // Basic patterns get NumberKeyboard
            return (
                <NumberKeyboard
                    onAction={onAction}
                    pendingText={pendingRepeatText}
                    currentNumber={currentNumber}
                />
            );
        }
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
                getStitchCalculation={getStitchCalculation}


            />
        </>
    );
};

export default PatternInputContainer;