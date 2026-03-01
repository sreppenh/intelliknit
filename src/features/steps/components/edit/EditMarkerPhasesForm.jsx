// src/features/steps/components/edit/EditMarkerPhasesForm.jsx
import React from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import MarkerPhasesConfig from '../shaping-wizard/MarkerPhasesConfig';
import { getHumanReadableDescription } from '../../../../shared/utils/stepDescriptionUtils';

/**
 * EditMarkerPhasesForm - Thin wrapper around MarkerPhasesConfig for edit mode.
 *
 * Mirrors the pattern of EditSequentialPhasesForm. Passes existing config
 * back into MarkerPhasesConfig via existingConfig + initialScreen so the
 * component pre-populates its state and skips the marker-setup screen.
 *
 * MarkerPhasesConfig saves itself via saveStepAndNavigate, passing
 * editingStepIndex so the reducer fires UPDATE_STEP instead of ADD_STEP.
 */
const EditMarkerPhasesForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject } = useProjectsContext();

    // ===== VALIDATION =====
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

    // Current stitches = ending stitches of the previous step
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) return step.startingStitches || 0;
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };
    const currentStitches = getCurrentStitches();

    // Pull existing shaping config to pre-populate MarkerPhasesConfig
    const existingShapingConfig = step.wizardConfig?.shapingConfig?.config || {};

    // Dummy wizard object MarkerPhasesConfig needs for its header + saveStepAndNavigate
    const wizardData = {
        ...step.wizardConfig,
        stitchPattern: step.wizardConfig?.stitchPattern || {}
    };

    const dummyWizard = {
        wizardData,
        construction,
        currentStitches,
        updateWizardData: () => { }
    };

    return (
        <MarkerPhasesConfig
            // Context
            currentStitches={currentStitches}
            construction={construction}
            component={component}
            componentIndex={componentIndex}
            editingStepIndex={editingStepIndex}   // ← key: triggers UPDATE_STEP in saveStepAndNavigate
            // Pre-populate from saved config so marker-setup screen is skipped
            existingConfig={existingShapingConfig}
            initialScreen="instruction-builder"
            // Compatibility props
            wizardData={wizardData}
            wizard={dummyWizard}
            shapingData={{ type: 'marker_phases', config: existingShapingConfig }}
            setShapingData={() => { }}
            // Navigation
            onBack={onBack}
            onExitToComponentSteps={onBack}
            onGoToLanding={onGoToLanding}
            onCancel={onBack}
            onComplete={() => { }}              // Not used — component saves itself
            mode="edit"
        />
    );
};

export default EditMarkerPhasesForm;