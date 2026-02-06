// src/features/steps/components/edit/EditSequentialPhasesForm.jsx
import React, { useState } from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import PageHeader from '../../../../shared/components/PageHeader';
import PhaseConfig from '../shaping-wizard/PhaseConfig';
import { getHumanReadableDescription } from '../../../../shared/utils/stepDescriptionUtils';

/**
 * EditSequentialPhasesForm - Thin wrapper around PhaseConfig
 * 
 * Replaces the 345-line duplicate with a simple wrapper that reuses
 * the main PhaseConfig component in edit mode.
 */
const EditSequentialPhasesForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();
    // NEW (fixed):
    const [shapingData, setShapingData] = useState(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step) {
            const existingShapingData = step.wizardConfig?.shapingConfig?.config || {};
            return {
                type: 'phases',
                phases: existingShapingData.phases || [],
                construction: existingShapingData.construction || step.construction || 'flat',
                description: existingShapingData.description || ''
            };
        }

        return { type: 'phases', phases: [], construction: 'flat', description: '' };
    });

    // ===== EARLY RETURN FOR VALIDATION =====
    if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const component = currentProject.components[componentIndex];
    const step = component.steps[editingStepIndex];

    if (!step) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Step not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const construction = step?.construction || 'flat';

    // Get current stitches for calculations
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) {
            return step.startingStitches || 0;
        }
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };

    const currentStitches = getCurrentStitches();

    // ===== SAVE HANDLER =====
    const handleComplete = (configData) => {
        // Create updated shaping configuration
        const updatedShapingConfig = {
            type: 'phases',
            config: {
                phases: configData.phases,
                construction: configData.construction,
                calculation: configData.calculation,
                description: configData.description
            }
        };

        // Update the step with new shaping data
        const updatedWizardConfig = {
            ...step.wizardConfig,
            shapingConfig: updatedShapingConfig
        };

        // Regenerate description
        const mockStep = {
            ...step,
            wizardConfig: updatedWizardConfig,
            endingStitches: configData.calculation.endingStitches,
            totalRows: configData.calculation.totalRows
        };
        const regeneratedDescription = getHumanReadableDescription(mockStep);

        // Update step with new data
        const updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig,
            endingStitches: configData.calculation.endingStitches,
            totalRows: configData.calculation.totalRows,
            description: regeneratedDescription
        };

        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: updatedStep
            }
        });

        onBack();
    };

    // Create dummy wizard data for compatibility
    const wizardData = {
        stitchPattern: step.wizardConfig?.stitchPattern || {}
    };

    // ===== RENDER =====
    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="app-container bg-white min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                <div className="bg-yarn-50 min-h-screen">
                    {/* Use the main PhaseConfig component */}
                    <PhaseConfig
                        shapingData={shapingData}
                        setShapingData={setShapingData}
                        currentStitches={currentStitches}
                        construction={construction}
                        componentIndex={componentIndex}
                        onExitToComponentSteps={onBack}
                        onComplete={handleComplete}
                        onCancel={onBack}
                        onBack={onBack}
                        wizardData={wizardData}
                        onGoToLanding={onGoToLanding}
                        mode="edit"
                        wizard={{
                            wizardData,
                            construction,
                            currentStitches,
                            updateWizardData: () => { } // Dummy function for compatibility
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditSequentialPhasesForm;