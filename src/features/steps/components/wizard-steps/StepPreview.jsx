// src/features/steps/components/wizard-steps/StepPreview.jsx
import React from 'react';
import { useStepGeneration } from '../../hooks/useStepGeneration';
import { useStepCalculation } from '../../hooks/useStepCalculation';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

const StepPreview = ({
    wizardData,
    currentStitches,
    construction,
    component,
    componentIndex,
    onBack,
    onAddStep,
    onAddStepAndContinue,
    editingStepIndex = null,
    mode
}) => {
    const { dispatch } = useProjectsContext();
    const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

    // Generate step preview using existing hooks
    const { generateInstruction } = useStepGeneration(construction);
    const { calculateEffect } = useStepCalculation();

    const stepInstruction = generateInstruction(wizardData);
    const stepEffect = calculateEffect(wizardData, currentStitches, construction);

    IntelliKnitLogger.debug('StepPreview', {
        instruction: stepInstruction,
        startingStitches: currentStitches,
        endingStitches: stepEffect.endingStitches
    });

    const handleAddStep = async () => {
        try {
            const saveResult = await saveStepAndNavigate({
                instruction: stepInstruction,
                effect: stepEffect,
                wizardData: wizardData,
                currentStitches,
                construction,
                componentIndex,
                editingStepIndex,
                dispatch,
                skipNavigation: true
            });

            if (saveResult.success) {
                onAddStep();
            }
        } catch (saveError) {
            IntelliKnitLogger.error('Step save failed', saveError);
        }
    };

    const handleAddStepAndContinue = async () => {
        try {
            const saveResult = await saveStepAndNavigate({
                instruction: stepInstruction,
                effect: stepEffect,
                wizardData: wizardData,
                currentStitches,
                construction,
                componentIndex,
                editingStepIndex,
                dispatch,
                skipNavigation: true
            });

            if (saveResult.success) {
                onAddStepAndContinue();
            }
        } catch (saveError) {
            IntelliKnitLogger.error('Step save failed', saveError);
        }
    };

    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Step Preview</h2>
                <p className="content-subheader">Review your step before adding it to the component</p>
            </div>

            {/* Step Preview Card */}
            <div className="card">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sm font-bold text-sage-700">
                            {component.steps.length + 1}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-wool-700 mb-2">
                                {stepInstruction}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-wool-600">
                                <span>
                                    {currentStitches} → {stepEffect.endingStitches || currentStitches} stitches
                                </span>
                                <span>{construction}</span>
                                {stepEffect.totalRows && (
                                    <span>{stepEffect.totalRows} {stepEffect.totalRows === 1 ? 'row' : 'rows'}</span>
                                )}
                            </div>

                            {/* Show shaping info if present */}
                            {wizardData.hasShaping && wizardData.shapingConfig && (
                                <div className="mt-3 p-3 bg-sage-50 border border-sage-200 rounded-lg">
                                    <div className="text-sm text-sage-700">
                                        <span className="font-medium">Shaping:</span> {wizardData.shapingConfig.type}
                                        {wizardData.shapingConfig.type === 'marker_phases' && (
                                            <span className="ml-2 text-sage-600">
                                                ({wizardData.shapingConfig.config?.markerCount || 0} markers)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-wool-100">
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 btn-tertiary"
                        disabled={isLoading}
                    >
                        ← Back
                    </button>

                    <button
                        onClick={handleAddStep}
                        disabled={isLoading}
                        className="flex-1 btn-primary"
                    >
                        {isLoading ? 'Saving...' : 'Add Step'}
                    </button>

                    <button
                        onClick={handleAddStepAndContinue}
                        disabled={isLoading}
                        className="flex-1 btn-secondary"
                    >
                        {isLoading ? 'Saving...' : 'Add & Continue'}
                    </button>
                </div>
            </div>

            <StepSaveErrorModal
                isOpen={!!error}
                error={error}
                onClose={clearError}
                onRetry={handleAddStep}
            />
        </div>
    );
};

export default StepPreview;