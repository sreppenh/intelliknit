import React from 'react';
import { isInitializationStep, isMiddleStep, isFinishingStep } from '../../../../shared/utils/stepDisplayUtils';

const StepMenu = ({
    step,
    stepIndex,
    component,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onDeleteStep,
    onEditPattern,
    onEditConfig
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
            // Only show for middle steps if component isn't finished
            return !isComponentFinished();
        }

        return false;
    };

    if (!shouldShowMenu()) {
        return null;
    }

    // Check if step has pattern that can be edited
    const hasEditablePattern = step.wizardConfig?.stitchPattern?.pattern;

    // Check if step has editable configuration
    const hasEditableConfig = step.wizardConfig && (
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
                <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-36">
                    {isMiddleStep(step) && !isComponentFinished() && (
                        <>
                            {hasEditablePattern && (
                                <button
                                    onClick={(e) => onEditPattern(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                                >
                                    🧶 Edit Pattern
                                </button>
                            )}

                            {hasEditableConfig && (
                                <button
                                    onClick={(e) => onEditConfig(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                                >
                                    ⚙️ Edit Config
                                </button>
                            )}

                            <button
                                onClick={(e) => onDeleteStep(stepIndex, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                            >
                                🗑️ Delete Step
                            </button>
                        </>
                    )}

                    {isFinishingStep(step) && (
                        <button
                            onClick={(e) => onDeleteStep(stepIndex, e)}
                            className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-2 transition-colors"
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