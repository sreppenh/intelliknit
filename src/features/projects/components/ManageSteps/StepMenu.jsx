import React from 'react';
import { isInitializationStep, isMiddleStep, isFinishingStep, getStepPatternName } from '../../../../shared/utils/stepDisplayUtils';

const StepMenu = ({
    step,
    stepIndex,
    component,
    editableStepIndex,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onDeleteStep,
    onEditPattern,
    onEditConfig,
    onEditColor  // ✨ NEW PROP
}) => {
    // 🎯 SIMPLE: Check step category
    if (isInitializationStep(step)) {
        return null; // No menu for initialization steps
    }

    // 🎯 NEW: Check if we should show menu at all
    const shouldShowMenu = () => {
        if (isFinishingStep(step)) {
            return true; // Always show menu for finishing steps (delete only)
        }

        if (isMiddleStep(step)) {
            // Only show for middle steps that are the currently editable step
            return !isComponentFinished() && stepIndex === editableStepIndex;
        }

        return false;
    };

    if (!shouldShowMenu()) {
        return null;
    }

    // Check if step has pattern that can be edited
    const hasEditablePattern = step.wizardConfig?.stitchPattern?.pattern;

    // ✨ NEW: Check if step is 2-color brioche
    const patternName = getStepPatternName(step);
    const isTwoColorBrioche = patternName === 'Two-Color Brioche';

    // Check if step has editable configuration
    // Exclude intrinsic shaping since it can't be edited separately
    const hasIntrinsicShaping = step.wizardConfig?.shapingConfig?.type === 'intrinsic_pattern' ||
        step.advancedWizardConfig?.shapingConfig?.type === 'intrinsic_pattern';

    const hasEditableConfig = !hasIntrinsicShaping && step.wizardConfig && (
        step.wizardConfig.duration?.type ||
        step.wizardConfig.hasShaping ||
        step.wizardConfig.shapingConfig?.type ||
        step.wizardConfig.stitchPattern?.customText ||
        step.wizardConfig.stitchPattern?.rowsInPattern
    );

    return (
        <div className="relative flex-shrink-0">
            <button
                onClick={(e) => onMenuToggle(step.id, e)}
                className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="3" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="8" cy="13" r="1.5" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {openMenuId === step.id && (
                <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-[160px] whitespace-nowrap">
                    {isMiddleStep(step) && !isComponentFinished() && (
                        <>
                            {/* ✨ NEW: Show "Edit Color" for 2-color brioche */}
                            {isTwoColorBrioche && (
                                <button
                                    onClick={(e) => onEditColor(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
                                >
                                    🎨 Edit Color
                                </button>
                            )}

                            {/* Show "Edit Pattern" for non-brioche patterns */}
                            {hasEditablePattern && !isTwoColorBrioche && (
                                <button
                                    onClick={(e) => onEditPattern(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
                                >
                                    🧶 Edit Pattern
                                </button>
                            )}

                            {hasEditableConfig && (
                                <button
                                    onClick={(e) => onEditConfig(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
                                >
                                    ⚙️ Edit Config
                                </button>
                            )}

                            <button
                                onClick={(e) => onDeleteStep(stepIndex, e)}
                                className="delete-menu-item rounded-b-lg"
                            >
                                🗑️ Delete Step
                            </button>
                        </>
                    )}

                    {isFinishingStep(step) && (
                        <button
                            onClick={(e) => onDeleteStep(stepIndex, e)}
                            className="delete-menu-item rounded-lg"
                        >
                            🗑️ Delete Step
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default StepMenu;