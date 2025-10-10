// src/features/steps/components/edit/EditStepRouter.jsx
import React from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import EditDurationForm from './EditDurationForm';
import EditPatternModal from './EditPatternModal';
import EditConfigScreen from './EditConfigScreen';
import EditEvenDistributionForm from './EditEvenDistributionForm';
import EditSequentialPhasesForm from './EditSequentialPhasesForm';
import EditStripesForm from './EditStripesForm';
import {
    getStepPatternName,
    isInitializationStep,
    isFinishingStep
} from '../../../../shared/utils/stepDisplayUtils';

/**
 * EditStepRouter - Smart routing for step editing
 * 
 * Routes to the appropriate edit screen based on:
 * - editType prop (specific edit requested)
 * - Step characteristics (pattern type, shaping, etc.)
 * 
 * This replaces the conditional logic in ManageSteps and provides
 * a clean separation between CREATE (StepWizard) and EDIT flows
 */
const EditStepRouter = ({
    componentIndex,
    editingStepIndex,
    editType,
    onBack,
    onGoToLanding
}) => {
    const { currentProject } = useProjectsContext();

    // Validation
    if (!currentProject ||
        componentIndex === null ||
        !currentProject.components[componentIndex] ||
        editingStepIndex === null) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">
                        {!currentProject ? 'Project not found' : 'Step not found'}
                    </h3>
                    <button onClick={onBack} className="btn-primary btn-sm">
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
                    <button onClick={onBack} className="btn-primary btn-sm">
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    // Common props for all edit screens
    const commonProps = {
        componentIndex,
        editingStepIndex,
        onBack,
        onGoToLanding
    };

    // ===== SPECIFIC EDIT TYPE ROUTING =====
    // When ManageSteps specifies exactly what to edit

    if (editType === 'pattern') {
        const patternName = getStepPatternName(step);

        // Stripes has dedicated editor
        if (patternName === 'Stripes') {
            return <EditStripesForm {...commonProps} />;
        }

        // Custom pattern with row-by-row entry mode
        if (patternName === 'Custom' && step.wizardConfig?.stitchPattern?.entryMode === 'row_by_row') {
            // TODO: Create EditCustomRowByRowForm if needed
            // For now, return null and let ManageSteps handle via modal
            return null;
        }

        // All other patterns use modal (handled by ManageSteps)
        return null;
    }

    if (editType === 'duration') {
        return <EditDurationForm {...commonProps} />;
    }

    if (editType === 'shaping') {
        // Route to appropriate shaping editor based on shaping type
        const shapingType = step.wizardConfig?.shapingConfig?.type ||
            step.advancedWizardConfig?.shapingConfig?.type;

        if (shapingType === 'even_distribution') {
            return <EditEvenDistributionForm {...commonProps} />;
        }

        if (shapingType === 'phases') {
            return <EditSequentialPhasesForm {...commonProps} />;
        }

        // No shaping or unknown type
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">🚧</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">
                        Shaping Editor Not Available
                    </h3>
                    <p className="text-sm text-wool-500 mb-4">
                        This shaping type doesn't have an editor yet
                    </p>
                    <button onClick={onBack} className="btn-primary btn-sm">
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    if (editType === 'config' || editType === 'configuration') {
        // EditConfigScreen is actually a router itself for different configs
        return <EditConfigScreen {...commonProps} />;
    }

    // ===== REMOVED: 'rowByRow' editType - no longer needed =====
    // Custom patterns now handled via 'pattern' editType above

    // ===== FULL STEP EDIT ROUTING =====
    // When no specific editType, determine based on step characteristics

    if (!editType || editType === 'full') {
        // Special handling for different step types

        // Initialization steps (Cast On, Pick Up & Knit, etc.)
        if (isInitializationStep(step)) {
            return (
                <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                    <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                        <div className="text-4xl mb-4">🚧</div>
                        <h3 className="text-lg font-medium text-wool-600 mb-2">
                            Initialization Step Editor
                        </h3>
                        <p className="text-sm text-wool-500 mb-4">
                            Editing initialization steps is not yet supported.
                            Delete and recreate the component to change the setup.
                        </p>
                        <button onClick={onBack} className="btn-primary btn-sm">
                            ← Back
                        </button>
                    </div>
                </div>
            );
        }

        // Finishing steps (Bind Off, Put on Holder)
        if (isFinishingStep(step)) {
            return (
                <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                    <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                        <div className="text-4xl mb-4">🏁</div>
                        <h3 className="text-lg font-medium text-wool-600 mb-2">
                            Finishing Step Editor
                        </h3>
                        <p className="text-sm text-wool-500 mb-4">
                            Use the pattern or configuration editors to modify this step
                        </p>
                        <button onClick={onBack} className="btn-primary btn-sm">
                            ← Back
                        </button>
                    </div>
                </div>
            );
        }

        // Regular working steps - determine what needs editing
        const hasShaping = step.wizardConfig?.hasShaping ||
            step.advancedWizardConfig?.hasShaping;

        // If it has shaping, go to shaping editor
        if (hasShaping) {
            const shapingType = step.wizardConfig?.shapingConfig?.type ||
                step.advancedWizardConfig?.shapingConfig?.type;

            if (shapingType === 'even_distribution') {
                return <EditEvenDistributionForm {...commonProps} />;
            }

            if (shapingType === 'phases') {
                return <EditSequentialPhasesForm {...commonProps} />;
            }
        }

        // Default to configuration screen (which is itself a router)
        return <EditConfigScreen {...commonProps} />;
    }

    // ===== FALLBACK =====
    // If we don't know how to handle this edit type
    return (
        <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-lg font-medium text-wool-600 mb-2">
                    Unknown Edit Type
                </h3>
                <p className="text-sm text-wool-500 mb-4">
                    Edit type "{editType}" is not recognized
                </p>
                <button onClick={onBack} className="btn-primary btn-sm">
                    ← Back
                </button>
            </div>
        </div>
    );
};

export default EditStepRouter;