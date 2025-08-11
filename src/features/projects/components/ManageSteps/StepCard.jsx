import React from 'react';
import { PrepNoteDisplay, AfterNoteDisplay } from '../../../../shared/components/PrepStepSystem';
import StepMenu from './StepMenu';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';

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
    onAfterNoteClick,
    editableStepIndex,
}) => {
    // Extract prep note from various possible locations
    const prepNote = step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';

    // ✅ NEW: Extract after note from various possible locations
    const afterNote = step.afterNote ||
        step.wizardConfig?.afterNote ||
        step.advancedWizardConfig?.afterNote ||
        '';

    // DEBUG: Add this line temporarily
    console.log('🔧 AfterNote Debug:', {
        stepIndex,
        afterNote,
        stepAfterNote: step.afterNote,
        wizardAfterNote: step.wizardConfig?.afterNote,
        advancedAfterNote: step.advancedWizardConfig?.afterNote
    });



    // ✅ Get formatted display data
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } = getFormattedStepDisplay(step);

    // Check if we have both types of notes for divider logic
    const hasPatternNotes = contextualPatternNotes && contextualPatternNotes.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes && contextualConfigNotes.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

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
                                {/* Human-readable description */}
                                <h4 className={`text-sm font-semibold mb-1 text-left ${isCompleted ? 'text-wool-600' : 'text-wool-700'
                                    }`}>
                                    {description}
                                </h4>

                                {/* Dual Contextual Notes Section */}
                                {(hasPatternNotes || hasConfigNotes) && (
                                    <div className="text-xs text-wool-600 italic mb-1 text-left">
                                        {/* Pattern Notes */}
                                        {hasPatternNotes && (
                                            <div className="whitespace-pre-line">
                                                {contextualPatternNotes}
                                            </div>
                                        )}

                                        {/* Minimal Divider Rule - Only when both notes present */}
                                        {hasBothNotes && (
                                            <div className="my-1.5 border-t border-wool-300 opacity-30"></div>
                                        )}

                                        {/* Config Notes */}
                                        {hasConfigNotes && (
                                            <div className="whitespace-pre-line">
                                                {contextualConfigNotes}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Technical data display */}
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
                                editableStepIndex={editableStepIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ NEW: AfterNote Display - Below the step, not numbered */}
            <AfterNoteDisplay
                note={afterNote}
                className="mx-1" // Slight margin to align with step content
                onClick={() => onAfterNoteClick && onAfterNoteClick(stepIndex)}
            />
        </div>
    );
};

export default StepCard;