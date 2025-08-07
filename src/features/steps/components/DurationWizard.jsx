import React, { useState } from 'react';
import DurationChoice from './wizard-steps/DurationChoice';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../shared/utils/StepSaveHelper';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const DurationWizard = ({
    wizardData,
    updateWizardData,
    currentStitches,
    construction,
    componentIndex,
    project,
    onBack,
    onExitToComponentSteps,
    editingStepIndex = null
}) => {
    IntelliKnitLogger.debug('DurationWizard props', { construction, currentStitches });

    const { dispatch } = useProjectsContext();
    const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

    const handleDurationComplete = async () => {
        // 🎯 PRESERVE: Original data structure
        const originalWizardData = { ...wizardData };

        // ✅ ADD: Save the step using our helper
        try {
            // Generate instruction from existing wizard data
            const instruction = generateInstructionFromWizardData(wizardData);

            const saveResult = await saveStepAndNavigate({
                instruction,
                effect: {
                    success: true,
                    endingStitches: currentStitches, // Duration doesn't change stitch count
                    startingStitches: currentStitches,
                    totalRows: wizardData.duration?.value || 1,
                    error: null
                },
                wizardData: originalWizardData,
                currentStitches,
                construction,
                componentIndex,
                editingStepIndex,
                dispatch,
                skipNavigation: true
            });

            if (saveResult.success) {
                // 🔧 PRESERVE: Navigate back like the original flow
                onExitToComponentSteps(); // ← FIX: Use this instead
            }
        } catch (saveError) {
            IntelliKnitLogger.error('Duration save failed', saveError);
        }
    };

    const generateInstructionFromWizardData = (data) => {

        const pattern = data.stitchPattern.pattern;
        if (data.duration?.type === 'rows') {

            return `${pattern} for ${data.duration.value} rows`;
        } else if (data.duration?.type === 'length') {

            return `${pattern} for ${data.duration.value} ${data.duration.units}`;
        } else if (data.duration?.type === 'until_length') {

            return `${pattern} until piece measures ${data.duration.value} ${data.duration.units}`;
        } else {

            return pattern;
        }
    };

    return (
        <div className="stack-lg">
            <DurationChoice
                wizardData={wizardData}
                updateWizardData={updateWizardData}
                construction={construction}
                project={project}
                existingPrepNote={wizardData.prepNote || ''}
                onSavePrepNote={(note) => updateWizardData('prepNote', note)}
            />

            {/* Complete Step Button */}
            <div className="pt-6 border-t border-wool-100">
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 btn-tertiary"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleDurationComplete}
                        disabled={!wizardData.duration?.value || isLoading}
                        className="flex-2 btn-primary"
                        style={{ flexGrow: 2 }}
                    >
                        {isLoading ? 'Saving...' : 'Complete Step'}
                    </button>
                </div>
            </div>

            <StepSaveErrorModal
                isOpen={!!error}
                error={error}
                onClose={clearError}
                onRetry={handleDurationComplete}
            />
        </div>
    );
};

export default DurationWizard;