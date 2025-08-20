// src/features/steps/components/pattern-configs/PatternInputContainer.jsx
import React from 'react';
import NumberKeyboard from './NumberKeyboard';
import EnhancedKeyboard from './EnhancedKeyboard';
import CustomActionManager from './CustomActionManager';
import { KEYBOARD_LAYERS } from '../../../../shared/utils/patternKeyboardUtils';
import CustomActionEditor from './CustomActionEditor';

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
        return (
            <NumberKeyboard
                onAction={onAction}
                pendingText={pendingRepeatText}
                currentNumber={currentNumber}
            />
        );
        //  }
    }

    // Add after numbers mode check:
    if (keyboardMode === 'button_edit') {
        return (
            <CustomActionEditor
                patternType={patternType}
                currentProject={currentProject}
                updateProject={updateProject}
                editingAction={directStateAccess?.editingAction}
                editingIndex={directStateAccess?.editingIndex}
                onSave={() => directStateAccess?.setKeyboardMode('pattern')}
                onCancel={() => directStateAccess?.setKeyboardMode('pattern')}
            />
        );
    }


    // Render pattern keyboards for normal mode
    return (
        <>
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
                directStateAccess={directStateAccess}

            />
        </>
    );
};

export default PatternInputContainer;