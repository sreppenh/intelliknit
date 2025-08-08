import React from 'react';
import { PrepNoteDisplay } from '../../../../shared/components/PrepStepSystem';
import StepMenu from './StepMenu';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';
import { getStepPatternName } from '../../../../shared/utils/stepDisplayUtils';

// remove getStepPatternName from above

const StepCard = ({
    step,
    stepIndex,
    isEditable,
    isCompleted,
    isSpecial,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onEditStep,
    onDeleteStep,
    onEditPattern,
    onEditConfig,
    onPrepNoteClick,
}) => {
    // Extract prep note from various possible locations
    const prepNote = step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';

    // ✅ NEW: Get formatted display data
    const { description, contextualNotes, technicalData } = getFormattedStepDisplay(step);

    return (
        <div className="space-y-2">
            {/* PrepNote Display - Above the step, not numbered */}
            <PrepNoteDisplay
                note={prepNote}
                className="mx-1" // Slight margin to align with step content
                onClick={() => onPrepNoteClick && onPrepNoteClick(stepIndex)}
            />

            {/* Step Card */}
            <div className="bg-sage-50 border-sage-300 border-2 rounded-xl p-4 transition-all duration-200">
                <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {stepIndex + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1 text-left">
                                {/* ✅ NEW: Human-readable description */}
                                <h4 className={`text-sm font-semibold mb-1 text-left ${isCompleted ? 'text-wool-600' : 'text-wool-700'
                                    }`}>
                                    {description}
                                </h4>

                                {/* ✅ NEW: Contextual notes in italics (when available) */}
                                {contextualNotes && (
                                    <p className="text-xs text-wool-600 italic mb-1 text-left">
                                        {contextualNotes}
                                    </p>
                                )}

                                {/* ✅ UPDATED: Technical data display */}
                                <div className="text-xs text-wool-500 text-left">
                                    {technicalData}
                                </div>
                            </div>

                            {/* Three-dot menu */}
                            <StepMenu
                                step={step}
                                stepIndex={stepIndex}
                                isEditable={isEditable}
                                isSpecial={isSpecial}
                                isComponentFinished={isComponentFinished}
                                openMenuId={openMenuId}
                                onMenuToggle={onMenuToggle}
                                onEditStep={onEditStep}
                                onEditPattern={onEditPattern}
                                onEditConfig={onEditConfig}
                                onDeleteStep={onDeleteStep}
                                onPrepNoteClick={onPrepNoteClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepCard;