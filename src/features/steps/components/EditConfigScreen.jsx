// src/features/steps/components/EditConfigScreen.jsx
import React from 'react';
import EditDurationForm from './EditDurationForm';
import EvenDistributionConfig from './shaping-wizard/EvenDistributionConfig';
import PhaseConfig from './shaping-wizard/PhaseConfig';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';

const EditConfigScreen = ({
    componentIndex,
    editingStepIndex,
    onBack
}) => {
    const { currentProject } = useProjectsContext();

    // Component validation
    if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
                    <button
                        onClick={onBack}
                        className="btn-primary btn-sm"
                    >
                        ← Back
                    </button>
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
                    <button
                        onClick={onBack}
                        className="btn-primary btn-sm"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    // Determine configuration type from step data
    const getConfigType = () => {
        // Check if step has shaping - use wizardConfig first, then advancedWizardConfig
        const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;

        if (hasShaping) {
            // Determine shaping type from wizardConfig first, then advancedWizardConfig
            const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;
            const shapingType = shapingConfig?.type;

            if (shapingType === 'even_distribution') {
                return 'even_distribution';
            } else if (shapingType === 'phases') {
                return 'sequential_phases';
            }

            // Legacy shaping detection - assume even distribution for legacy
            if (shapingConfig && Object.keys(shapingConfig).length > 0) {
                return 'even_distribution';
            }
        }

        // No shaping = duration configuration
        return 'duration';
    };

    const configType = getConfigType();

    // Get current stitches (needed for shaping components)
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) {
            return step.startingStitches || 0;
        }

        // Get from previous step
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };

    const currentStitches = getCurrentStitches();
    const construction = step.construction || 'flat';

    // Render appropriate configuration component
    switch (configType) {
        case 'duration':
            return (
                <EditDurationForm
                    componentIndex={componentIndex}
                    editingStepIndex={editingStepIndex}
                    onBack={onBack}
                />
            );

        case 'even_distribution':
            return (
                <div className="min-h-screen bg-yarn-50">
                    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
                        <EvenDistributionConfig
                            shapingData={step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig || {}}
                            setShapingData={() => { }} // Component handles its own save logic
                            currentStitches={currentStitches}
                            construction={construction}
                            componentIndex={componentIndex}
                            editingStepIndex={editingStepIndex}
                            onExitToComponentSteps={onBack}
                            onComplete={onBack}
                            onBack={onBack}
                            wizardData={step.wizardConfig}
                        />
                    </div>
                </div>
            );

        case 'sequential_phases':
            return (
                <div className="min-h-screen bg-yarn-50">
                    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
                        <PhaseConfig
                            shapingData={step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig || {}}
                            setShapingData={() => { }} // Component handles its own save logic
                            currentStitches={currentStitches}
                            construction={construction}
                            componentIndex={componentIndex}
                            onExitToComponentSteps={onBack}
                            onComplete={onBack}
                            onBack={onBack}
                            wizardData={step.wizardConfig}
                        />
                    </div>
                </div>
            );

        default:
            return (
                <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                    <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                        <div className="text-4xl mb-4">❓</div>
                        <h3 className="text-lg font-medium text-wool-600 mb-2">Unknown configuration type</h3>
                        <p className="text-sm text-wool-500 mb-4">This step's configuration cannot be edited.</p>
                        <button
                            onClick={onBack}
                            className="btn-primary btn-sm"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            );
    }
};

export default EditConfigScreen;