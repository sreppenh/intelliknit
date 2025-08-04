import React from 'react';

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
    getPatternDisplay
}) => {
    const shouldShowMenu = (isEditable && !isComponentFinished()) ||
        (isSpecial && getPatternDisplay(step) === 'Bind Off');

    if (!shouldShowMenu) return null;

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
                                ✏️ Edit Step
                            </button>
                            <button
                                onClick={(e) => onDeleteStep(stepIndex, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                            >
                                🗑️ Delete Step
                            </button>
                        </>
                    )}

                    {/* Special case for Bind Off steps */}
                    {isSpecial && getPatternDisplay(step) === 'Bind Off' && (
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
