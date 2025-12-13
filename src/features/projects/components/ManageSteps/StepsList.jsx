// ManageSteps Page

import React from 'react';
import StepCard from './StepCard';
import { isConstructionStep, getComponentStatusWithDisplay, isFinishingStep } from '../../../../shared/utils/stepDisplayUtils';
import { getPrepCardColorInfo } from '../../../../shared/utils/prepCardUtils';
import { Palette } from 'lucide-react';
import { UnifiedPrepDisplay } from '../../../../shared/components/PrepStepSystem';
import { getStepProgressState, PROGRESS_STATUS } from '../../../../shared/utils/progressTracking';

const StepsList = ({
    component,
    componentName,
    editableStepIndex,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onEditStep,
    onEditPattern,
    onEditColor,
    onEditConfig,
    onStartKnitting,
    onBack,
    onDeleteStep,
    onPrepNoteClick,
    onAfterNoteClick,
    onAddStep,
    onFinishComponent,  // Still passed as prop but not used in UI anymore
    project,
}) => {
    // Determine if component is fully entered (same logic as ManageSteps)
    const isComponentFullyEntered = () => {
        // Formal finishing step
        if (component.steps.some(step => isFinishingStep(step))) return true;

        // OR ending with 0 stitches  
        if (component.steps.length > 0) {
            const lastStep = component.steps[component.steps.length - 1];
            return lastStep.endingStitches === 0;
        }

        return false;
    };

    if (component.steps.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-wool-200 shadow-sm">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-wool-600 mb-2">No Steps Yet</h3>
                <p className="content-subheader">Add your first step to get started</p>
            </div>
        );
    }

    // ✅ UPDATED: Buttons with text - Add and Knit
    return (
        <div className="stack-sm">
            <div className="flex justify-between items-center">
                <h3 className="content-header-secondary text-left">Instructions</h3>
                <div className="flex gap-2">
                    {!isComponentFullyEntered() ? (
                        <>
                            {/* Show Knit button when component has steps */}
                            {component.steps.length > 0 && (
                                <button
                                    onClick={onStartKnitting}
                                    className="btn-secondary btn-sm"
                                >
                                    <span className="text-lg">🧶</span>
                                    <span className="ml-1"> Starting Knitting</span>
                                </button>
                            )}
                            {/* Always show Add button */}
                            <button
                                onClick={onAddStep}
                                className="btn-primary btn-sm"
                            >
                                <span className="text-lg">➕</span>
                                <span className="ml-1"> Add Step</span>
                            </button>
                        </>
                    ) : (
                        /* Component is finished - only show Knit button */
                        <button
                            onClick={onStartKnitting}
                            className="btn-primary btn-sm"
                        >
                            <span className="text-lg">🧶</span>
                            <span className="ml-1">Knit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Steps with Unified PrepCards */}
            <div className="space-y-2">
                {component.steps.map((step, stepIndex) => {
                    // ✅ Get completion status from progress tracking
                    const progress = project?.id && component?.id ?
                        getStepProgressState(step.id, component.id, project.id) :
                        { status: PROGRESS_STATUS.NOT_STARTED };
                    const isCompleted = progress.status === PROGRESS_STATUS.COMPLETED;

                    return (
                        <div key={step.id || stepIndex}>
                            {/* Unified PrepCard */}
                            <UnifiedPrepDisplay
                                step={step}
                                stepIndex={stepIndex}
                                component={component}
                                project={project}
                                onClick={() => onPrepNoteClick && onPrepNoteClick(stepIndex)}
                            />

                            {/* Regular StepCard */}
                            <StepCard
                                step={step}
                                stepIndex={stepIndex}
                                isEditable={!isComponentFinished}
                                isCompleted={isCompleted}
                                isComponentFinished={isComponentFinished}
                                openMenuId={openMenuId}
                                onMenuToggle={onMenuToggle}
                                onEditStep={onEditStep}
                                onEditPattern={onEditPattern}
                                onEditConfig={onEditConfig}
                                onEditColor={onEditColor}
                                onDeleteStep={onDeleteStep}
                                onPrepNoteClick={onPrepNoteClick}
                                onAfterNoteClick={onAfterNoteClick}
                                editableStepIndex={editableStepIndex}
                                componentName={componentName}
                                project={project}
                                component={component}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepsList;