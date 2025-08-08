import React from 'react';
import { getStepPatternName } from '../../../../shared/utils/stepDisplayUtils';

const StepMenu = ({
    step,
    stepIndex,
    isEditable,
    isSpecial,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onEditStep,
    onDeleteStep,
    onEditPattern,
    onEditConfig
}) => {


    const isCastOnStep = getStepPatternName(step) === 'Cast On';
    const shouldShowMenu = (isEditable && !isComponentFinished()) ||
        (isSpecial && !isCastOnStep);

    if (!shouldShowMenu) return null;

    // CHECK IF THIS IS THE FIRST STEP (Cast On)
    const isFirstStep = stepIndex === 0;

    // ✅ NEW: Check if step has pattern that can be edited
    const hasEditablePattern = step.wizardConfig?.stitchPattern?.pattern;

    // ✅ NEW: Check if step has editable configuration
    const hasEditableConfig = step.wizardConfig && (
        // Has duration configuration
        step.wizardConfig.duration?.type ||
        // Has shaping configuration  
        step.wizardConfig.hasShaping ||
        step.wizardConfig.shapingConfig?.type ||
        // Has custom pattern configuration (customText, rowsInPattern)
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
                    {isEditable && !isComponentFinished() && (
                        <>
                            <button
                                onClick={(e) => onEditStep(stepIndex, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-sm flex items-center gap-2 transition-colors"
                            >
                                ✏️ {isCastOnStep ? 'View Cast On' : 'Edit Step'}
                            </button>

                            {/* ✅ NEW: Edit Pattern option */}
                            {hasEditablePattern && !isCastOnStep && (
                                <button
                                    onClick={(e) => onEditPattern(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                                >
                                    🧶 Edit Pattern
                                </button>
                            )}

                            {/* ✅ NEW: Edit Config option */}
                            {hasEditableConfig && !isCastOnStep && (
                                <button
                                    onClick={(e) => onEditConfig(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                                >
                                    ⚙️ Edit Config
                                </button>
                            )}

                            {/* ONLY SHOW DELETE FOR NON-FIRST STEPS */}
                            {!isFirstStep && (
                                <button
                                    onClick={(e) => onDeleteStep(stepIndex, e)}
                                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                                >
                                    🗑️ Delete Step
                                </button>
                            )}
                        </>
                    )}

                    {/* Special case for Bind Off steps */}
                    {isSpecial && getStepPatternName(step) === 'Bind Off' && (
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
