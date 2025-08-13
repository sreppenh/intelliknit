// src/features/steps/components/EditEvenDistributionForm.jsx
import React from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import PageHeader from '../../../../shared/components/PageHeader';
import EvenDistributionForm from '../shaping-wizard/EvenDistributionForm';

/**
 * EditEvenDistributionForm - Thin wrapper around EvenDistributionForm
 * 
 * This replaces the 284-line duplicate with a simple wrapper that reuses
 * the new EvenDistributionForm component in edit mode.
 */
const EditEvenDistributionForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();

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

    const construction = step.construction || 'flat';

    // Get current stitches for calculations
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) {
            return step.startingStitches || 0;
        }
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };

    const currentStitches = getCurrentStitches();

    // Get existing configuration
    const existingConfig = step.wizardConfig?.shapingConfig?.config || {};

    // ===== SAVE HANDLER =====
    const handleSave = (configData) => {
        // Create updated shaping configuration
        const updatedShapingConfig = {
            type: 'even_distribution',
            config: {
                action: configData.action,
                amount: configData.amount,
                description: configData.description,
                construction: construction,
                calculation: configData.calculation
            }
        };

        // Update the step with new shaping data
        const updatedWizardConfig = {
            ...step.wizardConfig,
            shapingConfig: updatedShapingConfig
        };

        // Update step with new ending stitches from calculation
        const updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig,
            endingStitches: configData.calculation.endingStitches,
            description: configData.calculation.instruction // Update description with new instruction
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

                <div className="p-6 bg-yarn-50">
                    {/* Use the extracted EvenDistributionForm */}
                    <EvenDistributionForm
                        currentStitches={currentStitches}
                        construction={construction}
                        initialConfig={existingConfig}
                        mode="edit"
                        onSave={handleSave}
                        onCancel={onBack}
                        showSaveActions={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditEvenDistributionForm;