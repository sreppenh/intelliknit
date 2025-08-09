import React from 'react';
import StepCard from './StepCard';
import { isConstructionStep } from '../../../../shared/utils/stepDisplayUtils';

const StepsList = ({
    component,
    editableStepIndex,
    isComponentFinished,
    openMenuId,
    onMenuToggle,
    onEditStep,
    onEditPattern,
    onEditConfig,
    onDeleteStep,
    onPrepNoteClick,
}) => {
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
            <div className="flex justify-between items-center">
                <h3 className="content-header-secondary">{component.name} Steps</h3>
                <span className="text-xs text-wool-500 bg-white px-2 py-1 rounded-full border border-wool-200">
                    {component.steps.filter(s => s.completed).length} of {component.steps.length}
                </span>
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
                        editableStepIndex={editableStepIndex} // ← ADD THIS
                        onEditStep={onEditStep}
                        onEditPattern={onEditPattern}
                        onEditConfig={onEditConfig}
                        onDeleteStep={onDeleteStep}
                        onPrepNoteClick={onPrepNoteClick} // ADD THIS LINE

                    />
                );
            })}
        </div>
    );
};

export default StepsList;
