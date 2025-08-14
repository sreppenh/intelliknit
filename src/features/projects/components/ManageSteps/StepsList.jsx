import React from 'react';
import StepCard from './StepCard';
import { isConstructionStep, getComponentStatusWithDisplay, isFinishingStep } from '../../../../shared/utils/stepDisplayUtils';

const StepsList = ({
    component,
    componentName, // This prop is already being passed from ManageSteps
    editableStepIndex,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onEditStep,
    onEditPattern,
    onEditConfig,
    onStartKnitting,
    onBack,
    onDeleteStep,
    onPrepNoteClick,
    onAfterNoteClick,
    // New props for buttons
    onAddStep,
    onFinishComponent,
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

    return (
        <div className="stack-sm">
            {/* Just the essentials */}
            <div className="flex justify-between items-center">
                <h3 className="content-header-secondary text-left">{component.name}</h3>
                {/*}     <h3 className="content-header-secondary text-left">Instructions</h3> */}
                <div className="flex gap-2">
                    {!isComponentFullyEntered() ? (
                        <>
                            <button onClick={onAddStep} className="bg-yarn-600 hover:bg-yarn-700 text-white py-2 px-4 rounded-xl font-semibold text-sm transition-colors">+ Add Step</button>
                            {component.steps.length > 0 && (
                                <button onClick={onFinishComponent} className="bg-sage-500 hover:bg-sage-600 text-white py-2 px-4 rounded-xl font-semibold text-sm transition-colors">🏁 Finish</button>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={onStartKnitting} className="btn-primary btn-sm">🧶 Start Knitting</button>
                            {/*     <button onClick={onBack} className="btn-secondary btn-sm">📋 Project Overview</button> */}
                        </>
                    )}
                </div>
            </div>


            {component.steps.map((step, stepIndex) => {
                const isEditable = stepIndex === editableStepIndex;
                const isCompleted = step.completed;
                const isSpecial = isConstructionStep(step);

                return (
                    <StepCard
                        key={step.id}
                        step={step}
                        stepIndex={stepIndex}
                        isEditable={isEditable}
                        isCompleted={isCompleted}
                        isSpecial={isSpecial}
                        isComponentFinished={isComponentFinished}
                        openMenuId={openMenuId}
                        onMenuToggle={onMenuToggle}
                        editableStepIndex={editableStepIndex}
                        onEditStep={onEditStep}
                        onEditPattern={onEditPattern}
                        onEditConfig={onEditConfig}
                        onDeleteStep={onDeleteStep}
                        onPrepNoteClick={onPrepNoteClick}
                        onAfterNoteClick={onAfterNoteClick}
                    />
                );
            })}
        </div>
    );
};

export default StepsList;