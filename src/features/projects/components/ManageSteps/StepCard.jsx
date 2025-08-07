import React from 'react';
import { PrepNoteDisplay } from '../../../../shared/components/PrepStepSystem';
import StepMenu from './StepMenu';
import { getStepDurationDisplay } from '../../../../shared/utils/stepDisplayUtils';

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
    onEditPattern, // NEW
    onEditConfig,  //NEW
    onPrepNoteClick,
    getPatternDisplay,
    getMethodDisplay
}) => {
    // Extract prep note from various possible locations
    const prepNote = step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';

    return (
        <div className="space-y-2">
            {/* PrepNote Display - Above the step, not numbered */}
            <PrepNoteDisplay
                note={prepNote}
                className="mx-1" // Slight margin to align with step content
                onClick={() => onPrepNoteClick && onPrepNoteClick(stepIndex)} // ADD onClick HERE
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
                                <h4 className={`text-sm font-semibold mb-1 text-left ${isCompleted ? 'text-wool-600' : 'text-wool-700'
                                    }`}>
                                    {getPatternDisplay(step)}{getMethodDisplay(step)}
                                </h4>

                                <div className="flex items-center gap-3 text-xs text-wool-500 text-left">
                                    <span>
                                        {step.startingStitches || 0} → {step.endingStitches || step.expectedStitches || 0} sts
                                    </span>

                                    {/* Duration display */}
                                    {(() => {
                                        const duration = getStepDurationDisplay(step);
                                        return duration ? <span>{duration}</span> : null;
                                    })()}
                                    <span>{step.construction || 'flat'}</span>
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
                                onEditPattern={onEditPattern}     // ✅ NEW
                                onEditConfig={onEditConfig}       // ✅ NEW
                                onDeleteStep={onDeleteStep}
                                onPrepNoteClick={onPrepNoteClick}
                                getPatternDisplay={getPatternDisplay}
                                getMethodDisplay={getMethodDisplay}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Debug output - remove or hide in production */}
            {/* <pre className="text-xs text-left bg-gray-100 text-gray-800 mt-2 p-2 overflow-auto rounded-lg border border-gray-300">
                {JSON.stringify(step, null, 2)}
            </pre> */}
        </div>

    );
};



export default StepCard;